"use client";

import { Button } from "@base-ui/react/button";

interface ErrorProps {
  error: unknown;
  retry: () => void;
}

/**
 * Error page that shows uncaught errors thrown in a route segment and lets the
 * user retry.
 *
 * @param props - The error passed by Next.js and `retry` to re-fetch and
 *   re-render
 * @returns The error message and a retry button
 */
export default function ErrorPage(props: ErrorProps) {
  const { retry } = props;

  return (
    <>
      <h2>Something went wrong!</h2>
      <Button onClick={retry}>Try again</Button>
    </>
  );
}
