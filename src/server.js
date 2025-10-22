import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"



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
app.use("/ai", aiRoutes)



// Start server and connect to DB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
.then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)
))
.catch((err) => console.error("DB connection error:", err)
)