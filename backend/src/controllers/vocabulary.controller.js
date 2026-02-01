import Vocabulary from "../models/Vocabulary.js";

export const addWord = async (req, res) => {
  try {
    const { word, translation, originalContext } = req.body;
    const userId = req.user._id;

    const newWord = new Vocabulary({
      userId,
      word,
      translation,
      originalContext
    });

    await newWord.save();
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
