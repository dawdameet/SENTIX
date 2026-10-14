import { AnalysisResult, SentimentLabel, SentimentScores, EmotionScore, AspectSentiment } from "./types";

// Sentiment Lexicon with weights (-3.0 to +3.0)
const LEXICON: Record<string, number> = {
  // Positive words
  love: 2.8,
  amazing: 2.9,
  excellent: 2.7,
  awesome: 2.8,
  fantastic: 2.8,
  great: 2.2,
  good: 1.6,
  best: 2.9,
  wonderful: 2.6,
  brilliant: 2.7,
  superb: 2.7,
  perfect: 3.0,
  impressive: 2.4,
  clean: 1.5,
  fast: 1.8,
  smooth: 1.7,
  reliable: 2.0,
  helpful: 1.9,
  happy: 2.1,
  excited: 2.4,
  favorite: 2.3,
  recommend: 2.2,
  beautiful: 2.3,
  intuitive: 2.0,
  genius: 2.6,
  solid: 1.5,
  valuable: 1.9,
  gem: 2.3,
  banger: 2.5,
  fire: 2.4,
  goat: 2.9,
  clutch: 2.4,
  hyped: 2.1,
  slaps: 2.2,
  based: 1.9,
  legit: 2.0,
  peak: 2.1,
  win: 2.0,
  huge: 0.8,
  breakthrough: 2.6,
  upgrade: 1.8,
  solved: 1.8,
  flawless: 2.8,
  thank: 1.5,
  thanks: 1.5,
  glad: 1.8,
  enjoy: 2.0,

  // Negative words
  hate: -2.9,
  terrible: -2.8,
  horrible: -2.9,
  awful: -2.8,
  worst: -3.0,
  bad: -1.8,
  poor: -1.7,
  crap: -2.4,
  trash: -2.7,
  garbage: -2.7,
  broken: -2.4,
  bug: -1.7,
  buggy: -2.2,
  crash: -2.5,
  crashed: -2.6,
  crashes: -2.5,
  lag: -1.8,
  laggy: -2.1,
  slow: -1.6,
  sucks: -2.6,
  suck: -2.5,
  annoying: -2.1,
  frustrated: -2.5,
  frustrating: -2.5,
  disappointed: -2.6,
  disappointing: -2.5,
  useless: -2.6,
  unusable: -2.8,
  unresponsive: -2.5,
  scam: -3.0,
  scammer: -3.0,
  fraud: -3.0,
  shady: -2.3,
  rip: -1.8,
  mid: -1.2,
  cringe: -2.0,
  flop: -2.3,
  ruined: -2.6,
  stalled: -2.1,
  fail: -2.3,
  failed: -2.4,
  failure: -2.4,
  waste: -2.3,
  pain: -2.0,
  painful: -2.3,
  ugly: -2.0,
  confusing: -1.7,
  lost: -1.8,
  mess: -2.2,
  regret: -2.2,
  shame: -2.0,
  warning: -1.5,
};

// Emojis with sentiment and emotion mapping
const EMOJI_MAP: Record<string, { weight: number; emotion?: string }> = {
  "🔥": { weight: 2.4, emotion: "Joy / Excitement" },
  "🚀": { weight: 2.5, emotion: "Optimism / Hope" },
  "❤️": { weight: 2.6, emotion: "Love / Gratitude" },
  "💖": { weight: 2.6, emotion: "Love / Gratitude" },
  "😍": { weight: 2.7, emotion: "Joy / Excitement" },
  "🥰": { weight: 2.5, emotion: "Love / Gratitude" },
  "🥳": { weight: 2.4, emotion: "Joy / Excitement" },
  "👏": { weight: 1.8, emotion: "Appreciation" },
  "✨": { weight: 1.7, emotion: "Delight" },
  "💯": { weight: 2.2, emotion: "Satisfaction" },
  "🎉": { weight: 2.3, emotion: "Joy / Excitement" },
  "🙌": { weight: 1.9, emotion: "Celebration" },
  "🤩": { weight: 2.6, emotion: "Joy / Excitement" },
  "👍": { weight: 1.5, emotion: "Approval" },
  "💪": { weight: 1.7, emotion: "Confidence" },
  "🤝": { weight: 1.5, emotion: "Collaboration" },
  "👑": { weight: 2.0, emotion: "Admiration" },

  "💀": { weight: -1.5, emotion: "Sarcasm / Shock" },
  "😭": { weight: -1.2, emotion: "Sadness / Despair" },
  "😡": { weight: -2.8, emotion: "Frustration / Anger" },
  "🤬": { weight: -3.0, emotion: "Frustration / Anger" },
  "🤮": { weight: -2.7, emotion: "Disgust" },
  "🤢": { weight: -2.3, emotion: "Disgust" },
  "💔": { weight: -2.4, emotion: "Heartbreak / Sadness" },
  "📉": { weight: -1.9, emotion: "Pessimism" },
  "👎": { weight: -2.0, emotion: "Disapproval" },
  "🤦": { weight: -1.8, emotion: "Frustration / Regret" },
  "🤦‍♂️": { weight: -1.8, emotion: "Frustration / Regret" },
  "🤦‍♀️": { weight: -1.8, emotion: "Frustration / Regret" },
  "🗑️": { weight: -2.4, emotion: "Disgust" },
  "💩": { weight: -2.3, emotion: "Disapproval" },
  "🤡": { weight: -2.1, emotion: "Mockery / Disdain" },
  "😤": { weight: -1.8, emotion: "Frustration / Anger" },

  "🤔": { weight: 0.0, emotion: "Curiosity / Pensive" },
  "😐": { weight: -0.5, emotion: "Neutrality" },
  "🤷": { weight: -0.2, emotion: "Indifference" },
  "🧐": { weight: 0.1, emotion: "Curiosity" },
};

// Negation words
const NEGATIONS = new Set([
  "not",
  "no",
  "never",
  "neither",
  "hardly",
  "scarcely",
  "barely",
  "cant",
  "can't",
  "dont",
  "don't",
  "isnt",
  "isn't",
  "wont",
  "won't",
  "without",
  "lacks",
  "nobody",
  "nowhere",
  "none",
]);

// Intensifiers / Boosters
const BOOSTERS: Record<string, number> = {
  super: 1.5,
  very: 1.4,
  extremely: 1.7,
  insanely: 1.8,
  deeply: 1.5,
  totally: 1.4,
  completely: 1.6,
  absolutely: 1.7,
  genuinely: 1.4,
  incredibly: 1.6,
  immensely: 1.5,
  massively: 1.5,
  really: 1.3,
  so: 1.25,
  barely: 0.4,
  slightly: 0.6,
  somewhat: 0.7,
  hardly: 0.3,
};

// Aspect Keywords mapping
const ASPECT_CATEGORIES: Record<string, string[]> = {
  "Performance & Speed": ["speed", "fast", "slow", "latency", "lag", "fps", "performance", "responsive", "quick", "stalled", "freeze"],
  "Customer Support": ["support", "ticket", "service", "agent", "refund", "response", "help", "chat", "email", "rep"],
  "UI & UX Design": ["ui", "ux", "design", "interface", "layout", "aesthetic", "dark mode", "font", "clean", "cluttered"],
  "Reliability & Stability": ["crash", "bug", "error", "down", "uptime", "glitch", "broken", "stable", "reliable", "outage"],
  "Features & Updates": ["feature", "update", "release", "version", "tool", "ai", "dashboard", "integration", "patch"],
  "Pricing & Value": ["price", "cost", "pricing", "expensive", "cheap", "worth", "waste", "subscription", "value", "free"],
};

export function analyzeTweetLocally(text: string, authorHandle?: string): AnalysisResult {
  const normalized = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  let scoreSum = 0;
  let wordCount = 0;
  const keywords: { word: string; impact: "positive" | "negative" | "neutral" }[] = [];
  const emotionCounts: Record<string, number> = {};

  // Check emojis
  for (const [emoji, info] of Object.entries(EMOJI_MAP)) {
    if (text.includes(emoji)) {
      const occurrences = text.split(emoji).length - 1;
      scoreSum += info.weight * occurrences * 1.3;
      wordCount += occurrences;
      if (info.emotion) {
        emotionCounts[info.emotion] = (emotionCounts[info.emotion] || 0) + occurrences * 1.5;
      }
      keywords.push({
        word: emoji,
        impact: info.weight > 0 ? "positive" : info.weight < 0 ? "negative" : "neutral",
      });
    }
  }

  // Tokenize words
  for (let i = 0; i < words.length; i++) {
    const rawWord = words[i].replace(/[^a-zA-Z0-9'#@]/g, "").toLowerCase();
    if (!rawWord) continue;

    // Check slang phrases like "not bad"
    if (rawWord === "bad" && i > 0 && NEGATIONS.has(words[i - 1].toLowerCase())) {
      scoreSum += 1.4; // "not bad" is positive
      keywords.push({ word: "not bad", impact: "positive" });
      emotionCounts["Satisfaction"] = (emotionCounts["Satisfaction"] || 0) + 1;
      continue;
    }

    let multiplier = 1.0;

    // Check booster before word
    if (i > 0) {
      const prevWord = words[i - 1].toLowerCase().replace(/[^a-zA-Z]/g, "");
      if (BOOSTERS[prevWord]) {
        multiplier *= BOOSTERS[prevWord];
      }
      if (NEGATIONS.has(prevWord)) {
        multiplier *= -1.0;
      }
    }
    // Check two words back for negation e.g. "not very good"
    if (i > 1) {
      const prevPrevWord = words[i - 2].toLowerCase().replace(/[^a-zA-Z]/g, "");
      if (NEGATIONS.has(prevPrevWord)) {
        multiplier *= -0.8;
      }
    }

    // Check ALL CAPS boost e.g. "AMAZING"
    if (words[i].length > 2 && words[i] === words[i].toUpperCase() && /[A-Z]/.test(words[i])) {
      multiplier *= 1.3;
    }

    if (LEXICON[rawWord] !== undefined) {
      const val = LEXICON[rawWord] * multiplier;
      scoreSum += val;
      wordCount++;

      if (val > 0.5) {
        keywords.push({ word: words[i], impact: "positive" });
        emotionCounts["Joy / Excitement"] = (emotionCounts["Joy / Excitement"] || 0) + 0.8;
      } else if (val < -0.5) {
        keywords.push({ word: words[i], impact: "negative" });
        emotionCounts["Frustration / Anger"] = (emotionCounts["Frustration / Anger"] || 0) + 0.8;
      }
    }
  }

  // Punctuation emphasis
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount >= 2) {
    if (scoreSum > 0) scoreSum *= 1.25;
    if (scoreSum < 0) scoreSum *= 1.25;
  }
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount >= 2) {
    emotionCounts["Curiosity / Doubt"] = (emotionCounts["Curiosity / Doubt"] || 0) + 1.2;
  }

  // Calculate normalized polarity (-1.0 to 1.0)
  const normFactor = Math.max(1, Math.sqrt(wordCount || 1));
  let polarity = scoreSum / (normFactor * 2.5);
  polarity = Math.max(-1.0, Math.min(1.0, polarity));

  // Determine sentiment label & score distributions
  let sentiment: SentimentLabel = "NEUTRAL";
  let scores: SentimentScores;

  if (polarity > 0.15) {
    sentiment = "POSITIVE";
    const pos = Math.min(0.98, 0.45 + polarity * 0.53);
    const neg = Math.max(0.01, (1 - pos) * 0.2);
    const neu = Math.max(0.01, 1 - pos - neg);
    scores = { positive: Number(pos.toFixed(3)), neutral: Number(neu.toFixed(3)), negative: Number(neg.toFixed(3)) };
  } else if (polarity < -0.15) {
    sentiment = "NEGATIVE";
    const neg = Math.min(0.98, 0.45 + Math.abs(polarity) * 0.53);
    const pos = Math.max(0.01, (1 - neg) * 0.2);
    const neu = Math.max(0.01, 1 - pos - neg);
    scores = { positive: Number(pos.toFixed(3)), neutral: Number(neu.toFixed(3)), negative: Number(neg.toFixed(3)) };
  } else {
    sentiment = "NEUTRAL";
    const neu = 0.65 + (0.15 - Math.abs(polarity)) * 1.5;
    const remainder = (1 - neu) / 2;
    scores = {
      positive: Number((remainder + polarity * 0.1).toFixed(3)),
      neutral: Number(neu.toFixed(3)),
      negative: Number((remainder - polarity * 0.1).toFixed(3)),
    };
  }

  const confidence = Math.round(
    Math.max(scores.positive, scores.neutral, scores.negative) * 100
  );

  // Subjectivity estimation (based on sentiment word density and pronouns)
  const subjectiveWords = text.match(/\b(i|me|my|we|our|feel|think|believe|love|hate|best|worst|impressive|annoying)\b/gi) || [];
  const subjectivity = Math.min(
    1.0,
    Number(((subjectiveWords.length * 0.15) + (Math.abs(polarity) * 0.6)).toFixed(2))
  );

  // Emotions formatting
  const emotionList: EmotionScore[] = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, score]) => ({
      name,
      score: Math.min(0.99, Number((score / (wordCount + 1)).toFixed(2))),
    }));

  if (emotionList.length === 0) {
    if (sentiment === "POSITIVE") {
      emotionList.push({ name: "Optimism / Satisfaction", score: 0.85 });
    } else if (sentiment === "NEGATIVE") {
      emotionList.push({ name: "Disappointment", score: 0.82 });
    } else {
      emotionList.push({ name: "Objective / Informative", score: 0.90 });
    }
  }

  // Aspect detection
  const detectedAspects: AspectSentiment[] = [];
  for (const [category, triggerWords] of Object.entries(ASPECT_CATEGORIES)) {
    const matched = triggerWords.some((w) => normalized.includes(w));
    if (matched) {
      detectedAspects.push({
        aspect: category,
        sentiment: sentiment,
        score: Math.round(confidence * 0.95) / 100,
      });
    }
  }

  return {
    id: `anlz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tweetText: text.trim(),
    authorHandle: authorHandle?.trim() || "@user",
    sentiment,
    confidence,
    scores,
    polarity: Number(polarity.toFixed(2)),
    subjectivity,
    emotions: emotionList,
    aspects: detectedAspects,
    keywords: keywords.slice(0, 8),
    provider: "native",
    createdAt: new Date().toISOString(),
  };
}
