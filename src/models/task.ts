import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types/domain";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  title: { type: String, required: true, trim: true },
  description: String,
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  priority: { type: String, enum: TASK_PRIORITIES, required: true },
  status: { type: String, enum: TASK_STATUSES, required: true },
  dueAt: Date,
  reminderSentAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
  collection: "tasks",
  timestamps: true,
  versionKey: false,
});

schema.index({ weddingId: 1 });
schema.index({ assignedTo: 1 });
schema.index({ dueAt: 1 });

export type TaskRecord = InferSchemaType<typeof schema>;
export const TaskModel =
  (mongoose.models.Task as Model<TaskRecord> | undefined) ??
  mongoose.model<TaskRecord>("Task", schema);

