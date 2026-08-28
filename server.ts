import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/grade", async (req, res) => {
    try {
      const { prompt, essay } = req.body;

      if (!prompt || !essay) {
        return res.status(400).json({ error: "Missing prompt or essay" });
      }

      const systemInstruction = `You are an expert, strict, and fair teacher grading an essay (tự luận).
You will be given the assignment prompt/question and the student's essay.
Please provide your evaluation in Vietnamese.
Your evaluation must include:
1.  **Điểm số (Score):** A score out of 10.
2.  **Nhận xét chung (General feedback):** Overall impression.
3.  **Ưu điểm (Strengths):** What the student did well.
4.  **Nhược điểm (Weaknesses):** Areas for improvement.
5.  **Góp ý sửa chữa (Suggestions for revision):** Specific actionable advice.

Use markdown for formatting. Be objective and constructive.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `**Đề bài / Yêu cầu (Prompt):**\n${prompt}\n\n**Bài làm của học sinh (Student's essay):**\n${essay}`,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for more consistent grading
        },
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error grading essay:", error);
      res.status(500).json({ error: error.message || "An error occurred while grading." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
