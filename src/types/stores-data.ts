/** A point on the map in WGS84 degrees. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** A sale held at a store. */
export interface Sale {
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  detail: string;
}

/** A KALDI store with its location and sales. */
export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  url: string;
  services: string[];
  sales: Sale[];
}

/** Every store with the time the data was built. */
export interface StoresData {
  updatedAt: string;
  stores: Store[];
}
