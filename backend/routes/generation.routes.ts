import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { generateCV } from "../controller/generation.controller";

const router = express.Router();

const rateLimitHandler = (req: Request, res: Response) => {
  const rateLimitInfo = (req as any).rateLimit;

  if (!rateLimitInfo) return;

  const resetTime =
    rateLimitInfo.resetTime instanceof Date
      ? Math.ceil(rateLimitInfo.resetTime.getTime() / 1000)
      : Math.ceil((Date.now() + (rateLimitInfo.resetTime || 900000)) / 1000);

  res.status(429).json({
    error: "Too many requests from this IP, please try again later",
    retryAfter: resetTime,
    limit: rateLimitInfo.limit,
    current: rateLimitInfo.current,
  });
};

const cvGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/generate-cv",
  cvGenerationLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || !jobDescription) {
        res
          .status(400)
          .json({ error: "No resume or job description provided" });
        return;
      }

      const cv = await generateCV(resumeText, jobDescription);

      if (!cv) {
        throw new Error("Failed to generate CV");
      }

      res.json({ cv });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
