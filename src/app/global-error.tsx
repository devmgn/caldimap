"use client";

interface ErrorProps {
  error: unknown;
  reset: () => void;
}

/**
 * Last line of defense for uncaught errors thrown in the root layout /
 * template. It replaces the root layout, so it must provide its own `<html>` /
 * `<body>`.
 *
 * @param props - The error passed by Next.js and `reset` to re-render
 * @returns An HTML document with the error message and a retry button
 */
export default function GlobalError(props: ErrorProps) {
  const { reset } = props;

  return (
    <html lang="ja">
      <body>
        <h2>Something went wrong! (global-error)</h2>
        <button onClick={reset} type="button">
          Try again
        </button>
      </body>
    </html>
  );
}
