import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini content generation
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, userApiKey } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Determine the API Key to use
      let apiKeyToUse = process.env.GEMINI_API_KEY;
      if (userApiKey && userApiKey.trim() !== "" && !userApiKey.includes("DUMMY")) {
        apiKeyToUse = userApiKey;
      }

      if (!apiKeyToUse) {
        return res.status(500).json({
          error: "API Key Gemini tidak ditemukan. Silakan masukkan API Key Anda di menu Pengaturan."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Call the model
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || "Maaf, AI tidak dapat memberikan respons saat ini.";
      return res.json({ text });
    } catch (error: any) {
      console.error("Server Gemini API Error:", error);
      let errMsg = error.message || "Gagal menghubungkan ke layanan AI.";
      
      // Handle quota and invalid key errors
      if (errMsg.includes("429")) {
        errMsg = "Kuota penggunaan AI penuh (429). Gunakan API Key pribadi untuk batas yang lebih tinggi.";
      } else if (errMsg.includes("403") || errMsg.includes("401") || errMsg.includes("API key")) {
        errMsg = "API Key Gemini tidak valid atau tidak memiliki akses.";
      }

      return res.status(500).json({ error: errMsg });
    }
  });

  // Vite middleware for development
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
