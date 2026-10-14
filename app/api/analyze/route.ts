import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeTweetLocally } from "@/lib/sentiment-engine";
import { analyzeWithHuggingFace } from "@/lib/hf-analyzer";

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    const body = await request.json();
    const { text, authorHandle, provider = "native", apiKey } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Tweet text is required." },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: "Tweet text exceeds maximum limit (500 characters)." },
        { status: 400 }
      );
    }

    let analysisResult;

    if (provider === "huggingface") {
      const hfResponse = await analyzeWithHuggingFace(text, apiKey, authorHandle);
      if (!hfResponse.success || !hfResponse.result) {
        return NextResponse.json(
          {
            error: hfResponse.error || "Failed to analyze tweet with Hugging Face API.",
            provider: "huggingface",
          },
          { status: 502 }
        );
      }
      analysisResult = hfResponse.result;
    } else {
      // Native high-precision NLP engine
      analysisResult = analyzeTweetLocally(text, authorHandle);
    }

    let saved = false;
    // Attach user ID and persist ONLY if user is logged in
    if (user?.userId) {
      analysisResult.userId = user.userId;
      db.createAnalysis(analysisResult);
      saved = true;
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      saved,
      stats: db.getStats(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sentiment analysis." },
      { status: 500 }
    );
  }
}
