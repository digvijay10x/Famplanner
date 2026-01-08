const prisma = require("../config/prisma");

// Add a transaction (expense)
const addTransaction = async (req, res) => {
  try {
    const { walletId, amount, category, note } = req.body;
    const userId = req.user.userId;

    // Get wallet and verify membership
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const membership = await prisma.familyMember.findFirst({
      where: { familyId: wallet.familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    // Determine status based on role
    const isParent = ["parent_admin", "parent_editor"].includes(
      membership.role
    );
    const status = isParent ? "approved" : "pending";

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId,
        userId,
        amount,
        category,
        note,
        status,
      },
    });

    // If pending, create approval request
    if (status === "pending") {
      await prisma.pendingApproval.create({
        data: {
          transactionId: transaction.id,
          requestedBy: userId,
        },
      });
    }

    res.status(201).json({
      message:
        status === "approved"
          ? "Expense added"
          : "Expense submitted for approval",
      transaction,
    });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get transactions for a wallet
const getWalletTransactions = async (req, res) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.userId;

    const wallet = await prisma.wallet.findUnique({
      where: { id: parseInt(walletId) },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const membership = await prisma.familyMember.findFirst({
      where: { familyId: wallet.familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId: parseInt(walletId) },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get pending approvals for a family
const getPendingApprovals = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.userId;

    const membership = await prisma.familyMember.findFirst({
      where: { familyId: parseInt(familyId), userId },
    });

    if (
      !membership ||
      !["parent_admin", "parent_editor"].includes(membership.role)
    ) {
      return res.status(403).json({ error: "Only parents can view approvals" });
    }

    const pending = await prisma.pendingApproval.findMany({
      where: { decision: null },
      include: {
        transaction: {
          include: {
            wallet: { select: { id: true, name: true, familyId: true } },
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Filter to only this family's approvals
    const familyApprovals = pending.filter(
      (p) => p.transaction.wallet.familyId === parseInt(familyId)
    );

    res.json({ approvals: familyApprovals });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve a transaction
const approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const approval = await prisma.pendingApproval.findUnique({
      where: { transactionId: parseInt(transactionId) },
      include: { transaction: { include: { wallet: true } } },
    });

    if (!approval) {
      return res.status(404).json({ error: "Approval not found" });
    }

    const membership = await prisma.familyMember.findFirst({
      where: { familyId: approval.transaction.wallet.familyId, userId },
    });

    if (
      !membership ||
      !["parent_admin", "parent_editor"].includes(membership.role)
    ) {
      return res.status(403).json({ error: "Only parents can approve" });
    }

    // Update approval
    await prisma.pendingApproval.update({
      where: { id: approval.id },
      data: {
        decision: "approved",
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: parseInt(transactionId) },
      data: { status: "approved" },
    });

    res.json({ message: "Transaction approved" });
  } catch (error) {
    console.error("Approve transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject a transaction
const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const approval = await prisma.pendingApproval.findUnique({
      where: { transactionId: parseInt(transactionId) },
      include: { transaction: { include: { wallet: true } } },
    });

    if (!approval) {
      return res.status(404).json({ error: "Approval not found" });
    }

    const membership = await prisma.familyMember.findFirst({
      where: { familyId: approval.transaction.wallet.familyId, userId },
    });

    if (
      !membership ||
      !["parent_admin", "parent_editor"].includes(membership.role)
    ) {
      return res.status(403).json({ error: "Only parents can reject" });
    }

    // Update approval
    await prisma.pendingApproval.update({
      where: { id: approval.id },
      data: {
        decision: "rejected",
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    });

    // Update transaction status
    await prisma.transaction.update({
      where: { id: parseInt(transactionId) },
      data: { status: "rejected" },
    });

    res.json({ message: "Transaction rejected" });
  } catch (error) {
    console.error("Reject transaction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addTransaction,
  getWalletTransactions,
  getPendingApprovals,
  approveTransaction,
  rejectTransaction,
};
