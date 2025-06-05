import express from "express";
import mongoose from "mongoose";
import Group from "../models/Group";
import GroupRequest from "../models/GroupRequest";
import Event from "../models/Event";
import Expense from "../models/Expense";
import Settlement from "../models/Settlement";

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
    res.json(requests.filter((r) => r.groupId && r.from));
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
    res.status(500).json({ message: "Failed to load group" });
  }
});

// GET: All pending group requests for this group
groupRouter.get("/:id/pending-requests", async (req, res) => {
  const groupId = req.params.id;
  try {
    const pendingRequests = await GroupRequest.find({
      groupId,
      status: "pending",
    }).populate("to", "name email picture");
    res.json(pendingRequests);
  } catch (err) {
    res.status(500).json({ message: "Failed to load pending requests" });
  }
});

// POST: Create group + send requests
groupRouter.post("/", async (req, res) => {
  const { title, icon, members, fromUserId } = req.body;
  try {
    const group = new Group({
      title,
      icon,
      members: [fromUserId],
      createdBy: fromUserId,
    });
    await group.save();

    const requests = members
      .filter((id: string) => id !== fromUserId)
      .map((id: string) => ({
        groupId: group._id,
        from: new mongoose.Types.ObjectId(fromUserId),
        to: new mongoose.Types.ObjectId(id),
      }));

    await GroupRequest.insertMany(requests);
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: "Failed to create group" });
  }
});

// PUT: Update group metadata
groupRouter.put("/:id/edit", async (req, res) => {
  const { title, icon } = req.body;
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { ...(title && { title }), ...(icon && { icon }) },
      { new: true }
    );
    res.json(updatedGroup);
  } catch (err) {
    res.status(500).json({ message: "Failed to update group" });
  }
});

// PUT: Accept a group request
groupRouter.put("/requests/:id/accept", async (req: any, res: any) => {
  try {
    const request = await GroupRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();

    await Group.findByIdAndUpdate(request.groupId, {
      $addToSet: { members: request.to },
    });

    res.json({ message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept group request" });
  }
});

// DELETE: Ignore a request
groupRouter.delete("/requests/:id", async (req, res) => {
  try {
    const request = await GroupRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Group request ignored and deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to ignore request" });
  }
});

// POST: Send new invitation
groupRouter.post("/:id/invite", async (req: any, res: any) => {
  const { toUserId, fromUserId } = req.body;
  const groupId = req.params.id;
  try {
    const exists = await GroupRequest.findOne({
      groupId,
      to: toUserId,
      status: "pending",
    });
    if (exists) return res.status(400).json({ message: "Already invited" });

    const newRequest = new GroupRequest({
      groupId,
      from: fromUserId,
      to: toUserId,
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: "Failed to send request" });
  }
});

// PUT: Remove group member
groupRouter.put("/:id/members/remove", async (req, res) => {
  const { userId } = req.body;
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "name email picture");

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove member" });
  }
});

// DELETE: Delete a group
groupRouter.delete("/:id", async (req: any, res: any) => {
  try {
    const deletedGroup = await Group.findOneAndDelete({ _id: req.params.id });
    if (!deletedGroup)
      return res.status(404).json({ message: "Group not found" });

    const events = await Event.find({ groupId: req.params.id });
    const eventIds = events.map((e) => e._id);

    await Event.deleteMany({ groupId: req.params.id });
    await Expense.deleteMany({ eventId: { $in: eventIds } });
    await Settlement.deleteMany({ eventId: { $in: eventIds } });

    res.json({ message: "Group, events, expenses, and settlements deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete group" });
  }
});

export default groupRouter;
