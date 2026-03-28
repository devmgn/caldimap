"use client";

import type { Sale, Store } from "../../types";
import {
  endOfDay,
  isFuture,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import { CircleMarker, Popup } from "react-leaflet";

type SaleCategory = "open" | "kansha";

type MarkerColor =
  | { category: SaleCategory; active: true }
  | { category: SaleCategory; active: false }
  | { category: "none" };

function getSaleCategory(type: string): SaleCategory {
  return type.includes("オープン") ? "open" : "kansha";
}

function getMarkerColor(sales: Sale[]): MarkerColor {
  const today = startOfDay(new Date());

  const active = sales.find((sale) =>
    isWithinInterval(today, {
      start: startOfDay(parseISO(sale.startDate)),
      end: endOfDay(parseISO(sale.endDate)),
    }),
  );

  if (active) {
    return { category: getSaleCategory(active.type), active: true };
  }

  const upcoming = sales.find((sale) => isFuture(parseISO(sale.startDate)));

  if (upcoming) {
    return { category: getSaleCategory(upcoming.type), active: false };
  }

  return { category: "none" };
}

const MARKER_COLORS: Record<string, string> = {
  "kansha-active": "#dc2626", // 赤: 通常セール開催中
  "kansha-upcoming": "#fca5a5", // 薄赤: 通常セール予定
  "open-active": "#2563eb", // 青: オープンセール開催中
  "open-upcoming": "#93c5fd", // 薄青: オープンセール予定
  none: "#9ca3af", // グレー: セールなし
};

function resolveMarkerColor(color: MarkerColor): string {
  if (color.category === "none") {
    return MARKER_COLORS.none;
  }
  const key = `${color.category}-${color.active ? "active" : "upcoming"}`;
  return MARKER_COLORS[key];
}

function StoreMarker({
  store,
  onSelect,
}: {
  store: Store;
  onSelect: (store: Store) => void;
}) {
  const markerColor = getMarkerColor(store.sales);
  const color = resolveMarkerColor(markerColor);

  return (
    <CircleMarker
      center={[store.lat, store.lng]}
      radius={10}
      pathOptions={{
        color: "white",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }}
      eventHandlers={{
        click: () => {
          onSelect(store);
        },
      }}
    >
      <Popup>
        <div style={{ maxWidth: 250, padding: 4 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>
            {store.name}
          </h3>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#666" }}>
            {store.address}
          </p>
          {store.sales.map((sale) => (
            <div
              key={`${sale.type}-${sale.startDate}-${sale.endDate}`}
              style={{
                background: "#fef2f2",
                padding: "4px 8px",
                borderRadius: 4,
                marginBottom: 4,
                fontSize: 12,
              }}
            >
              <strong>{sale.type}</strong>
              <br />
              {sale.startDate} ~ {sale.endDate}
            </div>
          ))}
          <a
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "#2563eb" }}
          >
            公式ページ →
          </a>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export { StoreMarker };
