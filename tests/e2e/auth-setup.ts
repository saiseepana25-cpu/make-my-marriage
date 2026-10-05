import { spawn, execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, createWriteStream, mkdirSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";

export default async function setup() {
  // Check before allocating a database or starting Next. The run marker below
  // also covers another process taking the port after this probe closes.
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once("error", error => reject(new Error("Port 3100 is unavailable; stop the existing server before running auth browser tests.", { cause: error })));
    probe.listen({ host: "localhost", port: 3100, exclusive: true }, () => {
      probe.close(error => error ? reject(error) : resolve());
    });
  });
  const runId = randomBytes(32).toString("hex");
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  const uri = mongo.getUri("mmm-test-browser");
  process.env.MMM_AUTH_TEST_URI = uri;
  mkdirSync("test-results", { recursive: true });
  copyFileSync("tsconfig.json", "tsconfig.auth-test.json");
  const log = createWriteStream("test-results/auth-server.log");
  const server = spawn(process.execPath, [join(process.cwd(), "node_modules/next/dist/bin/next"), "dev", "--hostname", "localhost", "--port", "3100"], {
    windowsHide: true,
    env: {
      ...process.env, NODE_ENV: "development", MONGODB_URI: uri, MONGODB_DB_NAME: "mmm-test-browser",
      AUTH_RATE_LIMIT_SECRET: randomBytes(32).toString("hex"), NEXT_PUBLIC_APP_URL: "http://localhost:3100",
      MMM_AUTH_E2E: "1", MMM_AUTH_E2E_RUN_ID: runId,
    }, stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.pipe(log); server.stderr.pipe(log);
  let spawnError: Error | undefined;
  server.on("error", error => { spawnError = error; });
  const cleanup = async () => {
    if (server.pid && server.exitCode === null) {
      if (process.platform === "win32") {
        await new Promise<void>(resolve => execFile("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true }, () => resolve()));
      } else { server.kill("SIGTERM"); }
    }
    log.end();
    await mongo.stop();
    delete process.env.MMM_AUTH_TEST_URI;
  };
  try {
    for (let attempt = 0; attempt < 120; attempt++) {
      if (spawnError || server.exitCode !== null || server.signalCode !== null) throw new Error("Isolated browser server failed to start; inspect test-results/auth-server.log.");
      let response: Response | undefined;
      try {
        response = await fetch("http://localhost:3100/api/v1/health", { signal: AbortSignal.timeout(1000), cache: "no-store", redirect: "error" });
      } catch { /* Wait for our own server. */ }
      if (response?.ok) {
        if (response.headers.get("x-mmm-auth-e2e-run-id") !== runId) {
          throw new Error("Port 3100 answered from another server or a different test run; refusing to run database mutations.");
        }
        if (spawnError || server.exitCode !== null || server.signalCode !== null) throw new Error("Isolated browser server failed to start; inspect test-results/auth-server.log.");
        return cleanup;
      }
      await delay(1000);
    }
    throw new Error("Isolated browser server startup timed out; inspect test-results/auth-server.log.");
  } catch (error) { await cleanup(); throw error; }
}
