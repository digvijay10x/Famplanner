"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/AuthContext";
import Navbar from "../../components/Navbar";
import api from "../../lib/api";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
} from "react-icons/ri";

interface Wallet {
  id: number;
  name: string;
  monthlyBudget: number;
  familyId: number;
}

interface Transaction {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export default function WalletPage() {
  const params = useParams();
  const walletId = Number(params.walletId);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [spent, setSpent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && walletId) {
      fetchData();
    }
  }, [user, walletId]);

  const fetchData = async () => {
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get(`/wallet/${walletId}`),
        api.get(`/transaction/wallet/${walletId}`),
      ]);

      setWallet(walletRes.data.wallet);
      setSpent(walletRes.data.spent);
      setRemaining(walletRes.data.remaining);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post("/transaction", {
        walletId,
        amount: Number(amount),
        category,
        note: note || null,
      });
      setAmount("");
      setCategory("");
      setNote("");
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-neutral-500">Wallet not found</p>
        </div>
      </div>
    );
  }

  const percentSpent = Math.min((spent / wallet.monthlyBudget) * 100, 100);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/family/${wallet.familyId}`}
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <RiArrowLeftLine /> Back to Family
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{wallet.name}</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
            >
              <RiAddLine /> Add Expense
            </button>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Spent this month</p>
              <p className="text-3xl font-bold">₹{spent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-400 text-sm mb-1">Budget</p>
              <p className="text-xl">
                ₹{wallet.monthlyBudget.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                percentSpent > 90
                  ? "bg-red-500"
                  : percentSpent > 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span
              className={remaining < 0 ? "text-red-400" : "text-neutral-400"}
            >
              {remaining < 0
                ? `₹${Math.abs(remaining).toLocaleString()} over budget`
                : `₹${remaining.toLocaleString()} remaining`}
            </span>
            <span className="text-neutral-400">
              {percentSpent.toFixed(0)}% used
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-800 rounded-xl">
              <p className="text-neutral-500">No transactions yet</p>
            </div>
          ) : (
            <div className="border border-neutral-800 rounded-xl overflow-hidden">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-4 ${
                    idx !== transactions.length - 1
                      ? "border-b border-neutral-800"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : tx.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {tx.status === "approved" ? (
                        <RiCheckLine />
                      ) : tx.status === "rejected" ? (
                        <RiCloseLine />
                      ) : (
                        <RiTimeLine />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.category}</p>
                      <p className="text-sm text-neutral-500">
                        {tx.user.name} •{" "}
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                      {tx.note && (
                        <p className="text-sm text-neutral-400 mt-1">
                          {tx.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.status === "rejected"
                          ? "line-through text-neutral-500"
                          : ""
                      }`}
                    >
                      ₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={addExpense}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., Vegetables"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., Weekly groceries"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
