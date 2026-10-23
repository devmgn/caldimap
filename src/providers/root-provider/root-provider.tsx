import { NuqsAdapter } from "nuqs/adapters/next/app";
import { isProduction } from "../../utils/runtime";
import { QueryClientProvider } from "../query-client-provider";
import { WebVitalsReporter } from "../web-vitals-reporter";

/**
 * Wraps the whole app with nuqs and TanStack Query.
 *
 * @param props - The app to wrap
 * @returns The app wrapped in the providers
 */
export function RootProvider(props: React.PropsWithChildren) {
  const { children } = props;

  return (
    <NuqsAdapter>
      <QueryClientProvider>
        {children}
        {!isProduction && <WebVitalsReporter />}
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
