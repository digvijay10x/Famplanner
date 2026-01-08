"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { RiWallet3Line, RiLogoutBoxLine, RiHome4Line } from "react-icons/ri";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg text-white"
        >
          <RiWallet3Line className="text-xl" />
          FamPlanner
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              <RiHome4Line />
              Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">{user.name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
              >
                <RiLogoutBoxLine />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
