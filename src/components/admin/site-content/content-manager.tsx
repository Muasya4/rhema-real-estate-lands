"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HeroImageShape } from "@/components/ui/hero-image-shape";
import {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_SECTIONS,
  type SiteContent,
  type SiteContentField,
  type SiteContentImageField,
  type SiteContentSection,
} from "@/lib/site-content/defaults";
import {
  restoreSiteContent,
  saveSiteContentSection,
} from "@/lib/admin/site-content/actions";
import { siteContentFieldMaximumLength } from "@/lib/site-content/model";
import {
  initialSiteContentActionState,
  type SiteContentActionState,
} from "@/lib/admin/site-content/state";

function ActionMessage({ state }: { state: SiteContentActionState }) {
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

function ContentField({
  field,
  content,
  errorMessage,
}: {
  field: SiteContentField;
  content: SiteContent;
  errorMessage: string | undefined;
}) {
  const error = field.key.replaceAll(".", "-");
  const value = content[field.key];
  const defaultValue = SITE_CONTENT_DEFAULTS[field.key];
  const descriptionId = `${error}-default`;

  return (
    <div className="field site-content-field">
      <label className="field-label" htmlFor={error}>
        {field.label}
      </label>
      {field.multiline ? (
        <textarea
          aria-describedby={
            errorMessage
              ? `${error}-error${value !== defaultValue ? ` ${descriptionId}` : ""}`
              : value !== defaultValue
                ? descriptionId
                : undefined
          }
          aria-invalid={Boolean(errorMessage)}
          className="field-control field-control--textarea"
          defaultValue={value}
          id={error}
          maxLength={siteContentFieldMaximumLength}
          name={`content.${field.key}`}
          required
          rows={4}
        />
      ) : (
        <input
          aria-describedby={
            errorMessage
              ? `${error}-error${value !== defaultValue ? ` ${descriptionId}` : ""}`
              : value !== defaultValue
                ? descriptionId
                : undefined
          }
          aria-invalid={Boolean(errorMessage)}
          className="field-control"
          defaultValue={value}
          id={error}
          maxLength={siteContentFieldMaximumLength}
          name={`content.${field.key}`}
          required
        />
      )}
      {value !== defaultValue ? (
        <p className="field-hint" id={descriptionId}>
          Original wording: {defaultValue}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="admin-field-error" id={`${error}-error`} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function ContentImageField({
  field,
  content,
  errorMessage,
}: {
  field: SiteContentImageField;
  content: SiteContent;
  errorMessage: string | undefined;
}) {
  const inputId = `image-${field.key.replaceAll(".", "-")}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const previewImage = (
    <Image
      alt={content[field.altKey]}
      fill
      sizes="(max-width: 760px) 100vw, 40vw"
      src={previewUrl ?? content[field.key]}
    />
  );

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  return (
    <div className="field site-content-image-field">
      <label className="field-label" htmlFor={inputId}>
        {field.label}
      </label>
      {field.slot === "hero" ? (
        <HeroImageShape className="site-content-image-preview site-content-image-preview--hero">
          {previewImage}
        </HeroImageShape>
      ) : (
        <div className="site-content-image-preview">{previewImage}</div>
      )}
      <input
        aria-describedby={errorMessage ? `${hintId} ${errorId}` : hintId}
        aria-invalid={Boolean(errorMessage)}
        accept="image/jpeg,image/png,image/webp"
        className="field-control"
        id={inputId}
        name={`image.${field.key}`}
        onChange={(event) => {
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }
          const file = event.currentTarget.files?.[0];
          const nextUrl = file ? URL.createObjectURL(file) : null;
          previewUrlRef.current = nextUrl;
          setPreviewUrl(nextUrl);
        }}
        type="file"
      />
      <p className="field-hint" id={hintId}>
        Choose a JPEG, PNG, or WebP image up to 5 MiB.{" "}
        {field.slot === "hero"
          ? "The preview uses the same sculpted crop as the homepage."
          : "Its preview appears here."}{" "}
        Update the image description above to match the photo.
      </p>
      {errorMessage ? (
        <p className="admin-field-error" id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function RestoreForm({
  scope,
  label,
  hasImages,
}: {
  scope: string;
  label: string;
  hasImages: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    restoreSiteContent,
    initialSiteContentActionState,
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="site-content-restore">
      <form action={formAction} onSubmit={() => setConfirming(false)}>
        <input name="scope" type="hidden" value={scope} />
        {confirming ? (
          <div className="site-content-restore-confirm">
            <p>
              Restore this section to its original{" "}
              {hasImages ? "copy and images" : "copy"}? Saved changes in this
              section will be removed.
            </p>
            <button
              className="button button--primary-outlined"
              disabled={pending}
              type="submit"
            >
              {pending ? "Restoring..." : "Confirm restore"}
            </button>
            <button
              className="text-link"
              disabled={pending}
              onClick={() => setConfirming(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="button button--primary-outlined"
            disabled={pending}
            onClick={() => setConfirming(true)}
            type="button"
          >
            {pending ? "Restoring..." : label}
          </button>
        )}
      </form>
      <ActionMessage state={state} />
    </div>
  );
}

function ContentSection({
  section,
  content,
}: {
  section: SiteContentSection;
  content: SiteContent;
}) {
  const [state, formAction, pending] = useActionState(
    saveSiteContentSection,
    initialSiteContentActionState,
  );
  const formKey = JSON.stringify(
    [
      ...section.fields.map(({ key }) => content[key]),
      ...(section.images ?? []).map(({ key }) => content[key]),
    ],
  );
  const imageCount = section.images?.length ?? 0;
  const itemCount = section.fields.length + imageCount;

  return (
    <details className="site-content-section">
      <summary>
        <span>{section.title}</span>
        <span className="site-content-section-count">
          {itemCount} editable {itemCount === 1 ? "item" : "items"}
        </span>
      </summary>
      <form
        action={formAction}
        className="admin-property-form"
        encType="multipart/form-data"
        key={formKey}
      >
        <input name="sectionId" type="hidden" value={section.id} />
        <ActionMessage state={state} />
        <div className="site-content-fields">
          {section.fields.map((field) => (
            <ContentField
              content={content}
              errorMessage={state.fieldErrors[field.key]}
              field={field}
              key={field.key}
            />
          ))}
        </div>
        {section.images?.map((field) => (
          <ContentImageField
            content={content}
            errorMessage={state.fieldErrors[field.key]}
            field={field}
            key={field.key}
          />
        ))}
        <div className="admin-property-form-actions">
          <button
            className="button button--primary"
            disabled={pending}
            type="submit"
          >
            {pending ? "Saving..." : `Save ${section.title.toLowerCase()}`}
          </button>
        </div>
      </form>
      <RestoreForm
        label="Restore this section"
        hasImages={imageCount > 0}
        scope={section.id}
      />
    </details>
  );
}

export function ContentManager({ content }: { content: SiteContent }) {
  return (
    <div className="site-content-manager">
      <div className="site-content-manager-intro">
        <p>
          Edit page headings and descriptions, and replace the two homepage
          images. Navigation, links, forms, and other site controls stay fixed.
          Save or restore one section at a time.
        </p>
      </div>
      <nav aria-label="Content sections" className="site-content-index">
        {SITE_CONTENT_SECTIONS.map((section) => (
          <a href={`#content-${section.id}`} key={section.id}>
            {section.title}
          </a>
        ))}
      </nav>
      {SITE_CONTENT_SECTIONS.map((section) => (
        <div id={`content-${section.id}`} key={section.id}>
          <ContentSection content={content} section={section} />
        </div>
      ))}
    </div>
  );
}
