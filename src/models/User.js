import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatarUrl: {
        type: String,
        default: "",
    },
    
}, {timestamps:true})


const User = mongoose.model("User", userSchema)

export default User;