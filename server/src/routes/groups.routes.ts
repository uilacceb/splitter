import express from "express";
import GroupRequest from "../models/GroupRequest";

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
groupRouter.post("/", async (req, res) => {
  const { title, icon, members } = req.body;

  try {
    const newGroup = new GroupRequest({
      title,
      icon,
      members,
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ message: "Failed to create group" });
  }
});

export default groupRouter;
