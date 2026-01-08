"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/AuthContext";
import Navbar from "../../../components/Navbar";
import api from "../../../lib/api";
import { RiArrowLeftLine, RiPieChartLine } from "react-icons/ri";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Wallet {
  id: number;
  name: string;
  monthlyBudget: number;
}

interface Transaction {
  id: number;
  amount: number;
  category: string;
  status: string;
  createdAt: string;
  wallet?: {
    name: string;
  };
  user?: {
    name: string;
  };
}

const COLORS = [
  "#ffffff",
  "#a3a3a3",
  "#737373",
  "#525252",
  "#404040",
  "#262626",
];

export default function AnalyticsPage() {
  const params = useParams();
  const familyId = Number(params.familyId);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && familyId) {
      fetchData();
    }
  }, [user, familyId]);

  const fetchData = async () => {
    try {
      const walletsRes = await api.get(`/wallet/family/${familyId}`);
      setWallets(walletsRes.data.wallets);

      const allTransactions: Transaction[] = [];
      for (const wallet of walletsRes.data.wallets) {
        const txRes = await api.get(`/transaction/wallet/${wallet.id}`);
        const txWithWallet = txRes.data.transactions.map((t: Transaction) => ({
          ...t,
          wallet: { name: wallet.name },
        }));
        allTransactions.push(...txWithWallet);
      }
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const approvedTransactions = transactions.filter(
    (t) => t.status === "approved"
  );

  const categoryData = approvedTransactions.reduce(
    (acc: { [key: string]: number }, t) => {
      const category = t.category || "Other";
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    },
    {}
  );

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const walletData = approvedTransactions.reduce(
    (acc: { [key: string]: number }, t) => {
      const walletName = t.wallet?.name || "Unknown";
      acc[walletName] = (acc[walletName] || 0) + t.amount;
      return acc;
    },
    {}
  );

  const barData = wallets.map((wallet) => ({
    name: wallet.name,
    spent: walletData[wallet.name] || 0,
    budget: wallet.monthlyBudget,
  }));

  const memberData = approvedTransactions.reduce(
    (acc: { [key: string]: number }, t) => {
      const userName = t.user?.name || "Unknown";
      acc[userName] = (acc[userName] || 0) + t.amount;
      return acc;
    },
    {}
  );

  const memberPieData = Object.entries(memberData).map(([name, value]) => ({
    name,
    value,
  }));

  const totalSpent = approvedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = wallets.reduce((sum, w) => sum + w.monthlyBudget, 0);

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={`/family/${familyId}`}
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <RiArrowLeftLine /> Back to Family
          </Link>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-neutral-400">
            Visualize your family spending patterns
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-neutral-400 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-neutral-400 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold">
              ₹{totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
            <p className="text-neutral-400 text-sm mb-1">Remaining</p>
            <p
              className={`text-2xl font-bold ${
                totalBudget - totalSpent < 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              ₹{(totalBudget - totalSpent).toLocaleString()}
            </p>
          </div>
        </div>

        {approvedTransactions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
            <RiPieChartLine className="text-4xl mx-auto mb-4 text-neutral-600" />
            <h3 className="text-lg font-medium mb-2">No data yet</h3>
            <p className="text-neutral-500">
              Add some transactions to see analytics
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
              <h2 className="text-lg font-semibold mb-4">
                Spending by Category
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => [
                      `₹${(Number(value) || 0).toLocaleString()}`,
                      "Amount",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
              <h2 className="text-lg font-semibold mb-4">Spending by Member</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={memberPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {memberPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => [
                      `₹${(Number(value) || 0).toLocaleString()}`,
                      "Amount",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">
                Budget vs Spent by Wallet
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                  <XAxis
                    type="number"
                    stroke="#525252"
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#525252"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid #262626",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) =>
                      `₹${(Number(value) || 0).toLocaleString()}`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="budget"
                    fill="#404040"
                    name="Budget"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="spent"
                    fill="#ffffff"
                    name="Spent"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
