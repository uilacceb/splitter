import express from "express";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";

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

export default userRouter;
