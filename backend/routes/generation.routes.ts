import express, { Request, Response, NextFunction } from "express";
import { generateCV } from "../controller/generation.controller";

const router = express.Router();

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
