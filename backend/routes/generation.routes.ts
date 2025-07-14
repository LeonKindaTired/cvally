import express, { Request, Response, NextFunction } from "express";
import {
  generateCV,
  generateIntro,
  generateSummary,
} from "../controller/generation.controller";

const router = express.Router();

router.post(
  "/generate-intro",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({ error: "No content Provided" });
        return;
      }

      const intro = await generateIntro(content);

      if (!intro) {
        throw new Error("Failed to generate intro");
      }

      res.json({ intro });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/generate-summary",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { content } = req.body;

      if (!content) {
        res.status(400).json({ error: "No content Provided" });
        return;
      }

      const summary = await generateSummary(content);

      if (!summary) {
        throw new Error("Failed to generate summary");
      }

      res.json({ summary });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/generate-cv",
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
