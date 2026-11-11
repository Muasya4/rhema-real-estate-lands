"use client";

import { useActionState } from "react";
import {
  createRegion,
  deleteRegion,
  renameRegion,
} from "@/lib/admin/regions/actions";
import {
  initialRegionActionState,
  type RegionActionState,
} from "@/lib/admin/regions/state";
import type { Region } from "@/lib/regions/model";

function ActionMessage({ state }: { state: RegionActionState }) {
  if (!state.message) {
    return null;
  }

  const isError = state.status === "error";
  return (
    <p
      aria-live="polite"
      className={`admin-form-message admin-form-message--${isError ? "error" : "success"}`}
      role={isError ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

function RegionRow({ region }: { region: Region }) {
  const [renameState, renameAction, renamePending] = useActionState(
    renameRegion,
    initialRegionActionState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteRegion,
    initialRegionActionState,
  );

  return (
    <li className="admin-region-row">
      <form action={renameAction} className="admin-region-edit-form">
        <input name="slug" type="hidden" value={region.slug} />
        <div className="field">
          <label className="field-label" htmlFor={`region-${region.slug}`}>
            Region name
          </label>
          <input
            className="field-control"
            defaultValue={region.name}
            id={`region-${region.slug}`}
            name="name"
            required
          />
        </div>
        <button
          className="admin-control-button"
          disabled={renamePending}
          type="submit"
        >
          {renamePending ? "Saving..." : "Save name"}
        </button>
      </form>
      <div className="admin-region-delete">
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Delete ${region.name}? Properties assigned to this region must be reassigned first.`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input name="slug" type="hidden" value={region.slug} />
          <button
            className="admin-control-button admin-control-button--remove"
            disabled={deletePending}
            type="submit"
          >
            {deletePending ? "Deleting..." : "Delete"}
          </button>
        </form>
      </div>
      <div className="admin-region-feedback">
        <ActionMessage state={renameState} />
        <ActionMessage state={deleteState} />
      </div>
    </li>
  );
}

export function RegionManager({ regions }: { regions: Region[] }) {
  const [createState, createAction, createPending] = useActionState(
    createRegion,
    initialRegionActionState,
  );

  return (
    <div className="admin-region-manager">
      <section aria-labelledby="add-region-title" className="admin-region-add">
        <h2 className="admin-form-section-title" id="add-region-title">
          Add a region
        </h2>
        <p className="admin-form-section-description">
          New regions appear in property forms and on Rhema&apos;s public
          location pages.
        </p>
        <form action={createAction} className="admin-region-create-form">
          <div className="field">
            <label className="field-label" htmlFor="new-region-name">
              Region name
            </label>
            <input
              className="field-control"
              id="new-region-name"
              name="name"
              required
            />
          </div>
          <button
            className="button button--primary"
            disabled={createPending}
            type="submit"
          >
            {createPending ? "Adding..." : "Add region"}
          </button>
        </form>
        <ActionMessage state={createState} />
      </section>

      <section aria-labelledby="current-regions-title">
        <h2 className="admin-form-section-title" id="current-regions-title">
          Current regions
        </h2>
        <p className="admin-form-section-description">
          A region used by a property cannot be deleted until that property is
          assigned elsewhere.
        </p>
        {regions.length === 0 ? (
          <p className="admin-empty-regions">No regions have been added.</p>
        ) : (
          <ul className="admin-region-list">
            {regions.map((region) => (
              <RegionRow key={region.slug} region={region} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
