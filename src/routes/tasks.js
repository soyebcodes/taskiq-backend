import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Example protected route
router.get("/my-tasks", protect, async (req, res) => {
  try {
    // `req.user` is available here because of middleware
    const userId = req.user._id;

    // Dummy example
    res.json({ message: `Welcome ${req.user.name}!`, userId });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
