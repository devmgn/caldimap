import type { NextConfig } from "next";

const nextConfig = {
  compiler: {
    reactRemoveProperties: true,
  },
  experimental: {
    authInterrupts: true,
    strictRouteTypes: true,
    turbopackFileSystemCacheForDev: true,
  },
  poweredByHeader: false,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  typedRoutes: true,
} satisfies NextConfig;

export default nextConfig;
