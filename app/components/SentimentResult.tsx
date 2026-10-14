"use client";

import React, { useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { Check, Copy, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentResultProps {
  analysis: AnalysisResult | null;
}

export default function SentimentResult({ analysis }: SentimentResultProps) {
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  const isPositive = analysis.sentiment === "POSITIVE";
  const isNegative = analysis.sentiment === "NEGATIVE";
  const isNeutral = analysis.sentiment === "NEUTRAL";

  const handleCopy = () => {
    const textToCopy = `Tweet: "${analysis.tweetText}"
Sentiment: ${analysis.sentiment} (${analysis.confidence}% confidence)
Scores: Pos: ${(analysis.scores.positive * 100).toFixed(0)}% | Neu: ${(analysis.scores.neutral * 100).toFixed(0)}% | Neg: ${(analysis.scores.negative * 100).toFixed(0)}%`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs transition-colors space-y-4">
      {/* Top Banner: Sentiment Badge & Confidence */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center border font-bold text-base ${
              isPositive
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400"
                : isNegative
                ? "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400"
                : "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isPositive && <TrendingUp className="w-5 h-5" />}
            {isNegative && <TrendingDown className="w-5 h-5" />}
            {isNeutral && <Minus className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                  isPositive
                    ? "bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                    : isNegative
                    ? "bg-rose-100/70 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                    : "bg-amber-100/70 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                }`}
              >
                {analysis.sentiment}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {analysis.confidence}% confidence
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Polarity: {analysis.polarity > 0 ? `+${analysis.polarity}` : analysis.polarity}
            </span>
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Tweet Quote Box */}
      <div className="bg-neutral-50 dark:bg-neutral-950/70 rounded-xl p-3.5 border border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed">
          &ldquo;{analysis.tweetText}&rdquo;
        </p>
      </div>

      {/* Score Distribution Bars */}
      <div className="space-y-2 pt-1">
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Positive</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {(analysis.scores.positive * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, analysis.scores.positive * 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-amber-700 dark:text-amber-400 font-medium">Neutral</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {(analysis.scores.neutral * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, analysis.scores.neutral * 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-rose-700 dark:text-rose-400 font-medium">Negative</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {(analysis.scores.negative * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, analysis.scores.negative * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
