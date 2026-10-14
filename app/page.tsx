"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import TweetComposer from "./components/TweetComposer";
import SentimentResult from "./components/SentimentResult";
import AnalysisHistory from "./components/AnalysisHistory";
import AuthModal from "./components/AuthModal";
import { User, AnalysisResult } from "@/lib/types";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Apply theme
  const applyTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("sentix_theme", newTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  // Fetch current user from JWT cookie
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Fetch analysis history (persisted in DB for signed up users)
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data.analyses || []);
        if (data.analyses && data.analyses.length > 0) {
          setCurrentAnalysis(data.analyses[0]);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    // Read saved theme, defaulting to light mode
    const savedTheme = localStorage.getItem("sentix_theme") as "dark" | "light" | null;
    applyTheme(savedTheme || "light");

    fetchCurrentUser();
    fetchHistory();
  }, [fetchCurrentUser, fetchHistory]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setAnalyses([]);
      setCurrentAnalysis(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    fetchHistory();
  };

  // Run sentiment analysis
  const handleAnalyze = async (text: string) => {
    setLoadingAnalysis(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          provider: "native",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (data.analysis) {
        setCurrentAnalysis(data.analysis);
        if (data.saved) {
          // Persisted in DB for signed-up user -> reload from DB
          await fetchHistory();
        } else {
          // Guest user: ephemeral in current session only (will NOT persist on reload)
          setAnalyses((prev) => [data.analysis, ...prev]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze tweet";
      setErrorMessage(msg);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Delete analysis
  const handleDeleteAnalysis = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Clear all
  const handleClearAllHistory = async () => {
    if (!confirm("Are you sure you want to clear your analysis history?")) return;
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setAnalyses([]);
        setCurrentAnalysis(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar
        user={user}
        onOpenAuth={(mode = "login") => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Centered Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 flex items-start justify-between gap-3 text-xs">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Centered Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Tweet Sentiment Analysis
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Enter any tweet to analyze its sentiment, scores, and polarity.
          </p>
        </div>

        {/* Centered Text Box */}
        <TweetComposer
          onAnalyze={handleAnalyze}
          loading={loadingAnalysis}
        />

        {/* Sentiment Result Output (directly below textbox) */}
        {currentAnalysis && (
          <SentimentResult analysis={currentAnalysis} />
        )}

        {/* Analysis History (placed below the textbox and output) */}
        <AnalysisHistory
          analyses={analyses}
          onSelect={(item) => setCurrentAnalysis(item)}
          onDelete={handleDeleteAnalysis}
          onClearAll={handleClearAllHistory}
          loading={loadingHistory}
          isAuthenticated={Boolean(user)}
        />
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 mt-8 bg-white dark:bg-neutral-950 text-xs text-neutral-400 text-center font-mono">
        SENTIX • Sentiment Analysis Engine
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
