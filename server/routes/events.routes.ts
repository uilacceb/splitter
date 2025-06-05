import express from "express";
import Event from "../models/Event";
import Expense from "../models/Expense";
import Settlement from "../models/Settlement";

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

// PUT: Edit event
eventRouter.put("/:id", async (req: any, res: any) => {
  const { title, date, participants } = req.body;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(date && { date }),
        ...(participants && { participants }),
      },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (err) {
    console.error("Failed to update event:", err);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE: Delete event
eventRouter.delete("/:id", async (req: any, res: any) => {
  try {
    const deleted = await Event.findOneAndDelete({ _id: req.params.id });
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    await Expense.deleteMany({ eventId: req.params.id });
    await Settlement.deleteMany({ eventId: req.params.id });
    res.json({ message: "Event, expenses, and settlements deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});


export default eventRouter;
