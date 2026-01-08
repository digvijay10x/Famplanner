const prisma = require("../config/prisma");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate weekly summary
const generateSummary = async (req, res) => {
  try {
    const { familyId } = req.body;
    const userId = req.user.userId;

    // Verify membership
    const membership = await prisma.familyMember.findFirst({
      where: { familyId, userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    // Get family data
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        wallets: true,
        members: { include: { user: { select: { name: true } } } },
      },
    });

    // Get recent transactions (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const transactions = await prisma.transaction.findMany({
      where: {
        wallet: { familyId },
        createdAt: { gte: oneWeekAgo },
        status: "approved",
      },
      include: {
        wallet: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    // Calculate totals per wallet
    const walletTotals = {};
    transactions.forEach((t) => {
      if (!walletTotals[t.wallet.name]) {
        walletTotals[t.wallet.name] = 0;
      }
      walletTotals[t.wallet.name] += t.amount;
    });

    // Build prompt
    const prompt = `You are a friendly family finance coach. Analyze this family's spending and give a brief, encouraging weekly summary with 2-3 practical tips.

Family: ${family.familyName}
Members: ${family.members.map((m) => m.user.name).join(", ")}

Wallets & Budgets:
${family.wallets
  .map((w) => `- ${w.name}: ₹${w.monthlyBudget}/month`)
  .join("\n")}

This Week's Spending:
${
  Object.entries(walletTotals)
    .map(([name, total]) => `- ${name}: ₹${total}`)
    .join("\n") || "No spending this week"
}

Recent Transactions:
${
  transactions
    .slice(0, 10)
    .map((t) => `- ₹${t.amount} on ${t.category} by ${t.user.name}`)
    .join("\n") || "None"
}

Give a friendly 3-4 sentence summary and 2-3 short tips. Use ₹ for currency. Be encouraging!`;

    // Generate with Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });

    const summaryText =
      chatCompletion.choices[0]?.message?.content ||
      "Unable to generate summary";

    // Save summary
    const summary = await prisma.aISummary.create({
      data: {
        familyId,
        summaryText,
      },
    });

    res.json({ summary: summaryText, savedId: summary.id });
  } catch (error) {
    console.error("Generate summary error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

// Get past summaries
const getSummaries = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.userId;

    const membership = await prisma.familyMember.findFirst({
      where: { familyId: parseInt(familyId), userId },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this family" });
    }

    const summaries = await prisma.aISummary.findMany({
      where: { familyId: parseInt(familyId) },
      orderBy: { generatedAt: "desc" },
      take: 10,
    });

    res.json({ summaries });
  } catch (error) {
    console.error("Get summaries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { generateSummary, getSummaries };
