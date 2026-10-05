import { MongoBinary } from "mongodb-memory-server-core";

// First-run download precedes test hooks; slow downloads are not application failures.
export default async function prepare() { await MongoBinary.getPath(); }
