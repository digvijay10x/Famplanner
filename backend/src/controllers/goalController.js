const prisma = require("../config/prisma");

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const { familyId, name, targetAmount, targetDate } = req.body;
    const userId = req.user.userId;

    // Verify membership
    const membership = await prisma.familyMember.findFirst({
      where: { familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    const goal = await prisma.goal.create({
      data: {
        familyId,
        name,
        targetAmount,
        currentAmount: 0,
        targetDate: new Date(targetDate),
      },
    });

    res.status(201).json({ message: "Goal created", goal });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all goals for a family
const getFamilyGoals = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.userId;

    // Verify membership
    const membership = await prisma.familyMember.findFirst({
      where: { familyId: parseInt(familyId), userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    const goals = await prisma.goal.findMany({
      where: { familyId: parseInt(familyId) },
      orderBy: { targetDate: "asc" },
    });

    res.json({ goals });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add money to a goal
const contributeToGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount } = req.body;
    const userId = req.user.userId;

    const goal = await prisma.goal.findUnique({
      where: { id: parseInt(goalId) },
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Verify membership
    const membership = await prisma.familyMember.findFirst({
      where: { familyId: goal.familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(goalId) },
      data: {
        currentAmount: goal.currentAmount + amount,
      },
    });

    res.json({ message: "Contribution added", goal: updatedGoal });
  } catch (error) {
    console.error("Contribute to goal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user.userId;

    const goal = await prisma.goal.findUnique({
      where: { id: parseInt(goalId) },
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Verify membership and role
    const membership = await prisma.familyMember.findFirst({
      where: { familyId: goal.familyId, userId },
    });

    if (
      !membership ||
      !["parent_admin", "parent_editor"].includes(membership.role)
    ) {
      return res.status(403).json({ error: "Only parents can delete goals" });
    }

    await prisma.goal.delete({
      where: { id: parseInt(goalId) },
    });

    res.json({ message: "Goal deleted" });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createGoal, getFamilyGoals, contributeToGoal, deleteGoal };
