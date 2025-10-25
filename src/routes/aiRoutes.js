import express from 'express';
import fetch from 'node-fetch';
import { protect } from '../middlewares/authMiddleware.js';
import Task from '../models/Task.js';

const router = express.Router();

// POST /ai/prioritize
router.post("/prioritize", protect, async (req, res) => {
  try {
    const { taskIds } = req.body;
    if (!taskIds || taskIds.length === 0)
      return res.status(400).json({ message: "No tasks provided." });

    const tasks = await Task.find({
      _id: { $in: taskIds },
      userId: req.user.id,
    }).lean();

    if (!tasks || tasks.length === 0)
      return res.status(404).json({ message: "No matching tasks found." });

    // Pollinations AI request
    const prompt = `
      You are a productivity assistant. Prioritize these tasks:
      ${tasks.map((t) => `- ${t.title}: ${t.description}`).join("\n")}
      Return a JSON with "summary" and "orderedTasks" (sorted by priority).
    `;

    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai", prompt }),
    });

    const text = await response.text();
    const safeText = text.replace(/```json|```/g, "").trim();

    let aiData;
    try {
      aiData = JSON.parse(safeText);
    } catch {
      aiData = { summary: safeText, orderedTasks: [] };
    }

    res.json(aiData);
  } catch (error) {
    console.error("AI Prioritize error:", error);
    res.status(500).json({ message: "AI service error. Check your Pollinations AI usage." });
  }
});



// AI summary
router.post("/summary", protect, async (req, res) => {
  try {
    const { date } = req.body; // optional: default to today
    const targetDate = date ? new Date(date) : new Date();

    const tasks = await Task.find({
      userId: req.user.id,
      completedAt: { $gte: new Date(targetDate.setHours(0,0,0,0)), $lte: new Date(targetDate.setHours(23,59,59,999)) }
    }).lean();

    if (!tasks.length) return res.status(200).json({ summary: "No tasks completed today." });

    const taskList = tasks.map((t, i) => `${i + 1}. ${t.title} (${t.status})`).join("\n");

    const prompt = `
You are a productivity assistant. The user completed the following tasks today:

${taskList}

Please provide a concise summary with:
1. Completed tasks
2. Pending tasks
3. Suggested focus items for tomorrow
Return structured JSON:
{
  "summary": "Short paragraph summary",
  "completedTasks": [],
  "pendingTasks": []
}
`;

    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
    const aiText = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      parsed = {
        summary: "AI failed to produce structured summary.",
        completedTasks: tasks.map(t => t.title),
        pendingTasks: [],
      };
    }

    res.status(200).json({ success: true, data: parsed });

  } catch (error) {
    console.error("AI summary error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
});


export default router;
