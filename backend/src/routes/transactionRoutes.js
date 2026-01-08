const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  addTransaction,
  getWalletTransactions,
  getPendingApprovals,
  approveTransaction,
  rejectTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /transaction - Add a new transaction
router.post("/", addTransaction);

// GET /transaction/wallet/:walletId - Get transactions for a wallet
router.get("/wallet/:walletId", getWalletTransactions);

// GET /transaction/pending/:familyId - Get pending approvals for a family
router.get("/pending/:familyId", getPendingApprovals);

// PUT /transaction/:transactionId/approve - Approve a transaction
router.put("/:transactionId/approve", approveTransaction);

// PUT /transaction/:transactionId/reject - Reject a transaction
router.put("/:transactionId/reject", rejectTransaction);

module.exports = router;
