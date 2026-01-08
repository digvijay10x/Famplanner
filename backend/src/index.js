require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const familyRoutes = require("./routes/familyRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const goalRoutes = require("./routes/goalRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/family", familyRoutes);
app.use("/wallet", walletRoutes);
app.use("/transaction", transactionRoutes);
app.use("/ai", aiRoutes);
app.use("/goal", goalRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FamPlanner API is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
