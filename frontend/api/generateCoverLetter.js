export default async function handler(req, res) {
  const { resumeText, jobDescription } = req.body;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You write professional, formal cover letters. You will take in data from an already made cv and will help the user better their CV to get into their dream job and company.",
          },
          {
            role: "user",
            content: `Here's my resume:\n\n${resumeText}\n\nJob Description:\n\n${jobDescription}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
