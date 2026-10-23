import { Suspense } from "react";
import "../src/lib/styles/globals.css";

/**
 * Provider that wraps each Storybook story with Suspense and loads the global
 * styles.
 *
 * @param props - The story to wrap
 * @returns The story wrapped in Suspense
 */
export function SbProvider({ children }: React.PropsWithChildren) {
  return <Suspense fallback="loading...">{children}</Suspense>;
}
