import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  uploadedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  uploadedByName: String,
  s3Key: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  mimeType: { type: String, required: true },
}, {
  collection: "photos",
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
});

schema.index({ weddingId: 1 });

export type PhotoRecord = InferSchemaType<typeof schema>;
export const PhotoModel =
  (mongoose.models.Photo as Model<PhotoRecord> | undefined) ??
  mongoose.model<PhotoRecord>("Photo", schema);

