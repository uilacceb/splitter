import express from "express";
import Event from "../models/Event";

const eventRouter = express.Router();

// Create a new event
eventRouter.post("/", async (req, res) => {
  try {
    const { title, date, participants, createdBy } = req.body;
    const event = await Event.create({ title, date, participants, createdBy });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});

// Get all events
eventRouter.get("/", async (_req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});

export default eventRouter;
