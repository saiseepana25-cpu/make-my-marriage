import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  expiresAt: { type: Date, required: true },
}, { collection: "sessions", timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

schema.index({ tokenHash: 1 }, { unique: true });
schema.index({ userId: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionRecord = InferSchemaType<typeof schema>;
export const SessionModel = (mongoose.models.Session as Model<SessionRecord> | undefined)
  ?? mongoose.model<SessionRecord>("Session", schema);
