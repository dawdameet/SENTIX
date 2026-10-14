"use client";

import React, { useState } from "react";
import { X, Sliders, Database, Key, Check, Info, Server, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: "native" | "huggingface";
  onSelectProvider: (p: "native" | "huggingface") => void;
  hfApiKey: string;
  onSaveHfApiKey: (key: string) => void;
  stats?: { totalUsers: number; totalAnalyses: number };
}

export default function SettingsModal({
  isOpen,
  onClose,
  provider,
  onSelectProvider,
  hfApiKey,
  onSaveHfApiKey,
  stats,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(hfApiKey);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveHfApiKey(keyInput.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Engine & In-Memory DB Settings
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure sentiment analysis APIs and inspect system runtime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Analysis Engine Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-2">
              Default Analysis Engine
            </label>
            <div className="space-y-2">
              <label
                onClick={() => onSelectProvider("native")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  provider === "native"
                    ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/80"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === "native"}
                  onChange={() => onSelectProvider("native")}
                  className="mt-1 accent-neutral-900 dark:accent-neutral-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> Native Twitter NLP Engine
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Zero latency, runs locally in Next.js API, incorporates Twitter slang, emojis, negation heuristics, and aspect extraction. No external key required.
                  </p>
                </div>
              </label>

              <label
                onClick={() => onSelectProvider("huggingface")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  provider === "huggingface"
                    ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800/80"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="engine"
                  checked={provider === "huggingface"}
                  onChange={() => onSelectProvider("huggingface")}
                  className="mt-1 accent-neutral-900 dark:accent-neutral-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" /> Hugging Face Inference API
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      External Model
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Calls model <code className="font-mono text-[10px]">cardiffnlp/twitter-roberta-base-sentiment-latest</code> via Hugging Face Serverless Router. Requires HF user token.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Hugging Face API Key input */}
          <form onSubmit={handleSave} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neutral-400" />
                Hugging Face User Access Token (Optional)
              </label>
              {savedNotice && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Saved!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Save
              </button>
            </div>
            <span className="text-[10px] text-neutral-400 block">
              Token is saved locally in your browser session for direct API invocation.
            </span>
          </form>

          {/* In-Memory JSON Database Diagnostics */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>In-Memory JSON Database Status</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Active Users</span>
                <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {stats?.totalUsers ?? 1}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Saved Analyses</span>
                <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {stats?.totalAnalyses ?? 2}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
              <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>
                Stateless in-memory singleton mapped to <code className="font-mono text-[10px]">data/db.json</code>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
