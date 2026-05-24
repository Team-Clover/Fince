import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protectRoute } from '../middleware/auth.js';
import { 
  uploadInvoice, 
  confirmInvoice, 
  getInvoices, 
  deleteInvoice, 
  manualInvoice,
  verifyBlockchainLedger,
  secureReportValidation
} from '../controllers/invoiceController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const invoiceRouter = express.Router();

invoiceRouter.post('/upload', protectRoute, upload.single('invoice'), uploadInvoice);
invoiceRouter.post('/confirm/:id', protectRoute, confirmInvoice);
invoiceRouter.get('/verify-blockchain', protectRoute, verifyBlockchainLedger);
invoiceRouter.post('/validate-report', protectRoute, secureReportValidation);
invoiceRouter.get('/', protectRoute, getInvoices);
invoiceRouter.delete('/:id', protectRoute, deleteInvoice);
invoiceRouter.post('/manual', protectRoute, manualInvoice);

export default invoiceRouter;
