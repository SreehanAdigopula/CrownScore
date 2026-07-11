import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      /* opencv.js's Emscripten glue references Node built-ins behind a runtime check;
         stub them in browser bundles so the client build resolves. */
      fs: { browser: "./src/lib/empty-module.ts" },
      path: { browser: "./src/lib/empty-module.ts" },
      crypto: { browser: "./src/lib/empty-module.ts" },
    },
  },
};

export default nextConfig;
