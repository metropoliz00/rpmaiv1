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

      // Determine the API Key to use:
      // 1. If user provided their own key and it's not a dummy placeholder, use it
      // 2. Otherwise use the server's GEMINI_API_KEY
      let apiKeyToUse = process.env.GEMINI_API_KEY;
      if (userApiKey && userApiKey.trim() !== "" && !userApiKey.includes("DUMMY")) {
        apiKeyToUse = userApiKey;
      }

      if (!apiKeyToUse) {
        return res.status(500).json({
          error: "API Key Gemini tidak ditemukan di server. Silakan masukkan API Key Gemini Anda di panel admin atau pastikan server terkonfigurasi dengan benar."
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
      // Use 'gemini-3.5-flash' for general text tasks as per model guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const text = response.text || "Maaf, AI tidak dapat memberikan respons saat ini.";
      return res.json({ text });
    } catch (error: any) {
      console.error("Server Gemini API Error:", error);
      let errMsg = error.message || "Gagal menghubungkan ke layanan AI.";
      if (error.status === 403 || error.status === 401 || (error.message && (error.message.includes("API_KEY_INVALID") || error.message.includes("API key")))) {
        errMsg = "API Key Gemini tidak valid atau tidak memiliki akses. Silakan periksa kembali API Key Anda.";
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
