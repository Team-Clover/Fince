import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["budget", "transaction", "invoice", "system", "security", "other"],
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
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
