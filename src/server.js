import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({message: "TaskIQ API is running."});
})


// Routes
app.use("/auth", authRoutes)
app.use("/tasks", taskRoutes)

// Start server and connect to DB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)
))
.catch((err) => console.error("DB connection error:", err)
)