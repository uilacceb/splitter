import express from "express";
import GroupRequest from "../models/GroupRequest";
import mongoose from "mongoose";
import Group from "../models/Group";

const groupRouter = express.Router();

// GET: All groups for a user
groupRouter.get("/", async (req, res) => {
  const { userId } = req.query;
  const groups = await Group.find({ members: userId });
  res.json(groups);
});

// GET: All group requests for a user
groupRouter.get("/requests", async (req, res) => {
  const { userId } = req.query;

  try {
    const requests = await GroupRequest.find({ to: userId, status: "pending" })
      .populate("groupId")
      .populate("from", "name email");

    const filtered = requests.filter((r) => r.groupId && r.from); // remove null refs

    res.json(filtered);
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
      members: [new mongoose.Types.ObjectId(fromUserId)],
    });

    await newGroup.save();

    //Create group invitations
    const requests = members
      .filter((memberId: string) => memberId !== fromUserId)
      .map((memberId: string) => ({
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

// PUT: Update group details
groupRouter.put("/requests/:id/accept", async (req: any, res: any) => {
  const requestId = req.params.id;

  try {
    const request = await GroupRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();

    // Add user to group members
    await Group.findByIdAndUpdate(request.groupId, {
      $addToSet: { members: request.to },
    });

    res.json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept group request" });
  }
});

// PUT: Reject/Ignore a group request
// DELETE: Ignore (delete) a group request
groupRouter.delete("/requests/:id", async (req: any, res: any) => {
  const requestId = req.params.id;
  ``;
  try {
    const request = await GroupRequest.findByIdAndDelete(requestId);
    if (!request) {
      return res.status(404).json({ message: "Group request not found" });
    }

    res.json({ message: "Group request ignored and deleted" });
  } catch (err) {
    console.error("Error deleting group request:", err);
    res.status(500).json({ message: "Failed to ignore group request" });
  }
});

export default groupRouter;
