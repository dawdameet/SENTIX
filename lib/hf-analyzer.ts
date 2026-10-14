import { AnalysisResult, SentimentLabel, SentimentScores } from "./types";
import { analyzeTweetLocally } from "./sentiment-engine";

interface HFLabelScore {
  label: string;
  score: number;
}

export async function analyzeWithHuggingFace(
  text: string,
  apiKey?: string,
  authorHandle?: string
): Promise<{ success: boolean; result?: AnalysisResult; error?: string }> {
  const token = apiKey || process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    return {
      success: false,
      error: "Hugging Face API token is required for external API analysis. Please provide an API key in settings or use the Native NLP engine.",
    };
  }

  // Cardiff NLP twitter-roberta-base-sentiment-latest model
  const MODEL_URL = "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest";

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.trim() }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `Hugging Face API error (${response.status})`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        // fallback
      }
      return { success: false, error: errorMsg };
    }

    const data = await response.json();

    // HF Twitter-RoBERTa returns an array of arrays: [[{ label: "positive", score: 0.95 }, ...]]
    let labelScores: HFLabelScore[] = [];
    if (Array.isArray(data) && Array.isArray(data[0])) {
      labelScores = data[0];
    } else if (Array.isArray(data)) {
      labelScores = data;
    } else {
      return { success: false, error: "Unexpected response format from Hugging Face API." };
    }

    // Map labels: Cardiff Twitter-RoBERTa has labels: "positive", "neutral", "negative" (or "LABEL_0", "LABEL_1", "LABEL_2")
    let posScore = 0;
    let neuScore = 0;
    let negScore = 0;

    for (const item of labelScores) {
      const lbl = item.label.toLowerCase();
      if (lbl.includes("pos") || lbl === "label_2") {
        posScore = item.score;
      } else if (lbl.includes("neu") || lbl === "label_1") {
        neuScore = item.score;
      } else if (lbl.includes("neg") || lbl === "label_0") {
        negScore = item.score;
      }
    }

    // Determine primary sentiment
    let sentiment: SentimentLabel = "NEUTRAL";
    if (posScore >= neuScore && posScore >= negScore) {
      sentiment = "POSITIVE";
    } else if (negScore >= neuScore && negScore >= posScore) {
      sentiment = "NEGATIVE";
    } else {
      sentiment = "NEUTRAL";
    }

    const maxScore = Math.max(posScore, neuScore, negScore);
    const confidence = Math.round(maxScore * 100);
    const polarity = Number((posScore - negScore).toFixed(2));

    const scores: SentimentScores = {
      positive: Number(posScore.toFixed(3)),
      neutral: Number(neuScore.toFixed(3)),
      negative: Number(negScore.toFixed(3)),
    };

    // Enrich with local emotions & aspects extraction
    const localEnrichment = analyzeTweetLocally(text, authorHandle);

    const result: AnalysisResult = {
      id: `anlz_hf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tweetText: text.trim(),
      authorHandle: authorHandle?.trim() || "@user",
      sentiment,
      confidence,
      scores,
      polarity,
      subjectivity: localEnrichment.subjectivity,
      emotions: localEnrichment.emotions,
      aspects: localEnrichment.aspects,
      keywords: localEnrichment.keywords,
      provider: "huggingface",
      createdAt: new Date().toISOString(),
    };

    return { success: true, result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to Hugging Face API";
    return { success: false, error: message };
  }
}
