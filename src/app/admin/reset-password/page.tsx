import type { Metadata } from "next";
import Link from "next/link";
import { AdminPasswordResetForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = {
  title: "Set a new admin password",
  robots: { index: false, follow: false },
};

export default function AdminResetPasswordPage() {
  return (
    <main className="auth-page" id="main-content">
      <div className="auth-panel">
        <Link aria-label="Rhema Real Estates home" className="auth-brand" href="/">
          <span>Rhema</span>
          <span>Real Estates</span>
        </Link>
        <h1 className="auth-title">Choose a new password</h1>
        <p className="auth-description">
          Use a password you have not used for another account.
        </p>
        <AdminPasswordResetForm />
      </div>
    </main>
  );
}
