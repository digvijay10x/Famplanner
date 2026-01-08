const prisma = require("../config/prisma");

// Create a new wallet
const createWallet = async (req, res) => {
  try {
    const { familyId, name, monthlyBudget } = req.body;
    const userId = req.user.userId;

    // Verify user is a member of this family
    const membership = await prisma.familyMember.findFirst({
      where: { familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    // Only parent_admin or parent_editor can create wallets
    if (!["parent_admin", "parent_editor"].includes(membership.role)) {
      return res.status(403).json({ error: "Only parents can create wallets" });
    }

    const wallet = await prisma.wallet.create({
      data: {
        familyId,
        name,
        monthlyBudget,
        createdBy: userId,
      },
    });

    res.status(201).json({ message: "Wallet created", wallet });
  } catch (error) {
    console.error("Create wallet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all wallets for a family
const getFamilyWallets = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.userId;

    // Verify user is a member of this family
    const membership = await prisma.familyMember.findFirst({
      where: { familyId: parseInt(familyId), userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    const wallets = await prisma.wallet.findMany({
      where: { familyId: parseInt(familyId) },
    });

    res.json({ wallets });
  } catch (error) {
    console.error("Get wallets error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single wallet with spent amount
const getWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.userId;

    const wallet = await prisma.wallet.findUnique({
      where: { id: parseInt(walletId) },
      include: { family: true },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Verify user is a member of this family
    const membership = await prisma.familyMember.findFirst({
      where: { familyId: wallet.familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    // Calculate total spent (only approved transactions)
    const spent = await prisma.transaction.aggregate({
      where: { walletId: parseInt(walletId), status: "approved" },
      _sum: { amount: true },
    });

    res.json({
      wallet,
      spent: spent._sum.amount || 0,
      remaining: wallet.monthlyBudget - (spent._sum.amount || 0),
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createWallet, getFamilyWallets, getWallet };
