import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { RootProvider } from "../providers/root-provider";
import "../lib/styles/globals.css";

export const metadata: Metadata = {
  title: "カルディ・マップ",
  description:
    "カルディコーヒーファームの店舗情報とセール情報を地図上で確認できるサイトです",
  icons: ["images/favicon.ico"],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Root layout for the whole app. Places the providers and the Toaster.
 *
 * @param props - The nested page
 * @returns The app's HTML document
 */
export default function Layout(props: React.PropsWithChildren) {
  const { children } = props;

  return (
    <html lang="ja">
      <body>
        <RootProvider>{children}</RootProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
