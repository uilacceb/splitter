import express from "express";
import GroupRequest from "../models/GroupRequest";
import mongoose from "mongoose";
import Group from "../models/Group";

const groupRouter = express.Router();

// GET: All group requests for a user
groupRouter.get("/requests", async (req, res) => {
  const { userId } = req.query;

  try {
    const requests = await GroupRequest.find({ to: userId, status: "pending" })
      .populate("groupId")
      .populate("from", "name email");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch group requests" });
  }
});

//POST: Create a new group
groupRouter.post("/", async (req: any, res: any) => {
  const { title, icon, members, fromUserId } = req.body;

  try {
    if (!title || !members?.length) {
      return res
        .status(400)
        .json({ message: "Title and members are required" });
    }

    const newGroup = new Group({
      title,
      icon,
      members: members.map((id: any) => new mongoose.Types.ObjectId(id)),
    });

    await newGroup.save();

    // Optional: Create group invitations
    const requests = members.map((memberId: any) => ({
      groupId: newGroup._id,
      from: new mongoose.Types.ObjectId(fromUserId),
      to: new mongoose.Types.ObjectId(memberId),
    }));

    await GroupRequest.insertMany(requests);

    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Failed to save group:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

export default groupRouter;
