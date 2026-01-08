"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./lib/AuthContext";
import { RiWallet3Line, RiTeamLine, RiRobot2Line } from "react-icons/ri";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Family Budgeting,
            <br />
            Made Simple
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-neutral-400">
            Manage shared expenses, track spending, and get AI-powered insights
            — all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-8 py-3 font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-neutral-600 px-8 py-3 font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <RiWallet3Line className="mb-4 text-3xl text-white" />
            <h3 className="mb-2 text-lg font-semibold">Shared Wallets</h3>
            <p className="text-neutral-400">
              Create wallets for groceries, school, fun, and more. Everyone
              stays on the same page.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <RiTeamLine className="mb-4 text-3xl text-white" />
            <h3 className="mb-2 text-lg font-semibold">Family Roles</h3>
            <p className="text-neutral-400">
              Parents approve expenses, kids learn responsibility. Control who
              can spend what.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <RiRobot2Line className="mb-4 text-3xl text-white" />
            <h3 className="mb-2 text-lg font-semibold">AI Coach</h3>
            <p className="text-neutral-400">
              Get weekly summaries and smart advice powered by AI to optimize
              your family budget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
