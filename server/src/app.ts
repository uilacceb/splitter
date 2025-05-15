import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import eventRouter from "./routes/events.routes";
import expenseRouter from "./routes/expenses.routes";
import userRouter from "./routes/users.routes";
import groupRouter from "./routes/groups.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/events", eventRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
