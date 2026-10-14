import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, AnalysisResult, DatabaseSchema } from "./types";

const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");
const VERCEL_TMP_PATH = path.join("/tmp", "db.json");

declare global {
  // eslint-disable-next-line no-var
  var __IN_MEMORY_DB__: DatabaseSchema | undefined;
}

// Initial seed data
const initialSeedData = (): DatabaseSchema => {
  const demoSalt = bcrypt.genSaltSync(10);
  const demoHash = bcrypt.hashSync("demo123", demoSalt);

  return {
    users: [
      {
        id: "usr_demo_101",
        username: "demo_trader",
        email: "demo@example.com",
        passwordHash: demoHash,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
    analyses: [
      {
        id: "anlz_seed_1",
        userId: "usr_demo_101",
        tweetText: "Just tested the new ultra-lightweight release and the latency dropped by 70%! Genuinely impressive work by the dev team 🚀",
        authorHandle: "@tech_insider",
        sentiment: "POSITIVE",
        confidence: 96,
        scores: {
          positive: 0.96,
          neutral: 0.03,
          negative: 0.01,
        },
        polarity: 0.88,
        subjectivity: 0.75,
        emotions: [
          { name: "Joy / Excitement", score: 0.92 },
          { name: "Satisfaction", score: 0.89 },
          { name: "Surprise", score: 0.65 },
        ],
        aspects: [
          { aspect: "Performance / Latency", sentiment: "POSITIVE", score: 0.95 },
          { aspect: "Dev Team", sentiment: "POSITIVE", score: 0.90 },
        ],
        keywords: [
          { word: "impressive", impact: "positive" },
          { word: "latency dropped", impact: "positive" },
          { word: "genuinely", impact: "positive" },
        ],
        provider: "native",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "anlz_seed_2",
        userId: "usr_demo_101",
        tweetText: "Support ticket has been open for 4 days without a single human response. Service is completely stalled.",
        authorHandle: "@dev_rant",
        sentiment: "NEGATIVE",
        confidence: 94,
        scores: {
          positive: 0.02,
          neutral: 0.04,
          negative: 0.94,
        },
        polarity: -0.85,
        subjectivity: 0.82,
        emotions: [
          { name: "Frustration / Anger", score: 0.95 },
          { name: "Disappointment", score: 0.88 },
        ],
        aspects: [
          { aspect: "Customer Support", sentiment: "NEGATIVE", score: 0.94 },
          { aspect: "Response Time", sentiment: "NEGATIVE", score: 0.91 },
        ],
        keywords: [
          { word: "stalled", impact: "negative" },
          { word: "without", impact: "negative" },
        ],
        provider: "native",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
  };
};

class InMemoryDatabase {
  private data: DatabaseSchema;

  constructor() {
    if (!global.__IN_MEMORY_DB__) {
      global.__IN_MEMORY_DB__ = this.loadInitial();
    }
    this.data = global.__IN_MEMORY_DB__;
  }

  private loadInitial(): DatabaseSchema {
    // 1. Check writable /tmp path (serverless/Vercel)
    try {
      if (fs.existsSync(VERCEL_TMP_PATH)) {
        const fileRaw = fs.readFileSync(VERCEL_TMP_PATH, "utf-8");
        const parsed = JSON.parse(fileRaw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.analyses)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // 2. Check local data/db.json file
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileRaw = fs.readFileSync(DB_FILE_PATH, "utf-8");
        const parsed = JSON.parse(fileRaw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.analyses)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    const seed = initialSeedData();
    this.persistToDisk(seed);
    return seed;
  }

  private persistToDisk(data: DatabaseSchema): void {
    const jsonStr = JSON.stringify(data, null, 2);

    // Try primary workspace path
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, jsonStr, "utf-8");
      return;
    } catch {
      // If filesystem is read-only (e.g. Vercel serverless /var/task), write to /tmp
      try {
        fs.writeFileSync(VERCEL_TMP_PATH, jsonStr, "utf-8");
      } catch (err) {
        // Fallback silently purely in-memory
        console.warn("Serverless environment: kept purely in-memory:", err);
      }
    }
  }

  // User operations
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByUsername(username: string): User | undefined {
    return this.data.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persistToDisk(this.data);
    return user;
  }

  // Analysis operations
  public getAnalyses(userId?: string): AnalysisResult[] {
    if (!userId) {
      return [];
    }
    return this.data.analyses
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAnalysisById(id: string): AnalysisResult | undefined {
    return this.data.analyses.find((a) => a.id === id);
  }

  public createAnalysis(analysis: AnalysisResult): AnalysisResult | null {
    if (!analysis.userId) {
      // Do not persist history for guests/unregistered users
      return null;
    }
    this.data.analyses.unshift(analysis);
    this.persistToDisk(this.data);
    return analysis;
  }

  public deleteAnalysis(id: string, userId?: string): boolean {
    const index = this.data.analyses.findIndex(
      (a) => a.id === id && (!userId || a.userId === userId)
    );
    if (index !== -1) {
      this.data.analyses.splice(index, 1);
      this.persistToDisk(this.data);
      return true;
    }
    return false;
  }

  public clearAnalyses(userId: string): number {
    const countBefore = this.data.analyses.length;
    this.data.analyses = this.data.analyses.filter((a) => a.userId !== userId);
    this.persistToDisk(this.data);
    return countBefore - this.data.analyses.length;
  }

  public getStats() {
    return {
      totalUsers: this.data.users.length,
      totalAnalyses: this.data.analyses.length,
    };
  }
}

export const db = new InMemoryDatabase();
