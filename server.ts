import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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

    // Robust fallback and retry mechanism to handle temporary 503 / 429 / high-demand errors
    let lastError: any = null;
    let text = "";
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.5-flash'];

    for (const modelName of modelsToTry) {
      let attempts = 3;
      let delay = 1000;
      while (attempts > 0) {
        try {
          console.log(`Trying model: ${modelName}, attempts left: ${attempts}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          if (response && response.text) {
            text = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || "";
          const isRateLimitOrUnavailable = 
            errMsg.includes("503") || 
            errMsg.includes("429") || 
            errMsg.includes("UNAVAILABLE") || 
            errMsg.includes("RESOURCE_EXHAUSTED");
          
          if (isRateLimitOrUnavailable) {
            console.warn(`Temporary Gemini error on model ${modelName}. Retrying in ${delay}ms...`, err);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            attempts--;
          } else {
            console.error(`Non-retriable error on model ${modelName}:`, err);
            break; // Try next model in the outer list
          }
        }
      }
      if (text) break;
    }

    if (!text) {
      throw lastError || new Error("Gagal mendapatkan respons dari semua model AI.");
    }
    return res.json({ text });
  } catch (error: any) {
    console.error("Server Gemini API Error:", error);
    let errMsg = error.message || "Gagal menghubungkan ke layanan AI.";
    
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
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  startVite();
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the app for Vercel and listen for local/cloud run
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
