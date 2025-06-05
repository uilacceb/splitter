import mongoose, { Schema, model } from "mongoose";
import Expense from "./Expense";

const eventSchema = new Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    title: { type: String },
    date: { type: Date, default: Date.now },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    createdBy: { type: String },
  },
  { timestamps: true }
);

eventSchema.pre("findOneAndDelete", async function (next) {
  const eventId = this.getQuery()["_id"];
  await Expense.deleteMany({ eventId });
  next();
});

export default model("Event", eventSchema);
