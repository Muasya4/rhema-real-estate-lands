"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveProperty } from "@/lib/admin/properties/actions";
import {
  initialPropertyActionState,
  type PropertyActionState,
} from "@/lib/admin/properties/state";
import type { AdminProperty } from "@/lib/admin/properties/data";
import type { PropertyImage } from "@/lib/properties/images";
import type { Region } from "@/lib/regions/model";
import { slugify } from "@/lib/slug";

type PropertyFormProps = {
  property?: AdminProperty;
  imageSources?: Record<string, string>;
  regions: Region[];
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

function FormMessage({ state }: { state: PropertyActionState }) {
  if (!state.message) {
    return null;
  }

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

function reorderImages(
  images: PropertyImage[],
  from: number,
  to: number,
): PropertyImage[] {
  if (to < 0 || to >= images.length) {
    return images;
  }

  const reordered = [...images];
  const [image] = reordered.splice(from, 1);
  reordered.splice(to, 0, image);
  return reordered;
}

export function PropertyForm({
  property,
  imageSources = {},
  regions,
  saved = false,
  storageWarning = false,
}: PropertyFormProps) {
  const [state, formAction, pending] = useActionState(
    saveProperty,
    initialPropertyActionState,
  );
  const [images, setImages] = useState<PropertyImage[]>(
    property?.images ?? [],
  );
  const [title, setTitle] = useState(property?.title ?? "");
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!property);
  const fieldErrors = state.fieldErrors;
  const isEditing = Boolean(property);

  return (
    <form action={formAction} className="admin-property-form">
      {property ? <input name="id" type="hidden" value={property.id} /> : null}
      <input name="images" type="hidden" value={JSON.stringify(images)} />

      {saved ? (
        <p className="admin-form-message admin-form-message--success" role="status">
          Property saved.
        </p>
      ) : null}
      {storageWarning ? (
        <p className="admin-form-message admin-form-message--warning" role="status">
          The property was saved, but one or more removed images remain in
          Storage.
        </p>
      ) : null}
      <FormMessage state={state} />

      <section aria-labelledby="property-main-fields" className="admin-form-section">
        <h2 className="admin-form-section-title" id="property-main-fields">
          Property details
        </h2>
        <div className="admin-form-grid">
          <div className="field">
            <label className="field-label" htmlFor="property-title">
              Title
            </label>
            <input
              aria-describedby={fieldErrors.title ? "property-title-error" : undefined}
              aria-invalid={Boolean(fieldErrors.title)}
              className="field-control"
              id="property-title"
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
            <FieldError id="property-title-error" message={fieldErrors.title} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="property-slug">
              Slug
            </label>
            <p className="field-hint" id="property-slug-hint">
              {isEditing
                ? "This saved URL stays the same when you change the title. Edit the slug directly to change it."
                : "The slug is generated from the title. You can edit it before saving."}
            </p>
            <input
              aria-describedby={
                fieldErrors.slug
                  ? "property-slug-hint property-slug-error"
                  : "property-slug-hint"
              }
              aria-invalid={Boolean(fieldErrors.slug)}
              autoCapitalize="none"
              className="field-control"
              id="property-slug"
              name="slug"
              onChange={(event) => {
                setSlug(event.currentTarget.value);
                setAutoSlug(false);
              }}
              required
              spellCheck={false}
              value={slug}
            />
            <FieldError id="property-slug-error" message={fieldErrors.slug} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="property-location">
              Location
            </label>
            <input
              aria-describedby={
                fieldErrors.location ? "property-location-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.location)}
              className="field-control"
              defaultValue={property?.location ?? ""}
              id="property-location"
              name="location"
              required
            />
            <FieldError
              id="property-location-error"
              message={fieldErrors.location}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="property-region">
              Region
            </label>
            <select
              aria-describedby={
                fieldErrors.region ? "property-region-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.region)}
              className="field-control"
              defaultValue={property?.region ?? ""}
              id="property-region"
              name="region"
              required
            >
              <option disabled value="">
                Choose a region
              </option>
              {regions.map((region) => (
                <option key={region.slug} value={region.slug}>
                  {region.name}
                </option>
              ))}
            </select>
            <FieldError
              id="property-region-error"
              message={fieldErrors.region}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="property-price">
              Price in KES
            </label>
            <input
              aria-describedby={
                fieldErrors.priceKes ? "property-price-error" : "property-price-hint"
              }
              aria-invalid={Boolean(fieldErrors.priceKes)}
              className="field-control"
              defaultValue={property?.priceKes ?? ""}
              id="property-price"
              inputMode="numeric"
              min="0"
              name="priceKes"
              step="1"
              type="number"
            />
            <p className="field-hint" id="property-price-hint">
              Leave blank to show Price on request.
            </p>
            <FieldError id="property-price-error" message={fieldErrors.priceKes} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="property-size">
              Plot size
            </label>
            <input
              aria-describedby={
                fieldErrors.plotSize ? "property-size-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.plotSize)}
              className="field-control"
              defaultValue={property?.plotSize ?? ""}
              id="property-size"
              name="plotSize"
            />
            <FieldError id="property-size-error" message={fieldErrors.plotSize} />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="property-status">
              Status
            </label>
            <select
              aria-describedby={
                fieldErrors.status ? "property-status-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.status)}
              className="field-control"
              defaultValue={property?.status ?? ""}
              id="property-status"
              name="status"
            >
              <option value="">Not set</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
            <FieldError id="property-status-error" message={fieldErrors.status} />
          </div>
        </div>

        <div className="field admin-description-field">
          <label className="field-label" htmlFor="property-description">
            Description
          </label>
          <textarea
            aria-describedby={
              fieldErrors.description
                ? "property-description-error"
                : "property-description-hint"
            }
            aria-invalid={Boolean(fieldErrors.description)}
            className="field-control field-control--textarea"
            defaultValue={property?.description ?? ""}
            id="property-description"
            name="description"
            required
            rows={7}
          />
          <p className="field-hint" id="property-description-hint">
            Use plain text. Enter only details confirmed for this property.
          </p>
          <FieldError
            id="property-description-error"
            message={fieldErrors.description}
          />
        </div>

        <div className="admin-property-toggles">
          <label className="admin-checkbox">
            <input
              aria-describedby={fieldErrors.featured ? "property-featured-error" : undefined}
              aria-invalid={Boolean(fieldErrors.featured)}
              defaultChecked={property?.featured ?? false}
              name="featured"
              type="checkbox"
            />
            <span>Feature on the properties page</span>
          </label>
          <FieldError
            id="property-featured-error"
            message={fieldErrors.featured}
          />
          <label className="admin-checkbox">
            <input
              aria-describedby={
                fieldErrors.isPublished ? "property-published-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.isPublished)}
              defaultChecked={property?.isPublished ?? false}
              name="isPublished"
              type="checkbox"
            />
            <span>Publish this property</span>
          </label>
          <FieldError
            id="property-published-error"
            message={fieldErrors.isPublished}
          />
        </div>
      </section>

      <section aria-labelledby="property-images-title" className="admin-form-section">
        <h2 className="admin-form-section-title" id="property-images-title">
          Property images
        </h2>
        <p className="admin-form-section-description">
          Add one image per save. Use JPEG, PNG, or WebP files up to 5 MiB.
        </p>
        {fieldErrors.images ? (
          <FieldError id="property-images-error" message={fieldErrors.images} />
        ) : null}
        {images.length > 0 ? (
          <ol className="admin-image-list">
            {images.map((image, index) => (
              <li className="admin-image-item" key={image.path}>
                <div className="admin-image-preview">
                  {imageSources[image.path] ? (
                    <Image
                      alt=""
                      fill
                      sizes="120px"
                      src={imageSources[image.path]}
                    />
                  ) : (
                    <span>Image preview unavailable</span>
                  )}
                </div>
                <div className="admin-image-details">
                  <label className="field-label" htmlFor={`image-alt-${index}`}>
                    Image description
                  </label>
                  <input
                    className="field-control"
                    id={`image-alt-${index}`}
                    onChange={(event) => {
                      const alt = event.currentTarget.value;
                      setImages((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, alt } : item,
                        ),
                      );
                    }}
                    value={image.alt}
                  />
                  <p className="admin-image-order">Image {index + 1}</p>
                </div>
                <div className="admin-image-controls">
                  <button
                    aria-label={`Move image ${index + 1} up`}
                    className="admin-control-button"
                    disabled={index === 0}
                    onClick={() =>
                      setImages((current) => reorderImages(current, index, index - 1))
                    }
                    type="button"
                  >
                    Move up
                  </button>
                  <button
                    aria-label={`Move image ${index + 1} down`}
                    className="admin-control-button"
                    disabled={index === images.length - 1}
                    onClick={() =>
                      setImages((current) => reorderImages(current, index, index + 1))
                    }
                    type="button"
                  >
                    Move down
                  </button>
                  <button
                    className="admin-control-button admin-control-button--remove"
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    type="button"
                  >
                    Remove image
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="admin-empty-images">No images are attached.</p>
        )}

        <div className="admin-image-upload">
          <div className="field">
            <label className="field-label" htmlFor="property-image-file">
              Add an image
            </label>
            <input
              aria-describedby={
                fieldErrors.imageFile ? "property-image-file-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.imageFile)}
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="field-control admin-file-control"
              id="property-image-file"
              name="imageFile"
              type="file"
            />
            <FieldError
              id="property-image-file-error"
              message={fieldErrors.imageFile}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="property-image-alt">
              Image description
            </label>
            <input
              aria-describedby={
                fieldErrors.imageAlt ? "property-image-alt-error" : undefined
              }
              aria-invalid={Boolean(fieldErrors.imageAlt)}
              className="field-control"
              id="property-image-alt"
              name="imageAlt"
            />
            <FieldError
              id="property-image-alt-error"
              message={fieldErrors.imageAlt}
            />
          </div>
        </div>
      </section>

      <div className="admin-property-form-actions">
        <button className="button button--primary" disabled={pending} type="submit">
          {pending ? "Saving..." : isEditing ? "Save property" : "Create property"}
        </button>
        <Link className="text-link" href="/admin/properties">
          Cancel
        </Link>
      </div>
    </form>
  );
}
