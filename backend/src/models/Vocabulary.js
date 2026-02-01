import mongoose from "mongoose";

const vocabularySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    translation: {
      type: String,
    },
    originalContext: {
        type: String
    }
  },
  { timestamps: true }
);

const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);

export default Vocabulary;
