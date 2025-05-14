import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    picture: String, //Google profile picture
    googleId: { type: String, required: true, unique: true }, // Google `sub` field
    friendList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user
  },
  { timestamps: true }
);

export default model("User", userSchema);
