import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/audio', protectRoute, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    // Convert buffer to base64 for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: "video", // Cloudinary treats audio as video
      folder: "voice_messages",
    });

    res.status(200).json({ audioUrl: uploadResponse.secure_url });
  } catch (error) {
    console.error("Error in audio upload:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
