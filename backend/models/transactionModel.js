import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    invoice: {
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
    },

    date: {
      type: Date,
      default: Date.now,
    },

    type: {
      type: String,
      enum: ['expense', 'income'],
      default: 'expense',
    },

    invoiceNumber: {
      type: String,
      default: '',
    },

    dueDate: {
      type: Date,
      default: null,
    },

    gstNumber: {
      type: String,
      default: '',
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    isDuplicate: {
      type: Boolean,
      default: false,
    },

    isAnomaly: {
      type: Boolean,
      default: false,
    },

    anomalyReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
