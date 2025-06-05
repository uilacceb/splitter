import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import eventRouter from "./routes/events.routes";
import expenseRouter from "./routes/expenses.routes";
import userRouter from "./routes/users.routes";
import groupRouter from "./routes/groups.routes";
import settlementRouter from "./routes/settlement.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Splitter Application" });
});


// Routes
app.use("/api/expenses", expenseRouter);
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/events", eventRouter);
app.use("/api/settlements", settlementRouter);

export default app;
