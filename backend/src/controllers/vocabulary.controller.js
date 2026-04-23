import Vocabulary from "../models/Vocabulary.js";
import { generateEmbedding } from "../lib/rag.js";

export const addWord = async (req, res) => {
  try {
    const { word, translation, originalContext } = req.body;
    const userId = req.user._id;

    // Create the vocabulary entry first
    const newWord = new Vocabulary({
      userId,
      word,
      translation,
      originalContext,
    });

    await newWord.save();

    // Generate embedding asynchronously (non-blocking for the user)
    // We combine word + translation for richer semantic meaning
    const textToEmbed = `${word}${translation ? " - " + translation : ""}${originalContext ? " (context: " + originalContext + ")" : ""}`;

    generateEmbedding(textToEmbed)
      .then(async (embedding) => {
        if (embedding) {
          newWord.embedding = embedding;
          await newWord.save();
          console.log(`[RAG] Embedding generated for word: "${word}"`);
        }
      })
      .catch((err) => {
        // Log the error but don't fail the request — the word is already saved
        console.error(`[RAG] Failed to generate embedding for "${word}":`, err.message);
      });

    res.status(201).json(newWord);
  } catch (error) {
    console.error("Error in addWord:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getWords = async (req, res) => {
  try {
    const userId = req.user._id;
    const words = await Vocabulary.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(words);
  } catch (error) {
    console.error("Error in getWords:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteWord = async (req, res) => {
    try {
        const { id } = req.params;
        await Vocabulary.findByIdAndDelete(id);
        res.status(200).json({ message: "Word deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}
