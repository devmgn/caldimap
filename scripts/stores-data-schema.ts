import type { StoresData } from "../src/features/map/types";
import { z } from "zod";

/** Shape of `src/data/stores.json`, written by `pnpm scrape`. */
export const storesDataSchema = z.object({
  updatedAt: z.string(),
  stores: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      address: z.string(),
      lat: z.number(),
      lng: z.number(),
      url: z.string(),
      services: z.array(z.string()),
      sales: z.array(
        z.object({
          type: z.string(),
          status: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          detail: z.string(),
        })
      ),
    })
  ),
}) satisfies z.ZodType<StoresData>;
