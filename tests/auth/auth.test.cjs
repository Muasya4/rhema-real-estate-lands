/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");
const policyModulePath = require.resolve("../../src/lib/auth/policy.ts");

const originalLoad = Module._load;
let currentAdmin = { id: "admin-id", email: "admin@example.invalid" };
let currentClient;
let recoverySiteUrl = "https://admin.example.invalid";
let callbackResponse = { error: null };
let callbackExchangeCode = "";

class RedirectSignal extends Error {
  constructor(destination) {
    super(destination);
    this.destination = destination;
  }
}

Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }
  if (request === "next/navigation") {
    return {
      redirect(destination) {
        throw new RedirectSignal(destination);
      },
    };
  }
  if (request === "next/server") {
    return {
      async connection() {},
      NextResponse: {
        redirect(url, status) {
          const headers = new Map([
            ["location", url.toString()],
          ]);
          return {
            status,
            headers: {
              get(name) {
                return headers.get(name.toLowerCase()) ?? null;
              },
              set(name, value) {
                headers.set(name.toLowerCase(), value);
              },
              get location() {
                return headers.get("location");
              },
            },
          };
        },
      },
    };
  }
  if (request === "@/lib/supabase/auth-server") {
    return { createSupabaseAuthServerClient: async () => currentClient };
  }
  if (request === "@/lib/supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }
  if (request === "@/lib/auth/guard") {
    return { getCurrentAdmin: async () => currentAdmin };
  }
  if (request === "./guard") {
    return { getCurrentAdmin: async () => currentAdmin };
  }
  if (request === "@/lib/auth/site-url") {
    return { getAuthSiteUrl: () => recoverySiteUrl };
  }
  if (request === "./site-url") {
    return { getAuthSiteUrl: () => recoverySiteUrl };
  }
  if (request === "@/lib/auth/policy") {
    return originalLoad.call(this, policyModulePath, parent, isMain);
  }
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions[".ts"] = (module, filename) => {
  const fs = require("node:fs");
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  module._compile(output, filename);
};

const {
  getSafeAdminPath,
  isValidAdminEmail,
  minimumAdminPasswordLength,
  normalizeAdminEmail,
  validateNewAdminPassword,
} = require("../../src/lib/auth/policy.ts");
const { initialAuthActionState } = require("../../src/lib/auth/state.ts");
const authActions = require("../../src/lib/auth/actions.ts");

function createClient(overrides = {}, signOutResponses = []) {
  const calls = { signIn: [], signOut: [], recovery: [], update: [] };
  currentClient = {
    auth: {
      async signInWithPassword(credentials) {
        calls.signIn.push(credentials);
        return { error: null };
      },
      async signOut(options) {
        calls.signOut.push(options);
        return { error: signOutResponses.shift() ?? null };
      },
      async resetPasswordForEmail(email, options) {
        calls.recovery.push({ email, options });
        return { error: null };
      },
      async updateUser(values) {
        calls.update.push(values);
        return { error: null };
      },
      async exchangeCodeForSession(code) {
        callbackExchangeCode = code;
        return callbackResponse;
      },
      ...overrides.auth,
    },
  };
  return calls;
}

function formData(values) {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) {
    data.set(name, value);
  }
  return data;
}

test("normalizes and validates email without revealing an account lookup", () => {
  assert.equal(normalizeAdminEmail(" Admin@Example.Invalid "), "admin@example.invalid");
  assert.equal(isValidAdminEmail("admin@example.invalid"), true);
  assert.equal(isValidAdminEmail("not-an-email"), false);
});

test("allows safe admin return paths and rejects external destinations", () => {
  assert.equal(getSafeAdminPath("/admin/properties?view=drafts"), "/admin/properties?view=drafts");
  assert.equal(getSafeAdminPath("https://evil.example/"), "/admin");
  assert.equal(getSafeAdminPath("//evil.example/admin"), "/admin");
  assert.equal(getSafeAdminPath("/contact"), "/admin");
  assert.equal(getSafeAdminPath("/admin\\@evil.example"), "/admin");
});

test("requires a 15-character password and matching confirmation", () => {
  assert.equal(minimumAdminPasswordLength, 15);
  assert.ok(validateNewAdminPassword("short", "short").password);
  assert.ok(
    validateNewAdminPassword("long-enough-password", "another-password")
      .passwordConfirmation,
  );
  assert.deepEqual(
    validateNewAdminPassword(
      "long-enough-password",
      "long-enough-password",
    ),
    {},
  );
});

test("signs in admins and redirects only to a safe admin route", async () => {
  const calls = createClient();
  currentAdmin = { id: "admin-id", email: "admin@example.invalid" };

  await assert.rejects(
    authActions.signInAdmin(
    initialAuthActionState,
      formData({
        email: "ADMIN@example.invalid",
        password: "passphrase",
        next: "https://evil.example",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal && error.destination === "/admin",
  );

  assert.deepEqual(calls.signIn, [
    { email: "admin@example.invalid", password: "passphrase" },
  ]);
});

test("rejects a signed-in non-admin and clears the local session", async () => {
  const calls = createClient();
  currentAdmin = null;

  const result = await authActions.signInAdmin(
    initialAuthActionState,
    formData({ email: "user@example.invalid", password: "passphrase" }),
  );

  assert.equal(result.status, "error");
  assert.match(result.message, /could not sign you in/i);
  assert.deepEqual(calls.signOut, [{ scope: "local" }]);
  currentAdmin = { id: "admin-id", email: "admin@example.invalid" };
});

test("returns the same recovery confirmation for an accepted email", async () => {
  const calls = createClient();

  const result = await authActions.requestAdminPasswordRecovery(
    initialAuthActionState,
    formData({ email: "Admin@Example.Invalid" }),
  );

  assert.deepEqual(result, {
    status: "success",
    message:
      "If an account exists for that email, recovery instructions will be sent.",
    fieldErrors: {},
  });
  assert.equal(calls.recovery[0].email, "admin@example.invalid");
  assert.equal(
    calls.recovery[0].options.redirectTo,
    "https://admin.example.invalid/auth/callback?next=%2Fadmin%2Freset-password",
  );
});

test("does not update a password until length and confirmation pass", async () => {
  const calls = createClient();
  currentAdmin = { id: "admin-id", email: "admin@example.invalid" };

  const result = await authActions.updateAdminPassword(
    initialAuthActionState,
    formData({
      password: "too-short",
      passwordConfirmation: "too-short",
    }),
  );

  assert.equal(result.status, "error");
  assert.equal(calls.update.length, 0);
});

test("updates a recovered admin password and revokes sessions", async () => {
  const calls = createClient();
  currentAdmin = { id: "admin-id", email: "admin@example.invalid" };

  await assert.rejects(
    authActions.updateAdminPassword(
      initialAuthActionState,
      formData({
        password: "correct-horse-battery-staple",
        passwordConfirmation: "correct-horse-battery-staple",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination === "/admin/login?password-updated=1",
  );

  assert.deepEqual(calls.update, [
    { password: "correct-horse-battery-staple" },
  ]);
  assert.deepEqual(calls.signOut, [{ scope: "global" }]);
});

test("warns when password update cannot revoke every session", async () => {
  const calls = createClient({}, [
    { code: "global_revocation_failed" },
    { code: "local_sign_out_failed" },
  ]);
  currentAdmin = { id: "admin-id", email: "admin@example.invalid" };

  await assert.rejects(
    authActions.updateAdminPassword(
      initialAuthActionState,
      formData({
        password: "correct-horse-battery-staple",
        passwordConfirmation: "correct-horse-battery-staple",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination ===
        "/admin/login?password-updated=1&session-revocation=failed",
  );

  assert.deepEqual(calls.signOut, [
    { scope: "global" },
    { scope: "local" },
  ]);
});

test("exchanges only recovery callback codes and redirects to the fixed app origin", async () => {
  const { GET } = require("../../src/app/auth/callback/route.ts");
  const calls = createClient();

  const response = await GET({
    nextUrl: new URL(
      "https://admin.example.invalid/auth/callback?code=one-time-code&next=https%3A%2F%2Fevil.example",
    ),
  });

  assert.equal(callbackExchangeCode, "one-time-code");
  assert.equal(
    response.headers.location,
    "https://admin.example.invalid/admin",
  );
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(calls.signIn.length, 0);

  const validResponse = await GET({
    nextUrl: new URL(
      "https://admin.example.invalid/auth/callback?code=second-code&next=%2Fadmin%2Freset-password",
    ),
  });

  assert.equal(callbackExchangeCode, "second-code");
  assert.equal(
    validResponse.headers.location,
    "https://admin.example.invalid/admin/reset-password",
  );
});

test("admin guard verifies the current user and reads the live role row", async () => {
  const guard = require("../../src/lib/auth/guard.ts");
  let queriedUserId = "";
  let role = { role: "admin" };
  currentClient = {
    auth: {
      async getUser() {
        return {
          data: { user: { id: "verified-user", email: "admin@example.invalid" } },
          error: null,
        };
      },
    },
    from(table) {
      assert.equal(table, "admin_roles");
      return {
        select(columns) {
          assert.equal(columns, "role");
          return this;
        },
        eq(field, value) {
          assert.equal(field, "user_id");
          queriedUserId = value;
          return this;
        },
        async maybeSingle() {
          return { data: role, error: null };
        },
      };
    },
  };

  assert.deepEqual(await guard.getCurrentAdmin(), {
    id: "verified-user",
    email: "admin@example.invalid",
  });
  assert.equal(queriedUserId, "verified-user");

  role = null;
  assert.equal(await guard.getCurrentAdmin(), null);
});

test("admin guard fails closed for an invalid Auth user", async () => {
  const guard = require("../../src/lib/auth/guard.ts");
  currentClient = {
    auth: {
      async getUser() {
        return { data: { user: null }, error: new Error("invalid token") };
      },
    },
    from() {
      throw new Error("A missing user must not trigger a role query.");
    },
  };

  assert.equal(await guard.getCurrentAdmin(), null);
});
