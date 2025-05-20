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

// event.routes.ts
eventRouter.get("/:id", async (req: any, res: any) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "participants",
      "name email picture"
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Error loading event:", err);
    res.status(500).json({ message: "Failed to load event" });
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
