import express from "express";
import Expense from "../models/Expense";
import { generateSettlements } from "../utils/genereateSettlements";
import mongoose from "mongoose";

const expenseRouter = express.Router();

// GET: Expenses for a specific event
expenseRouter.get("/", async (req, res) => {
  const { eventId } = req.query;
  try {
    const expenses = await Expense.find({ eventId })
      .populate("paidBy", "name picture")
      .populate("splitWith", "name picture _id");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// POST: Add expense to an event
expenseRouter.post("/", async (req, res) => {
  const { eventId, paidBy, amount, description, splitWith } = req.body;
  try {
    const expense = new Expense({
      eventId,
      paidBy,
      amount,
      description,
      splitWith,
    });
    await expense.save();
    await generateSettlements(new mongoose.Types.ObjectId(eventId));
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to add expense" });
  }
});

// PUT: Update an existing expense
expenseRouter.put("/:id", async (req:any, res:any) => {
  const { description, amount, splitWith } = req.body;
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { description, amount, splitWith },
      { new: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    await generateSettlements(new mongoose.Types.ObjectId(updatedExpense.eventId));
    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: "Failed to update expense" });
  }
});

// DELETE: Delete an expense
expenseRouter.delete("/:id", async (req:any, res:any) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.deleteOne();
    await generateSettlements(new mongoose.Types.ObjectId(expense.eventId));
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

expenseRouter.get("/:id", async (req: any, res: any) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("paidBy", "name picture")
      .populate("splitWith", "_id name picture");

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.json(expense);
  } catch (err) {
    console.error("Error loading expense:", err);
    res.status(500).json({ message: "Failed to load expense" });
  }
});

export default expenseRouter;
