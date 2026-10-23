import { Suspense } from "react";
import { MapPageContainer } from "./_components/map-page-container";

/**
 * Top page. Streams the store map, which loads its data at request time.
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
