import express from "express";
import User from "../models/User";

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

export default userRouter;
