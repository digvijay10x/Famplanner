const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createWallet,
  getFamilyWallets,
  getWallet,
} = require("../controllers/walletController");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /wallet - Create a new wallet
router.post("/", createWallet);

// GET /wallet/:walletId - Get single wallet with spent info
router.get("/:walletId", getWallet);

// GET /wallet/family/:familyId - Get all wallets for a family
router.get("/family/:familyId", getFamilyWallets);

module.exports = router;
