const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  generateSummary,
  getSummaries,
} = require("../controllers/aiController");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /ai/summary - Generate AI summary
router.post("/summary", generateSummary);

// GET /ai/summaries/:familyId - Get past summaries
router.get("/summaries/:familyId", getSummaries);

module.exports = router;
