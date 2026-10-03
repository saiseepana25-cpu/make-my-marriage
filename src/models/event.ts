import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  startAt: { type: Date, required: true },
  endAt: Date,
  venue: { type: String, required: true, trim: true },
  location: String,
  livestreamUrl: String,
  status: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
  collection: "events",
  timestamps: true,
  versionKey: false,
});

schema.index({ weddingId: 1 });
schema.pre("validate", function () {
  if (this.endAt && this.startAt && this.endAt < this.startAt) {
    this.invalidate("endAt", "Event end must be on or after its start.");
  }
});
export type EventRecord = InferSchemaType<typeof schema>;
export const EventModel =
  (mongoose.models.Event as Model<EventRecord> | undefined) ??
  mongoose.model<EventRecord>("Event", schema);

