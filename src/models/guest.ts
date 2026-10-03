import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { RSVP_STATUSES } from "@/types/domain";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  name: { type: String, required: true, trim: true },
  phone: String,
  email: { type: String, trim: true, lowercase: true },
  familyName: String,
  numberInvited: { type: Number, min: 0, validate: Number.isInteger },
  numberAttending: { type: Number, min: 0, validate: Number.isInteger },
  rsvpStatus: { type: String, enum: RSVP_STATUSES, required: true },
  rsvpUpdatedAt: Date,
  notes: String,
}, {
  collection: "guests",
  timestamps: true,
  versionKey: false,
});

schema.index({ weddingId: 1 });

export type GuestRecord = InferSchemaType<typeof schema>;
export const GuestModel =
  (mongoose.models.Guest as Model<GuestRecord> | undefined) ??
  mongoose.model<GuestRecord>("Guest", schema);

