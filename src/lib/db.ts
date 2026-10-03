import "server-only";
import mongoose from "mongoose";
import { requiredServerEnv } from "@/config/server-env";

type ConnectionCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  marriageMongoose?: ConnectionCache;
};
const cache = globalForMongoose.marriageMongoose ??= { connection: null, promise: null };

export async function connectDatabase(): Promise<typeof mongoose> {
  if (cache.connection && mongoose.connection.readyState === 1) return cache.connection;
  if (!cache.promise) {
    const uri = requiredServerEnv("MONGODB_URI");
    cache.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME?.trim() || undefined,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
      autoIndex: process.env.NODE_ENV !== "production",
    });
  }
  const pending = cache.promise;
  try {
    cache.connection = await pending;
    return cache.connection;
  } finally {
    // Reset after success or failure so a disconnected connection can reconnect.
    if (cache.promise === pending) cache.promise = null;
  }
}

