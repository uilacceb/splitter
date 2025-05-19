import mongoose, { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    groupId:{ type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    title: { type: String },
    date: { type: Date, default: Date.now },
    participants: [{ type: String, required: true }],
    createdBy: { type: String },
  },
  { timestamps: true }
);

export default model("Event", eventSchema);
