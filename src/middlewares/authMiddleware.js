import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header is present and starts with "Bearer"
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    {
        try {
            // Extract the token from the header
            token = req.headers.authorization.split(" ")[1];

            // Verify the token from the header
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user in DB
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error("Auth error:", error)
            res.status(401).json({message: "Not authorized, token failed"})
        }
    } else {
        res.status(401).json({message: "No token provided, not authorized"})
    }
}
