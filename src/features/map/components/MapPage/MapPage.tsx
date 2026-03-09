"use client";

import { StoreMap } from "../StoreMap";
import { SaleFilter } from "../SaleFilter";
import { useSaleFilter } from "../../hooks/useSaleFilter";
import type { StoresData } from "../../types";

type MapPageProps = {
  data: StoresData;
};

function MapPage({ data }: MapPageProps) {
  const { saleTypes, selectedSales, toggleSale, filteredStores } =
    useSaleFilter(data.stores);

  return (
    <div className="relative h-dvh w-full">
      <StoreMap stores={filteredStores} />
      <div className="absolute left-4 top-4 z-10 w-56">
        <SaleFilter
          saleTypes={saleTypes}
          selectedSales={selectedSales}
          onToggle={toggleSale}
          totalCount={data.stores.length}
          filteredCount={filteredStores.length}
        />
      </div>
    </div>
  );
}

export { MapPage };
