import express from "express";
import Settlement from "../models/Settlement";

const settlementRouter = express.Router();

settlementRouter.get("/test", (req, res) => {
  res.json({ ok: true });
});
// GET settlements for an event
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

// PUT: Settle a transaction
settlementRouter.put("/:id/settle", async (req: any, res: any) => {
  try {
    const settlement = await Settlement.findByIdAndUpdate(
      req.params.id,
      { settled: true },
      { new: true }
    );
    if (!settlement) {
      return res.status(404).json({ message: "Settlement not found" });
    }
    res.json(settlement);
  } catch (err) {
    res.status(500).json({ message: "Failed to settle transaction" });
  }
});

export default settlementRouter;
