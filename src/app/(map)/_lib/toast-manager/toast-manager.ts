import { Toast } from "@base-ui/react/toast";

/**
 * Adds toasts from anywhere, without needing to sit inside the provider's
 * context (as shadcn/ui's toast does). Without a mounted provider the toast is
 * simply not shown, so components using it render fine in isolation.
 */
export const toastManager = Toast.createToastManager();
