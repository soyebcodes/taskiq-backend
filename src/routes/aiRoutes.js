import express from 'express';
import fetch from 'node-fetch';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /ai/prioritize
router.post('/prioritize', protect, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ message: 'No tasks provided.' });
    }

    // Prepare task list for prompt
    const taskList = tasks
      .map(
        (t, i) =>
          `${i + 1}. ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate || 'N/A'})`
      )
      .join('\n');

    const prompt = `
You are a productivity assistant. The user has the following tasks:

${taskList}

Please:
1. Reorder them from most to least important.
2. Give 1–2 sentences explaining why each is placed in that order.
3. Provide a short summary: (Top priorities / Can wait / Optional)
Return as structured JSON:
{
  "orderedTasks": [
    { "title": "Task title", "reason": "Explanation" }
  ],
  "summary": "Short paragraph summary"
}
    `;

    // Call Pollinations AI text generation endpoint
    const response = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
    );
    const aiText = await response.text();

    // Attempt to parse the response as JSON
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      console.error('Pollinations AI returned non-JSON:', aiText);
      parsed = {
        orderedTasks: tasks.map((t) => ({
          title: t.title,
          reason: 'AI failed to parse JSON, showing original order.',
        })),
        summary: 'AI failed to produce structured JSON.',
      };
    }

    res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error('AI Prioritize error:', error.message);
    res.status(500).json({
      success: false,
      message: 'AI service error. Check your Pollinations AI usage.',
    });
  }
});

export default router;
