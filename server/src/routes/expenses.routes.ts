import express from 'express';
import Expense from '../models/Expense';

const expenseRouter = express.Router();


// GET: Expenses for a specific event
expenseRouter.get("/", async (req, res) => {
  const { eventId } = req.query;

  try {
    const expenses = await Expense.find({ eventId })
      .populate("paidBy", "name picture"); // ← this is critical

    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
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

expenseRouter.delete("/:id", async (req: any, res:any) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});


export default expenseRouter;