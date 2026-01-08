"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/AuthContext";
import Navbar from "../../../components/Navbar";
import api from "../../../lib/api";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiDeleteBinLine,
  RiFlag2Line,
  RiTrophyLine,
} from "react-icons/ri";

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export default function GoalsPage() {
  const params = useParams();
  const familyId = Number(params.familyId);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Goal Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Contribute Modal
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && familyId) {
      fetchGoals();
    }
  }, [user, familyId]);

  const fetchGoals = async () => {
    try {
      const res = await api.get(`/goal/family/${familyId}`);
      setGoals(res.data.goals);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/goal", {
        familyId,
        name: goalName,
        targetAmount: Number(targetAmount),
        targetDate,
      });
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
      setShowCreateModal(false);
      fetchGoals();
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setCreating(false);
    }
  };

  const contributeToGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setContributing(true);
    try {
      await api.put(`/goal/${selectedGoal.id}/contribute`, {
        amount: Number(contributeAmount),
      });
      setContributeAmount("");
      setShowContributeModal(false);
      setSelectedGoal(null);
      fetchGoals();
    } catch (error) {
      console.error("Failed to contribute:", error);
    } finally {
      setContributing(false);
    }
  };

  const deleteGoal = async (goalId: number) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goal/${goalId}`);
      fetchGoals();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      alert("Failed to delete goal");
    }
  };

  const openContributeModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/family/${familyId}`}
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <RiArrowLeftLine /> Back to Family
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Savings Goals</h1>
              <p className="text-neutral-400">
                Track your family's savings targets
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
            >
              <RiAddLine /> New Goal
            </button>
          </div>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
            <RiFlag2Line className="text-4xl mx-auto mb-4 text-neutral-600" />
            <h3 className="text-lg font-medium mb-2">No savings goals yet</h3>
            <p className="text-neutral-500">
              Create your first goal to start saving!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = Math.min(
                (goal.currentAmount / goal.targetAmount) * 100,
                100
              );
              const isComplete = goal.currentAmount >= goal.targetAmount;
              const daysLeft = Math.ceil(
                (new Date(goal.targetDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-xl border ${
                    isComplete
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-neutral-800 bg-neutral-900"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isComplete
                            ? "bg-green-500/20 text-green-400"
                            : "bg-neutral-800 text-white"
                        }`}
                      >
                        {isComplete ? (
                          <RiTrophyLine className="text-xl" />
                        ) : (
                          <RiFlag2Line className="text-xl" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        <p className="text-sm text-neutral-500">
                          {isComplete
                            ? "🎉 Goal achieved!"
                            : daysLeft > 0
                            ? `${daysLeft} days left`
                            : "Past due date"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isComplete && (
                        <button
                          onClick={() => openContributeModal(goal)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors text-sm"
                        >
                          <RiAddLine /> Add
                        </button>
                      )}
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>₹{goal.currentAmount.toLocaleString()}</span>
                      <span className="text-neutral-500">
                        ₹{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isComplete ? "bg-green-500" : "bg-white"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-neutral-500 mt-1">
                      {progress.toFixed(0)}% complete
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">Create Savings Goal</h2>
            <form onSubmit={createGoal}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., Family Vacation"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., 50000"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">
              Add to "{selectedGoal.name}"
            </h2>
            <p className="text-neutral-400 mb-4">
              Current: ₹{selectedGoal.currentAmount.toLocaleString()} / ₹
              {selectedGoal.targetAmount.toLocaleString()}
            </p>
            <form onSubmit={contributeToGoal}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContributeModal(false);
                    setSelectedGoal(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contributing}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {contributing ? "Adding..." : "Add Money"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
