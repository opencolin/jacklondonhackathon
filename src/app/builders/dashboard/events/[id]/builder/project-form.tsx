"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveProject, type ProjectSaveState } from "./actions";

const initialState: ProjectSaveState = { status: "idle" };

export function ProjectForm({
  eventId,
  initial,
}: {
  eventId: string;
  initial: {
    name: string;
    summary: string;
    repoUrl: string;
    demoUrl: string;
    status: "draft" | "submitted";
  };
}) {
  const [state, formAction] = useFormState(saveProject, initialState);
  const fieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-2">
      <input type="hidden" name="eventId" value={eventId} />

      <div className="lg:col-span-2">
        <label className="label" htmlFor="name">Project name</label>
        <input
          id="name"
          name="name"
          className="input"
          required
          maxLength={120}
          placeholder="Muglife"
          defaultValue={initial.name}
        />
        <FieldError errors={fieldErrors.name} />
      </div>

      <div className="lg:col-span-2">
        <label className="label" htmlFor="summary">Description</label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          className="input"
          maxLength={2000}
          placeholder="What it does, what it uses, what hurt to build."
          defaultValue={initial.summary}
        />
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          Clear descriptions make it easier for AI judges and sponsor engineers to review your work.
        </p>
        <FieldError errors={fieldErrors.summary} />
      </div>

      <div>
        <label className="label" htmlFor="repoUrl">GitHub repository URL</label>
        <input
          id="repoUrl"
          name="repoUrl"
          className="input"
          placeholder="https://github.com/yourhandle/project"
          defaultValue={initial.repoUrl}
        />
        <FieldError errors={fieldErrors.repoUrl} />
      </div>

      <div>
        <label className="label" htmlFor="demoUrl">Demo URL</label>
        <input
          id="demoUrl"
          name="demoUrl"
          className="input"
          placeholder="https://yourproject.com (optional)"
          defaultValue={initial.demoUrl}
        />
        <FieldError errors={fieldErrors.demoUrl} />
      </div>

      <div className="lg:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-5 dark:border-ink-700">
        <SaveStatus state={state} />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="status"
            value="draft"
            className="btn-outline"
          >
            <SaveDraftLabel />
          </button>
          <button
            type="submit"
            name="status"
            value="submitted"
            className="btn-lime"
          >
            <SubmitLabel />
          </button>
        </div>
      </div>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[0]}</p>
  );
}

function SaveStatus({ state }: { state: ProjectSaveState }) {
  if (state.status === "ok") {
    return (
      <p className="text-sm text-emerald-600 dark:text-emerald-400">
        {state.projectStatus === "submitted"
          ? "Submitted. Judges can see it now."
          : "Draft saved."}
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
    );
  }
  return null;
}

function SaveDraftLabel() {
  const { pending } = useFormStatus();
  return <>{pending ? "Saving…" : "Save draft"}</>;
}

function SubmitLabel() {
  const { pending } = useFormStatus();
  return <>{pending ? "Submitting…" : "Submit project"}</>;
}
