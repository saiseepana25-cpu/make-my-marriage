import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { ROLES, RELATIONSHIP_TYPES } from "@/types/domain";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, required: true },
  relationshipType: { type: String, enum: RELATIONSHIP_TYPES, required: true },
}, {
  collection: "users",
  timestamps: true,
  versionKey: false,
});

schema.index({ email: 1 }, { unique: true });

export type UserRecord = InferSchemaType<typeof schema>;
export const UserModel =
  (mongoose.models.User as Model<UserRecord> | undefined) ??
  mongoose.model<UserRecord>("User", schema);

