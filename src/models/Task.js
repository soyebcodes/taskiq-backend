import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"], // Match frontend types
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"], // Match frontend types
      default: "medium",
    },
    labels: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
    },
    scheduledDate: {
      type: Date,
    },
    estimatedMinutes: {
      type: Number,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceRule: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Transform _id to id when converting to JSON
taskSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    // Transform user ObjectId to string
    if (ret.user) {
      ret.userId = ret.user.toString();
      delete ret.user;
    }
    return ret;
  },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;