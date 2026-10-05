// @vitest-environment node
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  spawn: vi.fn(), execFile: vi.fn(), createMongo: vi.fn(), createProbe: vi.fn(),
  mkdirSync: vi.fn(), copyFileSync: vi.fn(), createWriteStream: vi.fn(),
}));

vi.mock("node:child_process", () => ({ spawn: mocks.spawn, execFile: mocks.execFile }));
vi.mock("node:net", () => ({ createServer: mocks.createProbe }));
vi.mock("node:fs", () => ({
  mkdirSync: mocks.mkdirSync, copyFileSync: mocks.copyFileSync, createWriteStream: mocks.createWriteStream,
}));
vi.mock("mongodb-memory-server-core", () => ({ MongoMemoryReplSet: { create: mocks.createMongo } }));

import setup from "../e2e/auth-setup";

function fakeChild() {
  return Object.assign(new EventEmitter(), {
    pid: 12345, exitCode: null as number | null, signalCode: null as string | null,
    stdout: new PassThrough(), stderr: new PassThrough(), kill: vi.fn(),
  });
}

function fakeProbe() {
  const probe = new EventEmitter();
  return Object.assign(probe, {
    listen: vi.fn((_options, listening: () => void) => { queueMicrotask(listening); return probe; }),
    close: vi.fn((closed: () => void) => { queueMicrotask(closed); return probe; }),
  });
}

describe("isolated auth browser server setup", () => {
  let child: ReturnType<typeof fakeChild>;
  let probe: ReturnType<typeof fakeProbe>;
  let stopMongo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("MMM_AUTH_TEST_URI", undefined);
    child = fakeChild();
    probe = fakeProbe();
    stopMongo = vi.fn().mockResolvedValue(undefined);
    mocks.createProbe.mockReturnValue(probe);
    mocks.createMongo.mockResolvedValue({ getUri: () => "mongodb://127.0.0.1:27017/mmm-test-browser", stop: stopMongo });
    mocks.spawn.mockReturnValue(child);
    mocks.createWriteStream.mockReturnValue(new PassThrough());
    mocks.execFile.mockImplementation((_file, _args, _options, done) => done());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("rejects a foreign healthy server before its child reports a bind failure", async () => {
    // A competing server can answer while the newly spawned child still looks alive.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));

    await expect(setup()).rejects.toThrow(/another server|different test run/i);
    expect(stopMongo).toHaveBeenCalledOnce();
    expect(process.env.MMM_AUTH_TEST_URI).toBeUndefined();
  });

  it("rejects an occupied port before creating a database or starting a child", async () => {
    probe.listen.mockImplementation(() => {
      queueMicrotask(() => probe.emit("error", Object.assign(new Error("occupied"), { code: "EADDRINUSE" })));
      return probe;
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));

    await expect(setup()).rejects.toThrow(/3100.*unavailable|3100.*in use/i);
    expect(mocks.createMongo).not.toHaveBeenCalled();
    expect(mocks.spawn).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a health response from a previous isolated test run", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", {
      status: 200, headers: { "x-mmm-auth-e2e-run-id": "previous-run" },
    })));

    await expect(setup()).rejects.toThrow(/another server|different test run/i);
    expect(stopMongo).toHaveBeenCalledOnce();
  });

  it("accepts its own live server and cleans up the temporary database", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("{}", {
      status: 200,
      headers: { "x-mmm-auth-e2e-run-id": mocks.spawn.mock.calls[0][2].env.MMM_AUTH_E2E_RUN_ID },
    })));

    const cleanup = await setup();
    expect(stopMongo).not.toHaveBeenCalled();
    await cleanup();
    expect(stopMongo).toHaveBeenCalledOnce();
    expect(process.env.MMM_AUTH_TEST_URI).toBeUndefined();
  });

  it("rejects even a matching response when the spawned child has exited", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => {
      child.exitCode = 1;
      return new Response("{}", {
        status: 200,
        headers: { "x-mmm-auth-e2e-run-id": mocks.spawn.mock.calls[0][2].env.MMM_AUTH_E2E_RUN_ID },
      });
    }));

    await expect(setup()).rejects.toThrow(/failed to start/i);
    expect(stopMongo).toHaveBeenCalledOnce();
  });
});
