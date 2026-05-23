import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    role: {
      type: String,
      enum: ["user", "model", "assistant", "system"],
      required: true,
    },

    message: {
      type: String,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const AIChat = mongoose.model("AIChat", aiChatSchema);

export default AIChat;
