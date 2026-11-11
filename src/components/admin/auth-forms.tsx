"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestAdminPasswordRecovery,
  signInAdmin,
  updateAdminPassword,
} from "@/lib/auth/actions";
import { initialAuthActionState } from "@/lib/auth/state";
import { PasswordField } from "./password-field";

function ActionMessage({
  message,
  status,
}: {
  message: string;
  status: "idle" | "success" | "error";
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`auth-form-message auth-form-message--${status}`}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

export function AdminSignInForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(
    signInAdmin,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="auth-form">
      <div className="field">
        <label className="field-label" htmlFor="admin-email">
          Email
        </label>
        <input
          aria-describedby={
            state.fieldErrors.email ? "admin-email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="username"
          className="field-control"
          id="admin-email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
        {state.fieldErrors.email ? (
          <p className="inquiry-field-error" id="admin-email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <PasswordField
        autoComplete="current-password"
        error={state.fieldErrors.password}
        id="admin-password"
        label="Password"
        name="password"
      />
      <input name="next" type="hidden" value={nextPath} />
      <ActionMessage message={state.message} status={state.status} />
      <button
        className="button button--primary auth-submit"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <Link className="text-link auth-secondary-link" href="/admin/forgot-password">
        Forgot password?
      </Link>
    </form>
  );
}

export function AdminRecoveryRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestAdminPasswordRecovery,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="auth-form">
      <div className="field">
        <label className="field-label" htmlFor="recovery-email">
          Admin email
        </label>
        <input
          aria-describedby={
            state.fieldErrors.email ? "recovery-email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors.email)}
          autoComplete="email"
          className="field-control"
          id="recovery-email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
        {state.fieldErrors.email ? (
          <p className="inquiry-field-error" id="recovery-email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <ActionMessage message={state.message} status={state.status} />
      <button
        className="button button--primary auth-submit"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending..." : "Send recovery email"}
      </button>
      <Link className="text-link auth-secondary-link" href="/admin/login">
        Return to sign in
      </Link>
    </form>
  );
}

export function AdminPasswordResetForm() {
  const [state, formAction, pending] = useActionState(
    updateAdminPassword,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="auth-form">
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors.password}
        id="new-admin-password"
        label="New password"
        name="password"
      />
      <p className="field-hint">
        Use at least 15 characters. A longer passphrase is easier to remember.
      </p>
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors.passwordConfirmation}
        id="confirm-admin-password"
        label="Confirm new password"
        name="passwordConfirmation"
      />
      <ActionMessage message={state.message} status={state.status} />
      <button
        className="button button--primary auth-submit"
        disabled={pending}
        type="submit"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
      <Link className="text-link auth-secondary-link" href="/admin/login">
        Return to sign in
      </Link>
    </form>
  );
}
