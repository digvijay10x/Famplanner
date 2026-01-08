"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/AuthContext";
import Navbar from "../../../components/Navbar";
import api from "../../../lib/api";
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiInboxLine,
} from "react-icons/ri";

interface Approval {
  id: number;
  decision: string | null;
  transaction: {
    id: number;
    amount: number;
    category: string;
    note: string | null;
    createdAt: string;
    wallet: {
      id: number;
      name: string;
    };
    user: {
      id: number;
      name: string;
    };
  };
}

export default function ApprovalsPage() {
  const params = useParams();
  const familyId = Number(params.familyId);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && familyId) {
      fetchApprovals();
    }
  }, [user, familyId]);

  const fetchApprovals = async () => {
    try {
      const res = await api.get(`/transaction/pending/${familyId}`);
      setApprovals(res.data.approvals);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId: number) => {
    setProcessing(transactionId);
    try {
      await api.put(`/transaction/${transactionId}/approve`);
      fetchApprovals();
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve transaction");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (transactionId: number) => {
    setProcessing(transactionId);
    try {
      await api.put(`/transaction/${transactionId}/reject`);
      fetchApprovals();
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject transaction");
    } finally {
      setProcessing(null);
    }
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
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-neutral-400">
            Review and approve expense requests from family members
          </p>
        </div>

        {/* Approvals List */}
        {approvals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
            <RiInboxLine className="text-4xl mx-auto mb-4 text-neutral-600" />
            <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
            <p className="text-neutral-500">
              All expense requests have been reviewed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="p-5 rounded-xl border border-neutral-800 bg-neutral-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400">
                      <RiTimeLine className="text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        ₹{approval.transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-neutral-300">
                        {approval.transaction.category}
                      </p>
                      <p className="text-sm text-neutral-500 mt-1">
                        Requested by{" "}
                        <span className="text-neutral-300">
                          {approval.transaction.user.name}
                        </span>
                        {" • "}
                        {approval.transaction.wallet.name}
                      </p>
                      {approval.transaction.note && (
                        <p className="text-sm text-neutral-400 mt-2 italic">
                          "{approval.transaction.note}"
                        </p>
                      )}
                      <p className="text-xs text-neutral-600 mt-2">
                        {new Date(
                          approval.transaction.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(approval.transaction.id)}
                      disabled={processing === approval.transaction.id}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <RiCloseLine />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(approval.transaction.id)}
                      disabled={processing === approval.transaction.id}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <RiCheckLine />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
