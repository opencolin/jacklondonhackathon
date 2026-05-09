"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfile, type ProfileSaveState } from "./actions";

const initialState: ProfileSaveState = { status: "idle" };

export function ProfileForm({
  name,
  email,
  initial,
}: {
  name: string;
  email: string;
  initial: {
    phone: string;
    githubUrl: string;
    linkedinUrl: string;
    discordId: string;
    twitterUrl: string;
  };
}) {
  const [state, formAction] = useActionState(saveProfile, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="card lg:col-span-2">
      <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">Identity</h2>
      <p className="text-sm text-ink-500 dark:text-ink-400">
        Read-only fields are pulled from your OAuth provider.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <p className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200">
            {name}
          </p>
        </div>
        <div>
          <label className="label">Email</label>
          <p className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200">
            {email}
          </p>
        </div>
        <Field
          id="phone"
          label="Phone"
          placeholder="(optional)"
          defaultValue={initial.phone}
          errors={fieldErrors.phone}
        />
        <Field
          id="github"
          name="github"
          label="GitHub"
          placeholder="https://github.com/yourhandle"
          defaultValue={initial.githubUrl}
          errors={fieldErrors.githubUrl}
        />
        <Field
          id="linkedin"
          name="linkedin"
          label="LinkedIn"
          placeholder="https://linkedin.com/in/..."
          defaultValue={initial.linkedinUrl}
          errors={fieldErrors.linkedinUrl}
        />
        <Field
          id="discord"
          name="discord"
          label="Discord handle"
          placeholder="username"
          defaultValue={initial.discordId}
          errors={fieldErrors.discordId}
        />
        <Field
          id="twitter"
          name="twitter"
          label="X / Twitter"
          placeholder="https://x.com/..."
          defaultValue={initial.twitterUrl}
          errors={fieldErrors.twitterUrl}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <SaveStatus state={state} />
        <div className="flex gap-2">
          <button type="reset" className="btn-outline">Cancel</button>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  defaultValue,
  errors,
}: {
  id: string;
  name?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  errors?: string[];
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name ?? id}
        className="input"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      {errors?.length ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[0]}</p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-lime" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

function SaveStatus({ state }: { state: ProfileSaveState }) {
  if (state.status === "ok") {
    return (
      <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>
    );
  }
  if (state.status === "error") {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
    );
  }
  return null;
}
