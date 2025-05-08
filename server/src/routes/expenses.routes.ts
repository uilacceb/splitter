import express from 'express';
import Expense from '../models/Expense';

const expenseRouter = express.Router();

// Create a new expense
expenseRouter.post('/', async (req, res) => {
  try {
    const { eventId, paidBy, amount, description } = req.body;
    const expense = await Expense.create({ eventId, paidBy, amount, description });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error });
  }
});

// Get expenses by event ID
expenseRouter.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const expenses = await Expense.find({ eventId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
});

export default expenseRouter;