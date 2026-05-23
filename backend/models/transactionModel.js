import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      trim: true,
      default: "Others",
    },

    merchant: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "wallet", "other"],
      default: "other",
    },

    transactionDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
