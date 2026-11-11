"use client";

import Script from "next/script";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiry } from "@/lib/inquiries/actions";
import type { InquiryActionState } from "@/lib/inquiries/submission";
import { inquiryFieldLimits } from "@/lib/inquiries/validation";

type TurnstileOptions = {
  action: string;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  sitekey: string;
  theme: "light";
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const initialState: InquiryActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function InquiryForm({
  propertyId = "",
  siteKey,
}: {
  propertyId?: string;
  siteKey: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitInquiry,
    initialState,
  );
  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [widgetError, setWidgetError] = useState(false);
  const [submittedToken, setSubmittedToken] = useState("");
  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (
      !siteKey ||
      !scriptReady ||
      !window.turnstile ||
      !widgetContainer.current
    ) {
      return;
    }

    widgetId.current = window.turnstile.render(widgetContainer.current, {
      action: "rhema_inquiry",
      callback: (token) => {
        setTurnstileToken(token);
        setWidgetError(false);
      },
      "error-callback": () => {
        setTurnstileToken("");
        setWidgetError(true);
      },
      "expired-callback": () => setTurnstileToken(""),
      sitekey: siteKey,
      theme: "light",
    });

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  useEffect(() => {
    if (state.status === "idle") {
      return;
    }

    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }

    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  if (!siteKey) {
    return (
      <p className="inquiry-form-notice" role="status">
        The inquiry form is not available yet. Call or WhatsApp Rhema to ask
        about land in its service areas.
      </p>
    );
  }

  const fieldErrors = state.fieldErrors;

  return (
    <form
      action={formAction}
      className="inquiry-form"
      noValidate
      onSubmit={() => {
        setSubmittedToken(turnstileToken);
      }}
      ref={formRef}
    >
      <div className="field-grid">
        <div className="field">
          <label className="field-label" htmlFor="inquiry-name">
            Name
          </label>
          <input
            aria-describedby={fieldErrors.name ? "inquiry-name-error" : undefined}
            aria-invalid={Boolean(fieldErrors.name)}
            autoComplete="name"
            className="field-control"
            id="inquiry-name"
            maxLength={inquiryFieldLimits.name}
            name="name"
            required
          />
          {fieldErrors.name && (
            <p className="inquiry-field-error" id="inquiry-name-error">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="inquiry-email">
            Email
          </label>
          <input
            aria-describedby={
              fieldErrors.email ? "inquiry-email-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            className="field-control"
            id="inquiry-email"
            maxLength={inquiryFieldLimits.email}
            name="email"
            required
            type="email"
          />
          {fieldErrors.email && (
            <p className="inquiry-field-error" id="inquiry-email-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="inquiry-phone">
            Phone
          </label>
          <input
            aria-describedby={
              fieldErrors.phone ? "inquiry-phone-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.phone)}
            autoComplete="tel"
            className="field-control"
            id="inquiry-phone"
            maxLength={inquiryFieldLimits.phone}
            name="phone"
            required
            type="tel"
          />
          {fieldErrors.phone && (
            <p className="inquiry-field-error" id="inquiry-phone-error">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        <div className="field inquiry-message-field">
          <label className="field-label" htmlFor="inquiry-message">
            Message
          </label>
          <textarea
            aria-describedby={
              fieldErrors.message ? "inquiry-message-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.message)}
            className="field-control field-control--textarea"
            id="inquiry-message"
            maxLength={inquiryFieldLimits.message}
            name="message"
            required
            rows={5}
          />
          {fieldErrors.message && (
            <p className="inquiry-field-error" id="inquiry-message-error">
              {fieldErrors.message}
            </p>
          )}
        </div>
      </div>

      <input name="propertyId" type="hidden" value={propertyId} />
      <div aria-hidden="true" className="inquiry-honeypot">
        <label htmlFor="inquiry-website">Leave this field empty</label>
        <input
          autoComplete="off"
          id="inquiry-website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className="inquiry-security">
        <p className="field-label" id="inquiry-security-label">
          Security check
        </p>
        <Script
          onError={() => setWidgetError(true)}
          onReady={() => setScriptReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
        <div
          aria-describedby="inquiry-security-label"
          className="inquiry-turnstile"
          ref={widgetContainer}
        />
        <input
          name="turnstileToken"
          type="hidden"
          value={turnstileToken}
        />
        <p aria-live="polite" className="inquiry-field-error">
          {widgetError
            ? "The security check did not load. Please reload or contact Rhema."
            : ""}
        </p>
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={`inquiry-form-message inquiry-form-message--${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}

      <button
        className="button button--primary inquiry-submit"
        disabled={
          pending ||
          !turnstileToken ||
          turnstileToken === submittedToken ||
          widgetError ||
          state.status === "success"
        }
        type="submit"
      >
        {pending ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
