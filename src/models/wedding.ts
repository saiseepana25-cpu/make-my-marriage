import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  brideName: { type: String, required: true, trim: true },
  groomName: { type: String, required: true, trim: true },
  weddingDate: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  story: String,
  websiteSlug: { type: String, required: true, trim: true },
  coverImageKey: String,
  totalBudget: { type: Number, min: 0, validate: Number.isFinite },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
  collection: "weddings",
  timestamps: true,
  versionKey: false,
});

schema.index({ websiteSlug: 1 }, { unique: true });

export type WeddingRecord = InferSchemaType<typeof schema>;
export const WeddingModel =
  (mongoose.models.Wedding as Model<WeddingRecord> | undefined) ??
  mongoose.model<WeddingRecord>("Wedding", schema);

