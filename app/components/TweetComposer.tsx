"use client";

import React, { useState } from "react";
import { Send, RefreshCw, AlertCircle } from "lucide-react";

interface TweetComposerProps {
  onAnalyze: (text: string) => Promise<void>;
  loading: boolean;
}

export default function TweetComposer({
  onAnalyze,
  loading,
}: TweetComposerProps) {
  const [tweetText, setTweetText] = useState("");

  const charCount = tweetText.length;
  const maxChars = 280;
  const isOverLimit = charCount > maxChars;
  const remaining = maxChars - charCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetText.trim() || loading || isOverLimit) return;
    await onAnalyze(tweetText);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            rows={3}
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="Enter or paste a tweet to analyze sentiment..."
            className="w-full p-3.5 text-sm sm:text-base rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-950 focus:border-neutral-900 dark:focus:border-neutral-100 transition-all resize-y min-h-[90px]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-mono ${
                isOverLimit
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : remaining <= 20
                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-neutral-400"
              }`}
            >
              {charCount} / {maxChars}
            </span>
            {isOverLimit && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-3 h-3" /> Exceeds 280 chars
              </span>
            )}
            {tweetText && (
              <button
                type="button"
                onClick={() => setTweetText("")}
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !tweetText.trim() || isOverLimit}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Analyze Tweet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
