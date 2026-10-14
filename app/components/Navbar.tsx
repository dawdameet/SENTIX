"use client";

import React from "react";
import { User } from "@/lib/types";
import { LogOut, Sun, Moon } from "lucide-react";

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode?: "login" | "register") => void;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-30 transition-colors">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-mono font-black text-xs tracking-tighter">
            //S
          </div>
          <span className="font-mono font-bold tracking-tight text-sm text-neutral-900 dark:text-white">
            SENTIX
          </span>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1"></div>

          {/* Auth State */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                @{user.username}
              </span>
              <button
                onClick={onLogout}
                title="Log out"
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth("login")}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
