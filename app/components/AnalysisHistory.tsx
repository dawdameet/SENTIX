"use client";

import React, { useState } from "react";
import { AnalysisResult, SentimentLabel } from "@/lib/types";
import { Search, Trash2, ArrowUpRight, History, Database } from "lucide-react";

interface AnalysisHistoryProps {
  analyses: AnalysisResult[];
  onSelect: (analysis: AnalysisResult) => void;
  onDelete: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
  loading: boolean;
  isAuthenticated?: boolean;
}

export default function AnalysisHistory({
  analyses,
  onSelect,
  onDelete,
  onClearAll,
  loading,
  isAuthenticated = false,
}: AnalysisHistoryProps) {
  const [filter, setFilter] = useState<SentimentLabel | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = analyses.filter((a) => {
    const matchesFilter = filter === "ALL" || a.sentiment === filter;
    const matchesSearch =
      search === "" ||
      a.tweetText.toLowerCase().includes(search.toLowerCase()) ||
      (a.authorHandle && a.authorHandle.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-neutral-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
            Analysis History
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {analyses.length} saved
          </span>
        </div>

        {analyses.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="w-3 h-3" /> Clear History
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search saved tweets or handles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(["ALL", "POSITIVE", "NEUTRAL", "NEGATIVE"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filter === cat
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs"
                  : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {cat === "ALL" && "All"}
              {cat === "POSITIVE" && "Positive"}
              {cat === "NEUTRAL" && "Neutral"}
              {cat === "NEGATIVE" && "Negative"}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-neutral-400 font-mono">
          Loading history from in-memory JSON...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <Database className="w-5 h-5 mx-auto mb-2 text-neutral-400" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {search || filter !== "ALL"
              ? "No analyses match your search or filter."
              : isAuthenticated
              ? "No saved analyses yet. Analyze a tweet above to save."
              : "No analyses yet. Note: Sign in to persist your history on reload."}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isPos = item.sentiment === "POSITIVE";
            const isNeg = item.sentiment === "NEGATIVE";

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="group p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40 hover:bg-white dark:hover:bg-neutral-900 cursor-pointer transition-all flex flex-col gap-2"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isPos
                          ? "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                          : isNeg
                          ? "bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                          : "bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {item.sentiment} ({item.confidence}%)
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {item.authorHandle || "@user"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {formatTime(item.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      disabled={deletingId === item.id}
                      title="Delete from in-memory DB"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Tweet snippet */}
                <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {item.tweetText}
                </p>

                {/* Bottom mini tags */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                  <span className="capitalize">Engine: {item.provider}</span>
                  <span>
                    Pos: {(item.scores.positive * 100).toFixed(0)}% | Neu: {(item.scores.neutral * 100).toFixed(0)}% | Neg: {(item.scores.negative * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
