export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface SentimentScores {
  positive: number; // 0.0 - 1.0
  neutral: number;  // 0.0 - 1.0
  negative: number; // 0.0 - 1.0
}

export interface EmotionScore {
  name: string;
  score: number;
}

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentLabel;
  score: number;
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  tweetText: string;
  authorHandle?: string;
  sentiment: SentimentLabel;
  confidence: number; // 0 - 100 percentage
  scores: SentimentScores;
  polarity: number;   // -1.0 to 1.0
  subjectivity: number; // 0.0 (objective) to 1.0 (subjective)
  emotions: EmotionScore[];
  aspects: AspectSentiment[];
  keywords: { word: string; impact: "positive" | "negative" | "neutral" }[];
  provider: "native" | "huggingface" | "custom_llm";
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface DatabaseSchema {
  users: User[];
  analyses: AnalysisResult[];
}
