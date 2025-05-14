import express from "express";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";
import mongoose from "mongoose";

const userRouter = express.Router();

// Called after Google login to create or get user
userRouter.post("/google-auth", async (req, res) => {
  try {
    const { email, name, picture, sub } = req.body;

    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        googleId: sub,
        friendList: [],
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "User auth failed", error });
  }
});

userRouter.get("/friends", async (req: any, res: any) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).populate(
      "friendList",
      "name email _id picture"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friendList);
  } catch (error: any) {
    console.error("Failed to fetch friend list:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch friend list", error: error.message });
  }
});

userRouter.get("/search", async (req: any, res: any) => {
  try {
    const query = req.query.query?.toString().trim();
    if (!query) return res.status(400).json({ message: "Query is required" });

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).select("name email picture _id"); // Optional: only return selected fields

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

userRouter.post("/friends/request", async (req: any, res: any) => {
  try {
    const { to } = req.body;
    const from = req.user?.id || req.body.from; // Use token-based or fallback for testing

    if (from === to) {
      return res
        .status(400)
        .json({ message: "You can't send a friend request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({ from, to });
    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const newRequest = await FriendRequest.create({ from, to });

    res
      .status(201)
      .json({ message: "Friend request sent", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Failed to send friend request", error });
  }
});

// GET /api/users/friends/requests?userId=xyz
userRouter.get("/friends/requests", async (req: any, res: any) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }

  try {
    const requests = await FriendRequest.find({ to: userId, status: "pending" })
      .populate("from", "name email picture")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error: any) {
    console.error("Error fetching friend requests:", error);
    res
      .status(500)
      .json({ message: "Failed to get friend requests", error: error.message });
  }
});

// PUT /api/users/friends/requests/:requestId/accept
userRouter.put(
  "/friends/requests/:requestId/accept",
  async (req: any, res: any) => {
    try {
      const requestId = req.params.requestId;
      const request = await FriendRequest.findById(requestId);

      if (!request || request.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Request not found or already handled" });
      }

      // Add each user to the other's friend list
      await User.findByIdAndUpdate(request.from, {
        $addToSet: { friendList: request.to },
      });
      await User.findByIdAndUpdate(request.to, {
        $addToSet: { friendList: request.from },
      });

      // Update request status
      request.status = "accepted";
      await request.save();

      res.status(200).json({ message: "Friend request accepted" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Failed to accept request", error: error.message });
    }
  }
);

// DELETE /api/users/friends/requests/:requestId
userRouter.delete(
  "/friends/requests/:requestId",
  async (req: any, res: any) => {
    try {
      const requestId = req.params.requestId;
      const request = await FriendRequest.findById(requestId);

      if (!request) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      await FriendRequest.findByIdAndDelete(requestId);
      res.status(200).json({ message: "Friend request ignored (deleted)" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Failed to ignore request", error: error.message });
    }
  }
);

export default userRouter;
