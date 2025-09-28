import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import generationRoutes from "./routes/generation.routes";
import lemonRoutes from "./routes/lemonsqueezy.routes";

dotenv.config();

const app = express();

console.log("🟢 Starting server...");

const MODE = process.env.MODE === "production";
const allowedOrigin = MODE
  ? process.env.FRONTEND_URL_PRODUCTION
  : process.env.FRONTEND_URL_SANDBOX;

console.log(`🌐 Allowing CORS for origin: ${allowedOrigin}`);

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(
    `📥 [${new Date().toISOString()}] ${req.method} ${req.path} ${
      req.body ? "with body" : ""
    }`
  );
  next();
});

app.post(
  "/api/lemon/lemon-webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    console.log("📥 Raw body received, length:", req.body.length);

    lemonRoutes(req, res, next);
  }
);

app.use("/api/lemon", lemonRoutes);

app.use(express.json());

app.use("/api/generate", generationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
