import "server-only";

const verificationUrl =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const expectedAction = "rhema_inquiry";

type TurnstileResponse = {
  success: boolean;
  action?: string;
};

function isTurnstileResponse(value: unknown): value is TurnstileResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof value.success === "boolean" &&
    "action" in value &&
    typeof value.action === "string"
  );
}

export async function verifyTurnstileToken(
  token: string,
  secret: string,
  request: typeof fetch = fetch,
): Promise<boolean> {
  let response: Response;

  try {
    response = await request(verificationUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    console.error("Turnstile verification request failed.");
    return false;
  }

  if (!response.ok) {
    console.error(
      `Turnstile verification returned HTTP ${response.status}.`,
    );
    return false;
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    console.error("Turnstile verification returned invalid JSON.");
    return false;
  }

  return (
    isTurnstileResponse(payload) &&
    payload.success &&
    payload.action === expectedAction
  );
}
