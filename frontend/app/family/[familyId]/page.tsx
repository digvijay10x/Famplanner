"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/AuthContext";
import Navbar from "../../components/Navbar";
import api from "../../lib/api";
import {
  RiAddLine,
  RiWallet3Line,
  RiUserAddLine,
  RiArrowLeftLine,
  RiRobot2Line,
  RiCheckLine,
  RiFlag2Line,
  RiPieChartLine,
} from "react-icons/ri";

interface Wallet {
  id: number;
  name: string;
  monthlyBudget: number;
  createdAt: string;
}

interface Member {
  id: number;
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Family {
  id: number;
  familyName: string;
  role: string;
}

export default function FamilyPage() {
  const params = useParams();
  const familyId = Number(params.familyId);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [family, setFamily] = useState<Family | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Modals
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Forms
  const [walletName, setWalletName] = useState("");
  const [walletBudget, setWalletBudget] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("kid");
  const [creating, setCreating] = useState(false);

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
      const [familiesRes, walletsRes, membersRes] = await Promise.all([
        api.get("/family"),
        api.get(`/wallet/family/${familyId}`),
        api.get(`/family/${familyId}/members`),
      ]);

      const fam = familiesRes.data.families.find(
        (f: Family) => f.id === familyId
      );
      setFamily(fam || null);
      setWallets(walletsRes.data.wallets);
      setMembers(membersRes.data.members);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/wallet", {
        familyId,
        name: walletName,
        monthlyBudget: Number(walletBudget),
      });
      setWalletName("");
      setWalletBudget("");
      setShowWalletModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create wallet:", error);
    } finally {
      setCreating(false);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/family/invite", {
        familyId,
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteRole("kid");
      setShowInviteModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to invite member");
    } finally {
      setCreating(false);
    }
  };

  const generateAiSummary = async () => {
    setLoadingAi(true);
    try {
      const res = await api.post("/ai/summary", { familyId });
      setAiSummary(res.data.summary);
    } catch (error) {
      alert("Failed to generate summary. Please try again later.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-neutral-500">Family not found</p>
        </div>
      </div>
    );
  }

  const isParent =
    family.role === "parent_admin" || family.role === "parent_editor";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white mb-4 transition-colors"
          >
            <RiArrowLeftLine /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{family.familyName}</h1>
              <p className="text-neutral-400">
                Role: {family.role.replace("_", " ")}
              </p>
            </div>
            {isParent && (
              <div className="flex gap-3">
                <Link
                  href={`/family/${familyId}/analytics`}
                  className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-900 transition-colors"
                >
                  <RiPieChartLine /> Analytics
                </Link>
                <Link
                  href={`/family/${familyId}/goals`}
                  className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-900 transition-colors"
                >
                  <RiFlag2Line /> Goals
                </Link>
                <Link
                  href={`/family/${familyId}/approvals`}
                  className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-900 transition-colors"
                >
                  <RiCheckLine /> Approvals
                </Link>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 border border-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-900 transition-colors"
                >
                  <RiUserAddLine /> Invite
                </button>
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                  <RiAddLine /> New Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="mb-8 p-6 rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RiRobot2Line className="text-xl" />
              <h2 className="text-lg font-semibold">AI Finance Coach</h2>
            </div>
            <button
              onClick={generateAiSummary}
              disabled={loadingAi}
              className="text-sm border border-neutral-700 px-3 py-1 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loadingAi ? "Generating..." : "Get Summary"}
            </button>
          </div>
          {aiSummary ? (
            <div className="text-neutral-300 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{aiSummary}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-neutral-500">
              Click "Get Summary" to get AI-powered insights about your family's
              spending.
            </p>
          )}
        </div>

        {/* Wallets */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Wallets</h2>
          {wallets.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-800 rounded-xl">
              <RiWallet3Line className="text-3xl mx-auto mb-2 text-neutral-600" />
              <p className="text-neutral-500">No wallets yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets.map((wallet) => (
                <Link
                  key={wallet.id}
                  href={`/wallet/${wallet.id}`}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-neutral-800">
                      <RiWallet3Line />
                    </div>
                    <h3 className="font-semibold">{wallet.name}</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    ₹{wallet.monthlyBudget.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-500">Monthly Budget</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Members</h2>
          <div className="border border-neutral-800 rounded-xl overflow-hidden">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 ${
                  idx !== members.length - 1
                    ? "border-b border-neutral-800"
                    : ""
                }`}
              >
                <div>
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-neutral-500">
                    {member.user.email}
                  </p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-neutral-800 text-neutral-300">
                  {member.role.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">Create New Wallet</h2>
            <form onSubmit={createWallet}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., Groceries"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  value={walletBudget}
                  onChange={(e) => setWalletBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., 8000"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">Invite Member</h2>
            <form onSubmit={inviteMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                >
                  <option value="kid">Kid</option>
                  <option value="parent_editor">Parent Editor</option>
                  <option value="parent_admin">Parent Admin</option>
                  <option value="guest">Guest (Read-only)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {creating ? "Inviting..." : "Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
