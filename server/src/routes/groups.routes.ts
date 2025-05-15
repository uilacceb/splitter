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

export default groupRouter;
