import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      default: "system",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["info", "low", "medium", "high", "critical"],
      default: "info",
    },

    category: {
      type: String,
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
