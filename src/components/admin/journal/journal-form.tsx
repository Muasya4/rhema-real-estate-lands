"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import type { AdminJournalPost } from "@/lib/journal/model";
import { slugify } from "@/lib/slug";
import { saveJournalPost } from "@/lib/admin/journal/actions";
import {
  formatNairobiDateTimeLocal,
  isJournalPublicationChoice,
  type JournalPublicationChoice,
} from "@/lib/admin/journal/validation";
import {
  initialJournalActionState,
  type JournalActionState,
} from "@/lib/admin/journal/state";

type JournalFormProps = {
  post?: AdminJournalPost;
  coverImageSrc?: string | null;
  publicationChoice?: JournalPublicationChoice;
  saved?: boolean;
  storageWarning?: boolean;
};

function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="admin-field-error" id={id} role="alert">
      {message}
    </p>
  );
}

function FormMessage({ state }: { state: JournalActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className="admin-form-message admin-form-message--error"
      role="alert"
    >
      {state.message}
    </p>
  );
}

export function JournalForm({
  post,
  coverImageSrc,
  publicationChoice: initialChoice = "draft",
  saved = false,
  storageWarning = false,
}: JournalFormProps) {
  const [state, formAction, pending] = useActionState(
    saveJournalPost,
    initialJournalActionState,
  );
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!post);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? null);
  const [publicationChoice, setPublicationChoice] =
    useState<JournalPublicationChoice>(initialChoice);
  const [scheduledAtLocal, setScheduledAtLocal] = useState(
    formatNairobiDateTimeLocal(
      initialChoice === "scheduled" ? post?.publishedAt ?? null : null,
    ),
  );
  const fieldErrors = state.fieldErrors;
  const isEditing = Boolean(post);

  return (
    <form action={formAction} className="admin-journal-form">
      {post ? <input name="id" type="hidden" value={post.id} /> : null}
      <input name="coverImage" type="hidden" value={coverImage ?? ""} />

      {saved ? (
        <p className="admin-form-message admin-form-message--success" role="status">
          Article saved.
        </p>
      ) : null}
      {storageWarning ? (
        <p className="admin-form-message admin-form-message--warning" role="status">
          The article was saved, but its previous cover image remains in Storage.
        </p>
      ) : null}
      <FormMessage state={state} />

      <section aria-labelledby="journal-details-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="journal-details-title">
          Article details
        </h2>
        <div className="admin-form-grid">
          <div className="field">
            <label className="field-label" htmlFor="journal-title">
              Title
            </label>
            <input
              aria-describedby={fieldErrors.title ? "journal-title-error" : undefined}
              aria-invalid={Boolean(fieldErrors.title)}
              className="field-control"
              id="journal-title"
              name="title"
              onChange={(event) => {
                const nextTitle = event.currentTarget.value;
                setTitle(nextTitle);
                if (autoSlug) {
                  setSlug(slugify(nextTitle));
                }
              }}
              required
              value={title}
            />
            <FieldError id="journal-title-error" message={fieldErrors.title} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="journal-slug">
              Slug
            </label>
            <p className="field-hint" id="journal-slug-hint">
              {isEditing
                ? "This saved URL stays the same when you change the title. Edit the slug directly to change it."
                : "The slug is generated from the title. You can edit it before saving."}
            </p>
            <input
              aria-describedby={
                fieldErrors.slug
                  ? "journal-slug-hint journal-slug-error"
                  : "journal-slug-hint"
              }
              aria-invalid={Boolean(fieldErrors.slug)}
              autoCapitalize="none"
              className="field-control"
              id="journal-slug"
              name="slug"
              onChange={(event) => {
                setSlug(event.currentTarget.value);
                setAutoSlug(false);
              }}
              required
              spellCheck={false}
              value={slug}
            />
            <FieldError id="journal-slug-error" message={fieldErrors.slug} />
          </div>

          <div className="field admin-journal-excerpt">
            <label className="field-label" htmlFor="journal-excerpt">
              Summary
            </label>
            <textarea
              aria-describedby={
                fieldErrors.excerpt ? "journal-excerpt-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.excerpt)}
              className="field-control"
              id="journal-excerpt"
              name="excerpt"
              onChange={(event) => setExcerpt(event.currentTarget.value)}
              required
              rows={3}
              value={excerpt}
            />
            <FieldError id="journal-excerpt-error" message={fieldErrors.excerpt} />
          </div>
        </div>
      </section>

      <section aria-labelledby="journal-content-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="journal-content-title">
          Article text
        </h2>
        <p className="admin-form-section-description">
          Enter supported HTML: paragraphs, headings, lists, quotations, links,
          and emphasis. Scripts, styles, and unsupported markup are removed in
          the preview and on the public page.
        </p>
        <div className="field admin-journal-content">
          <label className="field-label" htmlFor="journal-content">
            Content
          </label>
          <textarea
            aria-describedby={
              fieldErrors.content
                ? "journal-content-hint journal-content-error"
                : "journal-content-hint"
            }
            aria-invalid={Boolean(fieldErrors.content)}
            className="field-control admin-journal-content-control"
            id="journal-content"
            name="content"
            onChange={(event) => setContent(event.currentTarget.value)}
            required
            rows={18}
            value={content}
          />
          <p className="field-hint" id="journal-content-hint">
            Use paragraphs, h2/h3 headings, lists, blockquotes, strong, em, code,
            pre, and links. Keep combined article text under 500 KiB per save.
          </p>
          <FieldError id="journal-content-error" message={fieldErrors.content} />
        </div>
      </section>

      <section aria-labelledby="journal-cover-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="journal-cover-title">
          Cover image
        </h2>
        <p className="admin-form-section-description">
          Optional. Use a JPEG, PNG, or WebP file up to 5 MiB. Images in this
          public bucket are accessible by their URL, including before an article
          is published. Do not upload confidential images.
        </p>
        {fieldErrors.coverImage ? (
          <FieldError id="journal-cover-reference-error" message={fieldErrors.coverImage} />
        ) : null}
        {coverImage && coverImageSrc ? (
          <div className="admin-journal-cover-preview">
            <Image alt="" fill sizes="(max-width: 760px) 100vw, 40rem" src={coverImageSrc} />
          </div>
        ) : coverImage ? (
          <p className="admin-form-message admin-form-message--warning" role="status">
            The saved cover image preview is unavailable.
          </p>
        ) : (
          <p className="admin-empty-images">No cover image is attached.</p>
        )}
        {coverImage ? (
          <button
            className="admin-control-button admin-control-button--remove"
            onClick={() => setCoverImage(null)}
            type="button"
          >
            Remove current cover
          </button>
        ) : null}
        <div className="field">
          <label className="field-label" htmlFor="journal-cover-file">
            {coverImage ? "Replace cover image" : "Add a cover image"}
          </label>
          <input
            aria-describedby={fieldErrors.coverFile ? "journal-cover-file-error" : undefined}
            aria-invalid={Boolean(fieldErrors.coverFile)}
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="field-control admin-file-control"
            id="journal-cover-file"
            name="coverFile"
            type="file"
          />
          <FieldError id="journal-cover-file-error" message={fieldErrors.coverFile} />
        </div>
      </section>

      <section aria-labelledby="journal-publication-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="journal-publication-title">
          Publication
        </h2>
        <div className="admin-form-grid">
          <div className="field">
            <label className="field-label" htmlFor="journal-publication-choice">
              Publication setting
            </label>
            <select
              aria-describedby={
                fieldErrors.scheduledAt ? "journal-schedule-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.scheduledAt)}
              className="field-control"
              id="journal-publication-choice"
              name="publicationChoice"
              onChange={(event) => {
                const nextChoice = event.currentTarget.value;
                if (isJournalPublicationChoice(nextChoice)) {
                  setPublicationChoice(nextChoice);
                }
              }}
              value={publicationChoice}
            >
              <option value="draft">Draft or unpublish</option>
              <option value="published">Publish now</option>
              <option value="scheduled">Schedule for later</option>
            </select>
            {publicationChoice !== "scheduled" ? (
              <FieldError
                id="journal-schedule-error"
                message={fieldErrors.scheduledAt}
              />
            ) : null}
          </div>
          {publicationChoice === "scheduled" ? (
            <div className="field">
              <label className="field-label" htmlFor="journal-scheduled-at">
                Publish date and time
              </label>
              <input
                aria-describedby="journal-scheduled-hint journal-schedule-error"
                aria-invalid={Boolean(fieldErrors.scheduledAt)}
                className="field-control"
                id="journal-scheduled-at"
                name="scheduledAtLocal"
                onChange={(event) => setScheduledAtLocal(event.currentTarget.value)}
                required
                type="datetime-local"
                value={scheduledAtLocal}
              />
              <p className="field-hint" id="journal-scheduled-hint">
                The time uses Africa/Nairobi (EAT).
              </p>
              <FieldError
                id="journal-schedule-error"
                message={fieldErrors.scheduledAt}
              />
            </div>
          ) : (
            <input name="scheduledAtLocal" type="hidden" value="" />
          )}
        </div>
      </section>

      <div className="admin-property-form-actions">
        <button className="button button--primary" disabled={pending} type="submit">
          {pending ? "Saving..." : isEditing ? "Save article" : "Create article"}
        </button>
        {post ? (
          <Link className="text-link" href={`/admin/journal/${post.id}/preview`}>
            Preview saved article
          </Link>
        ) : null}
        <Link className="text-link" href="/admin/journal">
          Cancel
        </Link>
      </div>
    </form>
  );
}
