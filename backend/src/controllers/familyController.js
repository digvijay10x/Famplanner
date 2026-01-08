const prisma = require("../config/prisma");

// Create a new family
const createFamily = async (req, res) => {
  try {
    const { familyName } = req.body;
    const userId = req.user.userId;

    // Create family
    const family = await prisma.family.create({
      data: {
        familyName,
        createdBy: userId,
      },
    });

    // Add creator as Parent Admin
    await prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: userId,
        role: "parent_admin",
        joinedAt: new Date(),
      },
    });

    res.status(201).json({ message: "Family created", family });
  } catch (error) {
    console.error("Create family error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user's families
const getMyFamilies = async (req, res) => {
  try {
    const userId = req.user.userId;

    const memberships = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: true,
      },
    });

    const families = memberships.map((m) => ({
      ...m.family,
      role: m.role,
    }));

    res.json({ families });
  } catch (error) {
    console.error("Get families error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get family members
const getFamilyMembers = async (req, res) => {
  try {
    const { familyId } = req.params;

    const members = await prisma.familyMember.findMany({
      where: { familyId: parseInt(familyId) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({ members });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Invite member to family
const inviteMember = async (req, res) => {
  try {
    const { familyId, email, role } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already a member
    const existing = await prisma.familyMember.findFirst({
      where: { familyId, userId: user.id },
    });
    if (existing) {
      return res.status(400).json({ error: "User already in family" });
    }

    // Add member
    const member = await prisma.familyMember.create({
      data: {
        familyId,
        userId: user.id,
        role: role || "kid",
      },
    });

    res.status(201).json({ message: "Member invited", member });
  } catch (error) {
    console.error("Invite member error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createFamily,
  getMyFamilies,
  getFamilyMembers,
  inviteMember,
};
