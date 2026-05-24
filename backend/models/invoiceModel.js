import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fileUrl: {
      type: String,
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["image", "pdf"],
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

    // Reference fields
    fileName: {
      type: String,
    },
    filePath: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    ocrText: {
      type: String,
      default: '',
    },
    extractedDetails: {
      merchant: { type: String, default: 'Unknown' },
      amount: { type: Number, default: 0 },
      date: { type: Date, default: Date.now },
      tax: { type: Number, default: 0 },
      category: { type: String, default: 'Uncategorized' },
      invoiceNumber: { type: String, default: '' },
      dueDate: { type: Date, default: null },
      gstNumber: { type: String, default: '' },
      items: [
        {
          name: { type: String },
          price: { type: Number },
          quantity: { type: Number, default: 1 }
        }
      ]
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    anomalyReason: {
      type: String,
      default: '',
    },
    gstVerification: {
      status: { type: String, enum: ['VERIFIED', 'INVALID', 'UNVERIFIED'], default: 'UNVERIFIED' },
      businessName: { type: String, default: '' },
      taxpayerType: { type: String, default: '' },
      stateCode: { type: String, default: '' },
      message: { type: String, default: '' },
      calculatedTaxMismatch: { type: Boolean, default: false },
      isFakeInvoice: { type: Boolean, default: false }
    },
    fraudScore: {
      type: Number,
      default: 0
    },
    blockchainHash: {
      type: String,
      default: "",
    },
    blockchainPreviousHash: {
      type: String,
      default: "",
    },
    blockchainBlockIndex: {
      type: Number,
      default: 0,
    },
    blockchainVerified: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
