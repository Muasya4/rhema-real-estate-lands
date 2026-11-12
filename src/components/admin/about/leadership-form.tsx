"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  initialLeadershipActionState,
  type LeadershipActionState,
} from "@/lib/admin/about/state";
import { saveLeadershipProfile } from "@/lib/admin/about/actions";
import type { LeadershipProfile } from "@/lib/leadership/model";

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) return null;
  return (
    <p className="admin-field-error" id={id} role="alert">
      {message}
    </p>
  );
}

function FormMessage({ state }: { state: LeadershipActionState }) {
  if (!state.message) return null;
  return (
    <p
      aria-live="polite"
      className={`admin-form-message admin-form-message--${state.status}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function LeadershipForm({
  profile,
  imageSrc,
  saved,
  storageWarning,
}: {
  profile: LeadershipProfile;
  imageSrc: string | null;
  saved: boolean;
  storageWarning: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveLeadershipProfile,
    initialLeadershipActionState,
  );

  return (
    <form action={formAction} className="admin-property-form">
      {saved ? (
        <p className="admin-form-message admin-form-message--success" role="status">
          CEO profile saved.
        </p>
      ) : null}
      {storageWarning ? (
        <p className="admin-form-message admin-form-message--warning" role="status">
          The profile was saved, but the previous portrait remains in Storage.
        </p>
      ) : null}
      <FormMessage state={state} />

      <section aria-labelledby="leadership-fields-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="leadership-fields-title">
          CEO details
        </h2>
        <div className="admin-form-grid">
          <div className="field">
            <label className="field-label" htmlFor="leadership-name">
              Name
            </label>
            <input
              aria-describedby={state.fieldErrors.fullName ? "leadership-name-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.fullName)}
              className="field-control"
              defaultValue={profile.fullName}
              id="leadership-name"
              maxLength={100}
              name="fullName"
              required
            />
            <FieldError
              id="leadership-name-error"
              message={state.fieldErrors.fullName}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="leadership-title">
              Role
            </label>
            <input
              aria-describedby={state.fieldErrors.title ? "leadership-title-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.title)}
              className="field-control"
              defaultValue={profile.title}
              id="leadership-title"
              maxLength={100}
              name="title"
              required
            />
            <FieldError
              id="leadership-title-error"
              message={state.fieldErrors.title}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="leadership-email">
              Email address
            </label>
            <input
              aria-describedby={state.fieldErrors.email ? "leadership-email-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.email)}
              autoComplete="email"
              className="field-control"
              defaultValue={profile.email}
              id="leadership-email"
              maxLength={254}
              name="email"
              required
              type="email"
            />
            <FieldError
              id="leadership-email-error"
              message={state.fieldErrors.email}
            />
          </div>
          <div className="field admin-leadership-biography">
            <label className="field-label" htmlFor="leadership-biography">
              Biography
            </label>
            <textarea
              aria-describedby={
                state.fieldErrors.biography
                  ? "leadership-biography-hint leadership-biography-error"
                  : "leadership-biography-hint"
              }
              aria-invalid={Boolean(state.fieldErrors.biography)}
              className="field-control"
              defaultValue={profile.biography ?? ""}
              id="leadership-biography"
              maxLength={2000}
              name="biography"
              rows={5}
            />
            <p className="field-hint" id="leadership-biography-hint">
              Optional. Add only details approved for publication. Up to 2,000
              characters.
            </p>
            <FieldError
              id="leadership-biography-error"
              message={state.fieldErrors.biography}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="leadership-image-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="leadership-image-title">
          Portrait image
        </h2>
        <p className="admin-form-section-description">
          Optional. Use a JPEG, PNG, or WebP image up to 5 MiB. The image is
          public on the website, so do not upload a confidential photo.
        </p>
        {imageSrc ? (
          <div className="admin-leadership-image-preview">
            <Image
              alt={`Current portrait of ${profile.fullName}`}
              fill
              sizes="(max-width: 760px) 100vw, 36rem"
              src={imageSrc}
            />
          </div>
        ) : (
          <p className="admin-empty-images">No portrait image is attached.</p>
        )}
        {profile.imagePath ? (
          <div className="admin-property-toggles">
            <label className="admin-checkbox" htmlFor="leadership-remove-image">
              <input
                id="leadership-remove-image"
                name="removeImage"
                type="checkbox"
                value="true"
              />
              <span>Remove current portrait</span>
            </label>
          </div>
        ) : null}
        <div className="field">
          <label className="field-label" htmlFor="leadership-image-file">
            {profile.imagePath ? "Replace portrait" : "Upload a portrait"}
          </label>
          <input
            aria-describedby={
              state.fieldErrors.imageFile ? "leadership-image-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors.imageFile)}
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="field-control admin-file-control"
            id="leadership-image-file"
            name="imageFile"
            type="file"
          />
          <FieldError
            id="leadership-image-error"
            message={state.fieldErrors.imageFile}
          />
        </div>
      </section>

      <div className="admin-property-form-actions">
        <button className="button button--primary" disabled={pending} type="submit">
          {pending ? "Saving profile..." : "Save CEO profile"}
        </button>
      </div>
    </form>
  );
}
