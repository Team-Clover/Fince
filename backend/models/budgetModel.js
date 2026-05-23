import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    monthlyBudget: {
      type: Number,
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

    familyCode: {
      type: String,
      default: null,
      index: true
    },
    category: {
      type: String,
      default: 'overall'
    },
    limit: {
      type: Number,
      min: 0
    },
    month: {
      type: Number,
      min: 1,
      max: 12
    },
    year: {
      type: Number
    }
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

// Add unique index for the month/year based budgeting system if user/category are set
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true, sparse: true });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
