import dotenv from "dotenv";
import Groq from "groq-sdk";

export type JobDescriptionData = {
  jobTitle: string;
  company: string;
  jobDescription: string;
};

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateIntro(message: string) {
  try {
    return await groq.chat.completions
      .create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that write engaging blog introductions",
          },
          {
            role: "user",
            content: `Generate an intro for this post: ${message}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      })
      .then((chatCompletion) => {
        const intro = chatCompletion.choices[0]?.message?.content || null;
        return intro;
      });
  } catch (error) {
    console.error("Error generating intro: " + error);
    return null;
  }
}

export async function generateSummary(message: string) {
  try {
    return await groq.chat.completions
      .create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that writes blog summaries",
          },
          {
            role: "user",
            content: `Generate a summary for this post: ${message}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      })
      .then((chatCompletion) => {
        const summary = chatCompletion.choices[0]?.message?.content || null;
        return summary;
      });
  } catch (error) {
    console.error("Error generating intro: " + error);
    return null;
  }
}

export async function generateCV(
  resumeText: string,
  jobData: JobDescriptionData
) {
  try {
    return await groq.chat.completions
      .create({
        messages: [
          {
            role: "system",
            content: `You are an expert career coach specializing in crafting compelling cover letters for dream jobs. Strictly follow these rules:
            1. Generate a COMPLETE, ready-to-use cover letter based on:
              - User's CV (resume)
              - Job description
              - Dream position
              - Dream company
            2. Structure professionally:
              - Formal salutation (use "Hiring Team" if name unknown)
              - Opening: Enthusiastic hook mentioning role/company
              - Body: 2-3 paragraphs connecting CV achievements to job requirements
              - Closing: Call-to-action + professional sign-off
            3. Critical requirements:
              * NEVER use placeholders like [Company] - use provided details
              * Quantify achievements using CV data
              * Mirror keywords from job description
              * Keep tone human, passionate, and error-free
              * MAXIMUM 400 words
              * Omit ALL meta-commentary (no "I hope this helps")
            `,
          },
          {
            role: "user",
            content: `Create a cover letter for my application to ${jobData.company} as ${jobData.jobTitle}. 

            MY RESUME:
            ${resumeText}

            JOB DESCRIPTION:
            ${jobData.jobDescription}`,
          },
        ],
        model: "llama-3.3-70b-versatile",
      })
      .then((chatCompletion) => {
        const summary = chatCompletion.choices[0]?.message?.content || null;
        return summary;
      });
  } catch (error) {
    console.error("Error generating intro: " + error);
    return null;
  }
}
