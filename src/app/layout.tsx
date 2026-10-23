import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/react";
import { ENV } from "../env";
import { WebVitalsReporter } from "../lib/web-vitals-reporter";
import { isProduction } from "../utils/runtime";
import "../lib/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(ENV.SITE_URL),
  title: ENV.APP_NAME,
  description: ENV.DEFAULT_DESCRIPTION,
  icons: ["images/favicon.ico"],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Root layout for the whole app. Places the nuqs adapter for URL state.
 *
 * @param props - The nested page
 * @returns The app's HTML document
 */
export default function Layout(props: React.PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="ja">
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
        {!isProduction && <WebVitalsReporter />}
      </body>
    </html>
  );
}
