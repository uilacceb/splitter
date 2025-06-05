import mongoose, { Schema, model, Types } from "mongoose";

const settlementSchema = new Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    settled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Settlement", settlementSchema);
