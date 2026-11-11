import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminRecoveryRequestForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = {
  title: "Recover admin password",
  robots: { index: false, follow: false },
};

type RecoveryPageProps = {
  searchParams: Promise<{ recovery?: string }>;
};

async function RecoveryContent({ searchParams }: RecoveryPageProps) {
  const params = await searchParams;

  return (
    <>
      {params.recovery === "invalid" ? (
        <p className="auth-notice" role="status">
          That recovery link has expired or is not valid. Request a new email.
        </p>
      ) : null}
      <AdminRecoveryRequestForm />
    </>
  );
}

export default function AdminForgotPasswordPage(props: RecoveryPageProps) {
  return (
    <main className="auth-page" id="main-content">
      <div className="auth-panel">
        <Link aria-label="Rhema Real Estates home" className="auth-brand" href="/">
          <span>Rhema</span>
          <span>Real Estates</span>
        </Link>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-description">
          Enter your admin email. If it matches an account, we will send a
          recovery link.
        </p>
        <Suspense
          fallback={<p className="auth-loading">Loading password recovery...</p>}
        >
          <RecoveryContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
