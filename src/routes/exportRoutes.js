import express from "express";
import { Parser } from "json2csv";
import Task from "../models/Task.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/csv", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).lean();
    if (!tasks.length) return res.status(400).json({ message: "No tasks found." });

    const fields = ["title", "description", "status", "priority", "dueDate"];
    const parser = new Parser({ fields });
    const csv = parser.parse(tasks);

    res.header("Content-Type", "text/csv");
    res.attachment("tasks.csv");
    res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
