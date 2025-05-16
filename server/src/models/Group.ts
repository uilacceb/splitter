import mongoose, { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
  },
  { timestamps: true }
);

export default model("Group", groupSchema);
