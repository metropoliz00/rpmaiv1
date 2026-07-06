import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./services/supabase";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to clean API Key of any whitespace, wrapping single/double quotes, etc.
function cleanApiKey(key: string | null | undefined): string {
  if (!key) return "";
  let cleaned = key.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// API Route for Gemini content generation
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, userApiKey, email } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Determine the API Key to use
    let apiKeyToUse = cleanApiKey(process.env.GEMINI_API_KEY);
    const cleanedUserKey = cleanApiKey(userApiKey);
    if (cleanedUserKey !== "" && !cleanedUserKey.includes("DUMMY")) {
      apiKeyToUse = cleanedUserKey;
    }

    // Fallback: If no API key is passed but email is provided, retrieve key from Supabase
    if ((!apiKeyToUse || apiKeyToUse.trim() === "") && email) {
      try {
        const fetchPromise = (async () => {
          const { data, error } = await supabase
            .from('users')
            .select('gemini_api_key')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();

          if (error) {
            console.error("Supabase query error:", error);
            return null;
          }

          if (data && data.gemini_api_key) {
            const cloudKey = cleanApiKey(data.gemini_api_key);
            if (cloudKey !== "" && !cloudKey.includes("DUMMY")) {
              return cloudKey;
            }
          }
          return null;
        })();

        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout fetching API Key")), 3000)
        );

        const cloudKey = await Promise.race([fetchPromise, timeoutPromise]);
        if (cloudKey) {
          apiKeyToUse = cloudKey;
        }
      } catch (dbErr) {
        console.error("Failed to fetch API key from Supabase in backend:", dbErr);
      }
    }

    if (!apiKeyToUse) {
      return res.status(500).json({
        error: "API Key Gemini tidak ditemukan. Silakan masukkan API Key Anda di menu Pengaturan atau hubungi Admin."
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
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ];

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
          try {
            fs.appendFileSync("error_log.txt", `[${new Date().toISOString()}] Model ${modelName} error: ${errMsg}\nStack: ${err.stack || ""}\n\n`);
          } catch (fileErr) {}
          
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
    try {
      fs.appendFileSync("error_log.txt", `[${new Date().toISOString()}] Final Route Error: ${error.message || error}\nStack: ${error.stack || ""}\n\n`);
    } catch (fileErr) {}
    
    let errMsg = error.message || "Gagal menghubungkan ke layanan AI.";
    
    // Parse giant JSON-stringified error from @google/genai SDK if applicable
    if (typeof errMsg === "string" && errMsg.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        }
      } catch (jsonErr) {}
    }
    
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
      errMsg = "Kuota penggunaan AI penuh (429). Gunakan API Key pribadi untuk batas yang lebih tinggi.";
    } else if (errMsg.includes("403") || errMsg.includes("401") || errMsg.includes("API key not valid") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("invalid key")) {
      errMsg = "API Key Gemini tidak valid atau tidak memiliki akses.";
    }
    return res.status(500).json({ error: errMsg });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const startVite = async () => {
    const { createServer: createViteServer } = await import("vite");
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
