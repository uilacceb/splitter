import express from "express";
import Settlement from "../models/Settlement";
import mongoose from "mongoose";
import { generateSettlements } from "../utils/genereateSettlements";

const settlementRouter = express.Router();

// GET settlements for an event (with optional 'settled' filter)
settlementRouter.get("/", async (req, res) => {
  const { eventId, settled } = req.query;
  const query: any = {};
  if (eventId) query.eventId = eventId;
  if (settled !== undefined) query.settled = settled === "true";
  try {
    const settlements = await Settlement.find(query)
      .populate("from", "name picture _id")
      .populate("to", "name picture _id");
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch settlements" });
  }
});

// PUT: Settle or unsettle a transaction
settlementRouter.put("/:id/settle", async (req: any, res: any) => {
  try {
    const { settled } = req.body; // settled: true/false
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }
    settlement.settled = settled === undefined ? true : settled;
    await settlement.save();
    // Regenerate settlements for this event (to merge/unmerge debts)
    await generateSettlements(new mongoose.Types.ObjectId(settlement.eventId));
    res.json(settlement);
  } catch (err) {
    res.status(500).json({ message: "Failed to settle/unsettle transaction" });
  }
});

export default settlementRouter;
