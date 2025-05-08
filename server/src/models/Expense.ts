import { Schema, model, Types } from "mongoose";

const expenseSchema = new Schema(
  {
    eventId: { type: Types.ObjectId, ref: "Event", required: true },
    paidBy: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default model("Expense", expenseSchema);
