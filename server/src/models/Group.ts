import mongoose, { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default model("Group", groupSchema);
