const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createFamily,
  getMyFamilies,
  getFamilyMembers,
  inviteMember,
} = require("../controllers/familyController");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /family - Create a new family
router.post("/", createFamily);

// GET /family - Get my families
router.get("/", getMyFamilies);

// GET /family/:familyId/members - Get family members
router.get("/:familyId/members", getFamilyMembers);

// POST /family/invite - Invite member to family
router.post("/invite", inviteMember);

module.exports = router;
