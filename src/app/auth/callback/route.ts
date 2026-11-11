import { connection, NextResponse, type NextRequest } from "next/server";
import { getSafeAdminPath } from "@/lib/auth/policy";
import { getAuthSiteUrl } from "@/lib/auth/site-url";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

function redirectWithoutAuthCode(path: string, siteUrl: string) {
  const response = NextResponse.redirect(new URL(path, siteUrl), 303);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  await connection();
  const siteUrl = getAuthSiteUrl();
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeAdminPath(
    request.nextUrl.searchParams.get("next"),
  );

  if (!code) {
    return redirectWithoutAuthCode(
      "/admin/forgot-password?recovery=invalid",
      siteUrl,
    );
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      `Admin Auth callback failed: ${error.code ?? "unknown"}.`,
    );
    return redirectWithoutAuthCode(
      "/admin/forgot-password?recovery=invalid",
      siteUrl,
    );
  }

  return redirectWithoutAuthCode(nextPath, siteUrl);
}
