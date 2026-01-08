const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  createGoal,
  getFamilyGoals,
  contributeToGoal,
  deleteGoal,
} = require("../controllers/goalController");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /goal - Create a new goal
router.post("/", createGoal);

// GET /goal/family/:familyId - Get all goals for a family
router.get("/family/:familyId", getFamilyGoals);

// PUT /goal/:goalId/contribute - Add money to a goal
router.put("/:goalId/contribute", contributeToGoal);

// DELETE /goal/:goalId - Delete a goal
router.delete("/:goalId", deleteGoal);

module.exports = router;
