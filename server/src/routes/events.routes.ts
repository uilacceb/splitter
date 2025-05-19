import express from "express";
import Event from "../models/Event";

const eventRouter = express.Router();

// GET: All events for a group
eventRouter.get("/", async (req, res) => {
  const { groupId } = req.query;
  try {
    const events = await Event.find({ groupId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// POST: Create a new event
eventRouter.post("/", async (req, res) => {
  const { title, date, participants, createdBy, groupId } = req.body;
  try {
    const event = new Event({ title, date, participants, createdBy, groupId });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

export default eventRouter;
