import { Schema, model, Types } from "mongoose";

const settlementSchema = new Schema(
  {
    eventId: { type: Types.ObjectId, ref: "Event", required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    settled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Settlement", settlementSchema);
