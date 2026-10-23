import { loadEnvConfig } from "@next/env";

/** Global setup for Vitest. Loads `.env` and pins the time zone and locale. */
export default function config() {
  loadEnvConfig(process.cwd());
  process.env.TZ = "Asia/Tokyo";
  process.env.LANG = "ja_JP.UTF-8";
}
