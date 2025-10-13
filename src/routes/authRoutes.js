import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /auth/signup
router.post("/signup", async (req,res) => {
    try {
        const {name, email, password} = req.body;
        // basic validation
        if(!name || !email || !password) {
            return res.status(400).json({message: "Please provide all required fields."});

        }
        // check if user exists
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message: "User already exists."});
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in DB
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        // Generate JWT token
        const token = jwt.sign({
            id: newUser._id,
            email: newUser.email,

        }, process.env.JWT_SECRET, {expiresIn: "7d"})

        // Return success response
        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
        })
        
    } catch (error) {
        console.error("Signup error:", error)
        res.status(500).json({message: "Server error. Please try again later."})
    }
})


export default router;