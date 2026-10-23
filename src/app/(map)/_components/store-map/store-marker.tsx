"use client";

import type { Store } from "../../../../types/stores-data";
import { CircleMarker, Popup } from "react-leaflet";
import { getMarkerColor } from "./utils/get-marker-color";

function StoreMarker({
  store,
  onSelect,
}: {
  store: Store;
  onSelect: (store: Store) => void;
}) {
  const color = getMarkerColor(store.sales);

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
        <div className="max-w-[250px] p-1">
          <h3 className="mb-1 text-sm font-semibold">{store.name}</h3>
          {/* Leaflet's popup `p` margin and `a` color rules outrank utilities, hence `!` */}
          <p className="mt-0! mb-1! text-xs text-[#666]">{store.address}</p>
          {store.sales.map((sale) => (
            <div
              key={`${sale.type}-${sale.startDate}-${sale.endDate}`}
              className="mb-1 rounded bg-[#fef2f2] px-2 py-1 text-xs"
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
            className="text-xs text-[#2563eb]!"
          >
            公式ページ →
          </a>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export { StoreMarker };
