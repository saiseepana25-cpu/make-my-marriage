import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browser tests keep their temporary database/server separate from local development.
  ...(process.env.MMM_AUTH_E2E === "1" ? {
    distDir: ".next-auth-e2e",
    typescript: { tsconfigPath: "tsconfig.auth-test.json" },
    async headers() {
      const runId = process.env.MMM_AUTH_E2E_RUN_ID;
      if (!runId) throw new Error("Missing isolated browser test run identifier.");
      return [{
        source: "/api/v1/health",
        headers: [{ key: "x-mmm-auth-e2e-run-id", value: runId }],
      }];
    },
  } : {}),
};

export default nextConfig;
