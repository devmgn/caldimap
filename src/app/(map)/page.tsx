import { Suspense } from "react";
import { MapPageContainer } from "./_components/map-page-container";

/**
 * Top page. The store map and its cached data are prerendered into the static
 * shell.
 *
 * @returns The store map page
 */
export default function Home() {
  return (
    <Suspense>
      <MapPageContainer />
    </Suspense>
  );
}
