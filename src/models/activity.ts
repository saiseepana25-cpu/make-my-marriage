import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { ACTIVITY_SOURCES } from "@/types/domain";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  relatedEventId: { type: Schema.Types.ObjectId, ref: "Event" },
  sourceType: { type: String, enum: ACTIVITY_SOURCES, required: true },
  activityType: String,
}, {
  collection: "activities",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
});

schema.index({ weddingId: 1 });

export type ActivityRecord = InferSchemaType<typeof schema>;
export const ActivityModel =
  (mongoose.models.Activity as Model<ActivityRecord> | undefined) ??
  mongoose.model<ActivityRecord>("Activity", schema);

