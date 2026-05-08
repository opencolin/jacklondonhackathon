"use client";

import { useState } from "react";

const SHARE_TITLE = "CodeCruise — Three-week hackathon, finals on the bay";
const SHARE_TEXT =
  "Three-week remote hackathon with daily office hours. Top 30 builders win a boat day on the Dragon Lady, May 30. Winner takes home $10k and a DGX Spark.";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url });
        return;
      } catch {
        // user cancelled or share failed; fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  }

  return (
    <button type="button" onClick={handleClick} className="btn-outline text-sm">
      {copied ? "Link copied" : "Invite / Share"}
    </button>
  );
}
