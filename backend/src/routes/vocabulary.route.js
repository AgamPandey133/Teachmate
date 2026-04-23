import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addWord, getWords, deleteWord } from "../controllers/vocabulary.controller.js";

const router = express.Router();

router.post("/", protectRoute, addWord);
router.get("/", protectRoute, getWords);
router.delete("/:id", protectRoute, deleteWord);

export default router;
