import mongoose, { Schema, model } from "mongoose";
import Expense from "./Expense";
import Event from "./Event";

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    icon: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

groupSchema.pre("findOneAndDelete", async function (next) {
  const groupId = this.getQuery()["_id"];
  const events = await Event.find({ groupId });

  const eventIds = events.map((e) => e._id);
  await Expense.deleteMany({ eventId: { $in: eventIds } });
  await Event.deleteMany({ groupId });

  next();
});

export default model("Group", groupSchema);
