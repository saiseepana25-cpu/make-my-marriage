import "server-only";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { PAYMENT_STATUSES } from "@/types/domain";

const schema = new Schema({
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0, validate: Number.isFinite },
  paidAmount: { type: Number, min: 0, validate: Number.isFinite },
  paymentStatus: { type: String, enum: PAYMENT_STATUSES, required: true },
  paidByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  paidByName: String,
  notes: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
  collection: "expenses",
  timestamps: true,
  versionKey: false,
});

schema.index({ weddingId: 1 });
schema.pre("validate", function () {
  if (this.paidAmount != null && this.amount != null && this.paidAmount > this.amount) {
    this.invalidate("paidAmount", "Paid amount cannot exceed the expense amount.");
  }
});
export type ExpenseRecord = InferSchemaType<typeof schema>;
export const ExpenseModel =
  (mongoose.models.Expense as Model<ExpenseRecord> | undefined) ??
  mongoose.model<ExpenseRecord>("Expense", schema);

