"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { safeAuth } from "@/server/lib/safe-auth";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null))
  .refine(
    (v) => v === null || /^https?:\/\//i.test(v),
    "Must be a URL starting with http:// or https://",
  );

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((v) => (v ? v : null));

const schema = z.object({
  phone: optionalText,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  discordId: optionalText,
  twitterUrl: optionalUrl,
});

export type ProfileSaveState =
  | { status: "idle" }
  | { status: "ok"; savedAt: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export async function saveProfile(
  _prev: ProfileSaveState,
  formData: FormData,
): Promise<ProfileSaveState> {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return { status: "error", message: "Not signed in." };
  }

  const parsed = schema.safeParse({
    phone: formData.get("phone"),
    githubUrl: formData.get("github"),
    linkedinUrl: formData.get("linkedin"),
    discordId: formData.get("discord"),
    twitterUrl: formData.get("twitter"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Some fields look off — check the highlighted ones.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db
      .update(users)
      .set({
        phone: parsed.data.phone,
        githubUrl: parsed.data.githubUrl,
        linkedinUrl: parsed.data.linkedinUrl,
        discordId: parsed.data.discordId,
        twitterUrl: parsed.data.twitterUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (err) {
    console.error("[saveProfile] db update failed", err);
    return { status: "error", message: "Couldn't save right now. Try again in a moment." };
  }

  revalidatePath("/builders/dashboard/profile");
  return { status: "ok", savedAt: new Date().toISOString() };
}
