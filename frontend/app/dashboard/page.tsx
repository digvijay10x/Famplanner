"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { RiAddLine, RiGroupLine, RiWallet3Line } from "react-icons/ri";

interface Family {
  id: number;
  familyName: string;
  role: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchFamilies();
    }
  }, [user]);

  const fetchFamilies = async () => {
    try {
      const res = await api.get("/family");
      setFamilies(res.data.families);
    } catch (error) {
      console.error("Failed to fetch families:", error);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/family", { familyName: newFamilyName });
      setNewFamilyName("");
      setShowCreateModal(false);
      fetchFamilies();
    } catch (error) {
      console.error("Failed to create family:", error);
    } finally {
      setCreating(false);
    }
  };

  if (isLoading || !user) {
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-neutral-400">Manage your family budgets</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            <RiAddLine />
            New Family
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">
            Loading families...
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
            <RiGroupLine className="text-4xl mx-auto mb-4 text-neutral-600" />
            <h3 className="text-lg font-medium mb-2">No families yet</h3>
            <p className="text-neutral-500 mb-4">
              Create your first family to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white hover:underline"
            >
              Create Family
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.map((family) => (
              <Link
                key={family.id}
                href={`/family/${family.id}`}
                className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-neutral-800">
                    <RiWallet3Line className="text-xl" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-neutral-800 text-neutral-400">
                    {family.role.replace("_", " ")}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{family.familyName}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Created {new Date(family.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Family Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md border border-neutral-800">
            <h2 className="text-xl font-bold mb-4">Create New Family</h2>
            <form onSubmit={createFamily}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Family Name
                </label>
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-700 bg-neutral-800 focus:outline-none focus:border-white transition-colors"
                  placeholder="e.g., The Smiths"
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
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
