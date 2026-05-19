"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveProject, type ProjectSaveState } from "./actions";

const initialState: ProjectSaveState = { status: "idle" };

export function ProjectForm({
  eventId,
  email,
  initial,
}: {
  eventId: string;
  email: string;
  initial: {
    // Project
    name: string;
    summary: string;
    repoUrl: string;
    demoUrl: string;
    xPostUrl: string;
    linkedinPostUrl: string;
    status: "draft" | "submitted";
    // Builder
    builderName: string;
    builderPhone: string;
  };
}) {
  const [state, formAction] = useFormState(saveProject, initialState);
  const fieldErrors =
    state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-2">
      <input type="hidden" name="eventId" value={eventId} />

      {/* Builder identity */}
      <h3 className="lg:col-span-2 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
        Builder
      </h3>
      <div>
        <label className="label" htmlFor="builderName">Full name</label>
        <input
          id="builderName"
          name="builderName"
          className="input"
          maxLength={120}
          placeholder="Colin Lowenberg"
          defaultValue={initial.builderName}
        />
        <FieldError errors={fieldErrors.builderName} />
      </div>
      <div>
        <label className="label" htmlFor="builderEmail">Email</label>
        <p
          id="builderEmail"
          className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200"
        >
          {email || "—"}
        </p>
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          From your sign-in provider. Update it there.
        </p>
      </div>
      <div className="lg:col-span-2">
        <label className="label" htmlFor="builderPhone">Phone</label>
        <input
          id="builderPhone"
          name="builderPhone"
          className="input"
          maxLength={40}
          placeholder="+1 555 123 4567"
          defaultValue={initial.builderPhone}
        />
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          So organizers can reach you on May 30 (boat day logistics, finalist call).
        </p>
        <FieldError errors={fieldErrors.builderPhone} />
      </div>

      {/* Project */}
      <h3 className="lg:col-span-2 mt-4 text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
        Project
      </h3>
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

      <div>
        <label className="label" htmlFor="xPostUrl">X post URL</label>
        <input
          id="xPostUrl"
          name="xPostUrl"
          className="input"
          placeholder="https://x.com/you/status/..."
          defaultValue={initial.xPostUrl}
        />
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
          The tweet showing your build, tagging the sponsors.
        </p>
        <FieldError errors={fieldErrors.xPostUrl} />
      </div>

      <div>
        <label className="label" htmlFor="linkedinPostUrl">LinkedIn post URL</label>
        <input
          id="linkedinPostUrl"
          name="linkedinPostUrl"
          className="input"
          placeholder="https://www.linkedin.com/posts/..."
          defaultValue={initial.linkedinPostUrl}
        />
        <FieldError errors={fieldErrors.linkedinPostUrl} />
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
