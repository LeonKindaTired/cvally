import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import generationRoutes from "./routes/generation.routes";
import paddleRoutes from "./routes/paddle.routes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Log environment status on startup
console.log("🟢 Starting server...");
console.log(`🔧 Environment: ${process.env.NODE_ENV || "sandbox"}`);
console.log(`🚀 Mode: ${process.env.MODE || "sandbox"}`);

// Configure CORS
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

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(
    `📥 [${new Date().toISOString()}] ${req.method} ${req.path} ${
      req.body ? "with body" : ""
    }`
  );
  next();
});

app.use("/api", paddleRoutes);

app.use(express.json());

// Existing routes
app.use("/api/generate", generationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log("🩺 Health check passed");
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mode: MODE,
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.use((req, res) => {
  console.error(`🚫 Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔑 Environment variables status:");
  console.log(`   MODE: ${MODE}`);
  console.log(
    `   SUPABASE_URL: ${process.env.SUPABASE_URL ? "✅" : "❌ Missing"}`
  );
  console.log(
    `   SUPABASE_SERVICE_ROLE_KEY: ${
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌ Missing"
    }`
  );
  console.log(
    `   PADDLE_SECRET_KEY_SANDBOX: ${
      process.env.PADDLE_SECRET_KEY_SANDBOX ? "✅" : "❌ Missing"
    }`
  );
  console.log(
    `   PADDLE_WEBHOOK_SECRET_SANDBOX: ${
      process.env.PADDLE_WEBHOOK_SECRET_SANDBOX ? "✅" : "❌ Missing"
    }`
  );
  console.log(
    `   FRONTEND_URL_SANDBOX: ${
      process.env.FRONTEND_URL_SANDBOX || "❌ Not set"
    }`
  );
  console.log(
    `   FRONTEND_URL_PRODUCTION: ${
      process.env.FRONTEND_URL_PRODUCTION || "❌ Not set"
    }`
  );
});
