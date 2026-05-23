import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    monthlyBudget: {
      type: Number,
      required: true,
      default: 0,
    },

    categoryBudgets: {
      food: {
        type: Number,
        default: 0,
      },
      shopping: {
        type: Number,
        default: 0,
      },
      travel: {
        type: Number,
        default: 0,
      },
      medical: {
        type: Number,
        default: 0,
      },
      entertainment: {
        type: Number,
        default: 0,
      },
      utilities: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
