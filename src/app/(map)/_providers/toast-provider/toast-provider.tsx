"use client";

import { Toast } from "@base-ui/react/toast";

// Short confirmations; long enough to read, short enough not to linger over the map
const TOAST_TIMEOUT_MS = 2500;

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          // Stacking and enter/exit transitions follow Base UI's and shadcn/ui's toast
          className="absolute right-0 bottom-0 left-0 z-[calc(1000-var(--toast-index))] mx-auto w-fit origin-bottom [transform:translateY(calc(var(--toast-index)*-0.5rem))_scale(calc(1-var(--toast-index)*0.05))] rounded-lg bg-gray-900 text-white shadow-lg [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s] data-ending-style:opacity-0 data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]"
        >
          <Toast.Content className="px-4 py-2 text-sm">
            <Toast.Description />
          </Toast.Content>
        </Toast.Root>
      ))}
    </>
  );
}

/**
 * Lets anything on the map page show a short toast (e.g. "link copied") at
 * the bottom of the screen. Base UI announces each toast to screen readers.
 *
 * @param props - The page content
 * @returns The content with the toast region
 */
export function ToastProvider({ children }: React.PropsWithChildren) {
  return (
    <Toast.Provider timeout={TOAST_TIMEOUT_MS}>
      {children}
      <Toast.Portal>
        {/* Above Leaflet's panes and controls (z-index up to 1000) */}
        <Toast.Viewport className="fixed inset-x-4 bottom-20 z-1100 mx-auto max-w-sm">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
