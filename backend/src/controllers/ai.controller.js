import Vocabulary from "../models/Vocabulary.js";
import {
  generateEmbedding,
  retrieveRelevantVocabulary,
} from "../lib/rag.js";

export const chatWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user._id;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // ──────────────────────────────────────────────
    // STEP 1: RAG — Retrieve relevant vocabulary
    // ──────────────────────────────────────────────
    let ragContext = "";

    try {
      // 1a. Generate an embedding for the user's prompt
      const promptEmbedding = await generateEmbedding(prompt);

      // 1b. Fetch all vocabulary docs that have embeddings for this user
      const userVocabulary = await Vocabulary.find({
        userId,
        embedding: { $exists: true, $not: { $size: 0 } },
      });

      if (userVocabulary.length > 0 && promptEmbedding) {
        // 1c. Retrieve the top 5 most semantically relevant words
        const relevantWords = retrieveRelevantVocabulary(
          promptEmbedding,
          userVocabulary,
          5
        );

        if (relevantWords.length > 0) {
          const wordList = relevantWords
            .map(
              (w) =>
                `- "${w.word}"${w.translation ? ` (translation: ${w.translation})` : ""}${w.originalContext ? ` [context: ${w.originalContext}]` : ""}`
            )
            .join("\n");

          ragContext = `\n\nIMPORTANT CONTEXT: The student is currently learning these vocabulary words. Naturally incorporate and reinforce these words in your response where relevant. If the student uses any of them incorrectly, gently correct them with examples:\n${wordList}\n`;

          console.log(
            `[RAG] Retrieved ${relevantWords.length} relevant words for prompt: "${prompt.substring(0, 50)}..."`
          );
        }
      }
    } catch (ragError) {
      // If RAG fails, we still want the AI to respond — just without context
      console.error("[RAG] Retrieval failed, falling back to zero-shot:", ragError.message);
    }

    // ──────────────────────────────────────────────
    // STEP 2: Dynamic Model Resolution
    // ──────────────────────────────────────────────
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const modelsData = await modelsResponse.json();

    if (!modelsResponse.ok) {
      throw new Error(modelsData.error?.message || "Failed to list models");
    }

    const availableModel = modelsData.models?.find(
      (m) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        (m.name.includes("gemini") || m.name.includes("chat"))
    );

    if (!availableModel) {
      throw new Error("No suitable model found for this API Key");
    }

    console.log("Using Model:", availableModel.name);

    // ──────────────────────────────────────────────
    // STEP 3: Augmented Generation — Build the prompt with RAG context
    // ──────────────────────────────────────────────
    const systemInstruction = `You are TeachMate AI — a friendly, expert language tutor. Your role is to help students learn and practice languages. When the student makes grammatical errors or uses a word incorrectly, correct them with a clear explanation and provide 2-3 example sentences showing the correct usage. Be encouraging but precise.${ragContext}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/${availableModel.name}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Failed to fetch from Gemini API"
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    res.status(200).json({ text });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res
      .status(500)
      .json({
        message: "AI Error: " + (error.message || "Internal Server Error"),
      });
  }
};
