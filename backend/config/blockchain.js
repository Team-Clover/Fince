import crypto from 'crypto';
import Invoice from '../models/invoiceModel.js';
import User from '../models/userModel.js';

// Calculate SHA-256 hash for invoice block data
export const calculateInvoiceHash = (index, previousHash, timestamp, dataString) => {
  return crypto
    .createHash('sha256')
    .update(index + previousHash + timestamp + dataString)
    .digest('hex');
};

// Seal an invoice into the blockchain database
export const sealInvoiceToBlockchain = async (invoice) => {
  try {
    // 1. Get the last invoice that has a blockchainHash to find the previous block
    const lastBlock = await Invoice.findOne({ 
      blockchainHash: { $ne: "" },
      _id: { $ne: invoice._id }
    }).sort({ blockchainBlockIndex: -1 });

    const index = lastBlock ? lastBlock.blockchainBlockIndex + 1 : 1;
    const previousHash = lastBlock ? lastBlock.blockchainHash : "0000000000000000000000000000000000000000000000000000000000000000";
    const timestamp = invoice.createdAt ? invoice.createdAt.getTime() : Date.now();
    
    // Core payload for hash consistency
    const dataPayload = JSON.stringify({
      id: invoice._id.toString(),
      merchant: invoice.merchantName || invoice.extractedDetails?.merchant || "Unknown",
      amount: invoice.totalAmount || invoice.extractedDetails?.amount || 0,
      date: invoice.invoiceDate || invoice.createdAt || new Date(),
    });

    const hash = calculateInvoiceHash(index, previousHash, timestamp, dataPayload);

    invoice.blockchainBlockIndex = index;
    invoice.blockchainPreviousHash = previousHash;
    invoice.blockchainHash = hash;
    invoice.blockchainVerified = true;
    
    await invoice.save();
    return invoice;
  } catch (error) {
    console.error("Failed to seal invoice to blockchain:", error);
    return invoice;
  }
};

// Verify the integrity of the entire invoice blockchain
export const verifyInvoiceBlockchain = async () => {
  try {
    const blocks = await Invoice.find({ blockchainHash: { $ne: "" } }).sort({ blockchainBlockIndex: 1 });
    
    if (blocks.length === 0) return { success: true, message: "Ledger is empty. No blocks to verify." };

    let isChainValid = true;
    const details = [];

    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = i > 0 ? blocks[i - 1] : null;

      // Recalculate hash
      const dataPayload = JSON.stringify({
        id: current._id.toString(),
        merchant: current.merchantName || current.extractedDetails?.merchant || "Unknown",
        amount: current.totalAmount || current.extractedDetails?.amount || 0,
        date: current.invoiceDate || current.createdAt || new Date(),
      });

      const recalculatedHash = calculateInvoiceHash(
        current.blockchainBlockIndex,
        current.blockchainPreviousHash,
        current.createdAt.getTime(),
        dataPayload
      );

      // Verify current block hash matches recalculation
      const isHashValid = current.blockchainHash === recalculatedHash;
      
      // Verify links
      let isLinkValid = true;
      if (previous) {
        isLinkValid = current.blockchainPreviousHash === previous.blockchainHash;
      } else {
        isLinkValid = current.blockchainPreviousHash === "0000000000000000000000000000000000000000000000000000000000000000";
      }

      const blockValid = isHashValid && isLinkValid;
      if (!blockValid) {
        isChainValid = false;
        // Mark as compromised in DB if invalid
        current.blockchainVerified = false;
        await current.save();
      }

      details.push({
        index: current.blockchainBlockIndex,
        invoiceId: current._id,
        merchant: current.merchantName || "Unknown",
        amount: current.totalAmount || 0,
        storedHash: current.blockchainHash,
        calculatedHash: recalculatedHash,
        hashMatch: isHashValid,
        linkMatch: isLinkValid,
        verified: blockValid
      });
    }

    return {
      success: isChainValid,
      message: isChainValid ? "Blockchain integrity verified. All blocks match hash signatures." : "Ledger validation failed. Integrity compromised.",
      details
    };
  } catch (error) {
    console.error("Blockchain validation error:", error);
    return { success: false, message: error.message };
  }
};

// Reward system helper
export const awardTokens = async (userId, amount, actionName) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.tokenBalance = (user.tokenBalance || 0) + amount;
    user.rewardLogs.push({
      action: actionName,
      amount: amount,
      timestamp: new Date()
    });

    await user.save();
    return user;
  } catch (error) {
    console.error("Failed to award tokens:", error);
    return null;
  }
};
