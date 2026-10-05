import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  _id: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  count: { type: Number, required: true, min: 0 },
  expiresAt: { type: Date, required: true },
}, { collection: "rate_limits", versionKey: false });

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitRecord = InferSchemaType<typeof schema>;
export const RateLimitModel = (mongoose.models.RateLimit as Model<RateLimitRecord> | undefined)
  ?? mongoose.model<RateLimitRecord>("RateLimit", schema);
