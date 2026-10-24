"use client";

import type { Store } from "../../../../../../types/stores-data";
import { useState } from "react";
import { getStoreShareUrl } from "../../utils/get-store-share-url";

type CopyStatus = "idle" | "copied" | "failed";

const COPY_MESSAGES = {
  idle: "",
  copied: "コピーしました",
  failed: "コピーできませんでした",
} as const satisfies Record<CopyStatus, string>;

interface ShareButtonProps {
  store: Store;
}

/**
 * Shares a link to the store's popup: through the share sheet where the
 * browser has one (mostly phones), otherwise by copying it to the clipboard.
 *
 * @param props - The store to share
 * @returns The button with its copy feedback
 */
export function ShareButton({ store }: ShareButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function handleClick() {
    const url = getStoreShareUrl(store.id, window.location.origin);
    const data = { title: store.name, url };

    // Clear the last result first, so a repeated copy is announced again
    setStatus("idle");

    // Not every browser has a share sheet, despite what the DOM types say. Ask
    // up front: a failed share uses up the click, and Safari then refuses the
    // clipboard write
    if ("canShare" in navigator && navigator.canShare(data)) {
      try {
        await navigator.share(data);

        return;
      } catch (error) {
        // The user closed the sheet; anything else falls back to copying
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        className="inline-flex min-h-8 cursor-pointer items-center rounded border border-gray-300 bg-white px-2 text-xs focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        共有
      </button>
      <span aria-live="polite" className="text-xs text-gray-500">
        {COPY_MESSAGES[status]}
      </span>
    </>
  );
}
