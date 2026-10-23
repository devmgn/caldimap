"use client";

import { useReportWebVitals } from "next/web-vitals";

const style = `
  font-size: 10px;
  padding-inline: 4px;
  border-radius: 8px;
  background-color: #3F51B5;
  color: #FFF;
`;

/**
 * Side-effect-only component that logs Web Vitals measurements to the console.
 *
 * @returns Always `null`, since it renders nothing
 */
// sonarjs treats this as a function name because this side-effect-only component returns no JSX
// oxlint-disable-next-line sonarjs/function-name
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // oxlint-disable-next-line no-console
    console.info(
      // oxlint-disable-next-line typescript/no-unsafe-member-access
      `%c [Web Vitals]: ${metric.name}: ${metric.value} / Rating: ${metric.rating}`,
      style,
      metric
    );
  });

  return null;
}
