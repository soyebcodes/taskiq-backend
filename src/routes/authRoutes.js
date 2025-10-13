import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

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
        const token = generateToken(newUser);

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


// POST /auth/login
router.post("/login", async (req,res) => {
    try {
        const {email, password} = req.body;

        // validate input
        if(!email || !password) {
            return res.status(400).json({message: "Please provide all required fields."})

        }

        // check if user exists
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "Invalid email or password."})
        }

        // compare passwords
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({message: "Invalid email or password."})
        }

        // generate JWT token
        const token = generateToken(user);

        // Respond with token + user info
        res.status(200).json({
            message: "Login successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({message: "Server error. Please try again later."})
    }
})

export default router;