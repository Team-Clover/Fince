import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["image", "pdf"],
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    merchantName: {
      type: String,
      trim: true,
      default: "",
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    invoiceDate: {
      type: Date,
    },

    category: {
      type: String,
      trim: true,
      default: "Others",
    },

    purchasedItems: [
      {
        name: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],

    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    aiSummary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
