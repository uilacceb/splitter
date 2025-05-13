import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String, //Google profile picture
  googleId: { type: String, required: true, unique: true }, // Google `sub` field
}, { timestamps: true });

export default model("User", userSchema);
