"use client";

import type { Store } from "../../../../../../types/stores-data";
import { Button } from "@base-ui/react/button";
import { toastManager } from "../../../../_lib/toast-manager";
import { getStoreShareUrl } from "../../utils/get-store-share-url";

interface ShareButtonProps {
  store: Store;
}

/**
 * Shares a link to the store's popup: through the share sheet where the
 * browser has one (mostly phones), otherwise by copying it to the clipboard
 * and confirming with a toast.
 *
 * @param props - The store to share
 * @returns The button
 */
export function ShareButton({ store }: ShareButtonProps) {
  async function handleClick() {
    const url = getStoreShareUrl(store.id, window.location.origin);
    const data = { title: store.name, url };

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
      toastManager.add({ description: "リンクをコピーしました" });
    } catch {
      toastManager.add({ description: "リンクをコピーできませんでした" });
    }
  }

  return (
    <Button
      onClick={() => {
        void handleClick();
      }}
      className="inline-flex min-h-8 cursor-pointer items-center rounded border border-gray-300 bg-white px-2 text-xs focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      共有
    </Button>
  );
}
