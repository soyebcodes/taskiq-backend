import express from "express";
import OpenAI from "openai";
import { protect } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// POST /ai/prioritize
router.post("/prioritize", protect, async (req, res) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const { tasks } = req.body;
    const prompt = `Prioritize these tasks by importance and urgency:\n${tasks.join("\n")}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a productivity assistant." },
        { role: "user", content: prompt },
      ],
    });

    res.json({ prioritized: response.choices[0].message.content });
  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({ message: "AI service error" });
  }
});

export default router;
