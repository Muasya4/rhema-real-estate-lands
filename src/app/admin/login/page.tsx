import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSignInForm } from "@/components/admin/auth-forms";
import { getSafeAdminPath } from "@/lib/auth/policy";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    "password-updated"?: string;
    "session-revocation"?: string;
    "signed-out"?: string;
  }>;
};

async function LoginContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeAdminPath(params.next);

  return (
    <>
      {params["password-updated"] === "1" ? (
        <p className="auth-notice" role="status">
          Your password has been updated. Sign in with the new password.
        </p>
      ) : null}
      {params["session-revocation"] === "failed" ? (
        <p className="auth-notice auth-notice--error" role="alert">
          We could not confirm that every active session was revoked. Close
          other sessions and contact Rhema before continuing.
        </p>
      ) : null}
      {params["signed-out"] === "1" ? (
        <p className="auth-notice" role="status">
          You have been signed out.
        </p>
      ) : null}
      <AdminSignInForm nextPath={nextPath} />
    </>
  );
}

export default function AdminLoginPage(props: LoginPageProps) {
  return (
    <main className="auth-page" id="main-content">
      <div className="auth-panel">
        <Link aria-label="Rhema Real Estates home" className="auth-brand" href="/">
          <span>Rhema</span>
          <span>Real Estates</span>
        </Link>
        <h1 className="auth-title">Admin sign in</h1>
        <p className="auth-description">
          Sign in with the email address provisioned for Rhema administration.
        </p>
        <Suspense fallback={<p className="auth-loading">Loading sign-in...</p>}>
          <LoginContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
