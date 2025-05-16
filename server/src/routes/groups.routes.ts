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

// GET: Group by ID
groupRouter.get("/:id", async (req: any, res: any) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name email picture")
      .populate("createdBy", "_id");
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error("Error fetching group:", err);
    res.status(500).json({ message: "Failed to load group" });
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
      members: [fromUserId],
      createdBy: fromUserId,
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

// PUT: Update group title and/or icon
groupRouter.put("/:id/edit", async (req: any, res: any) => {
  const { title, icon } = req.body;
  const groupId = req.params.id;

  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        ...(title && { title }), // only update if provided
        ...(icon && { icon }),
      },
      { new: true } // return the updated group
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(updatedGroup);
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ message: "Failed to update group" });
  }
});

// PUT: Add a member
groupRouter.put("/:id/members/add", async (req: any, res: any) => {
  const groupId = req.params.id;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name email picture");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ message: "Failed to add member" });
  }
});

// PUT: Remove a member
groupRouter.put("/:id/members/remove", async (req: any, res: any) => {
  const groupId = req.params.id;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "name email picture");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error("Error removing member:", err);
    res.status(500).json({ message: "Failed to remove member" });
  }
});

export default groupRouter;
