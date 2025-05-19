import express from 'express';
import Expense from '../models/Expense';

const expenseRouter = express.Router();


// GET: Expenses for a specific event
expenseRouter.get("/", async (req, res) => {
  const { eventId } = req.query;
  try {
    const expenses = await Expense.find({ eventId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// POST: Add expense to an event
expenseRouter.post("/", async (req, res) => {
  const { eventId, paidBy, amount, description } = req.body;
  try {
    const expense = new Expense({ eventId, paidBy, amount, description });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to add expense" });
  }
});

export default expenseRouter;