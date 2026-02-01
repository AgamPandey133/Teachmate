import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.route.js";
import uploadRoutes from "./routes/upload.route.js";
import vocabularyRoutes from "./routes/vocabulary.route.js";
import aiRoutes from "./routes/ai.route.js";
import cors from "cors";
import path from "path";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __dirname = path.resolve();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // In development, allow ALL origins to support various local IPs
      // In production, you would restrict this to specific domains
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
const frontendPath = path.join(__dirname, "../frontend/dist");

// Fallback: Check if build exists, OR if env is production
// This makes it work even if you forget to set NODE_ENV!
import fs from "fs";
const startFrontend = () => {
  if (fs.existsSync(path.join(frontendPath, "index.html"))) {
    console.log("Serving Frontend (Build Found)");
    app.use(express.static(frontendPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    // Development or Build Missing
    console.log("Frontend build not found or dev mode.");
    app.get("/", (req, res) => {
      // Debug info for the user
      res.send(`API is running. NODE_ENV = ${process.env.NODE_ENV}. (Build path: ${frontendPath} - Found: false)`);
    });
  }
};

startFrontend();

const PORT = process.env.PORT;
server.listen(PORT, (req, res) => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});

