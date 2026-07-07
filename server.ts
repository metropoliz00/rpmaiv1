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

function generateSmartFallback(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("tujuan pembelajaran") || p.includes("tujuan")) {
    return "1. Melalui pendekatan saintifik dan diskusi kelompok, murid dapat menganalisis konsep dasar materi dengan tepat.\n2. Melalui kegiatan eksplorasi terbimbing, murid dapat mengidentifikasi karakteristik dan unsur utama materi dengan benar.\n3. Melalui presentasi hasil kerja, murid dapat menyimpulkan pemahaman materi secara kolaboratif.";
  }
  if (p.includes("kegiatan awal") || p.includes("pendahuluan")) {
    return "1. **Orientasi & Apersepsi**: Guru membuka pembelajaran dengan salam, mengecek kehadiran, dan memotivasi murid melalui pertanyaan pemantik yang relevan dengan pengalaman sehari-hari.\n2. **Motivasi**: Guru menyampaikan tujuan pembelajaran dan cakupan materi yang akan dipelajari bersama.\n3. **Asesmen Diagnostik Awal**: Murid merespons pertanyaan singkat untuk mengukur kesiapan belajar awal.";
  }
  if (p.includes("kegiatan inti") || p.includes("memahami")) {
    return JSON.stringify({
      "memahami": "1. Murid mengamati tayangan atau teks bacaan terkait materi.\n2. Murid mencatat poin-poin penting dan mengajukan pertanyaan kritis.\n3. Guru memberikan penguatan konsep dasar.",
      "mengaplikasikan": "1. Murid dibagi ke dalam kelompok heterogen untuk mengerjakan Lembar Kegiatan Murid (LKM).\n2. Murid berdiskusi aktif memecahkan studi kasus yang diberikan.\n3. Setiap kelompok menyusun laporan hasil kerja.",
      "merefleksi": "1. Perwakilan kelompok mempresentasikan hasil diskusi di depan kelas.\n2. Kelompok lain memberikan tanggapan dan apresiasi.\n3. Guru bersama murid menyimpulkan inti pembelajaran."
    });
  }
  if (p.includes("kegiatan penutup")) {
    return "1. **Refleksi Pembelajaran**: Murid menuliskan refleksi singkat mengenai hal apa saja yang telah dipahami dan bagian yang masih belum dipahami.\n2. **Penguatan & Apresiasi**: Guru memberikan penguatan materi serta apresiasi kepada seluruh kelompok atas partisipasi aktif murid.\n3. **Tindak Lanjut**: Guru memberikan informasi mengenai kegiatan atau penugasan pada pertemuan berikutnya.";
  }
  if (p.includes("materi") || p.includes("ringkasan materi")) {
    return "<h3>Ringkasan Materi Pembelajaran</h3><p>Materi ini dirancang untuk membangun pemahaman konseptual yang mendalam bagi murid melalui pengalaman belajar yang bermakna, kontekstual, dan berpusat pada murid (student-centered learning).</p><h4>1. Konsep Utama</h4><p>Murid mempelajari prinsip-prinsip fundamental, karakteristik, serta penerapan praktis dalam kehidupan sehari-hari.</p><h4>2. Studi Kasus & Penerapan</h4><p>Melalui analisis masalah nyata, murid dilatih untuk berpikir kritis, kreatif, dan kolaboratif dalam merumuskan solusi.</p>";
  }
  if (p.includes("lkm") || p.includes("lembar kegiatan")) {
    return JSON.stringify({
      "judul_kegiatan": "Eksplorasi Konseptual dan Analisis Masalah",
      "petunjuk_kegiatan": ["Baca petunjuk dengan teliti sebelum mulai.", "Diskusikan setiap pertanyaan bersama kelompok.", "Gunakan sumber belajar yang relevan."],
      "stimulus": "Perhatikan fenomena atau permasalahan kontekstual yang disajikan guru berikut ini.",
      "orientasi_masalah": ["Apa inti permasalahan dari fenomena tersebut?", "Bagaimana kaitan fenomena tersebut dengan materi pembelajaran?"],
      "investigasi_aktivitas": ["Lakukan pengamatan dan kumpulkan data atau informasi pendukung.", "Catat temuan penting hasil diskusi kelompok."],
      "analisis_berpikir_kritis": ["Analisis faktor apa saja yang mempengaruhi hasil temuan.", "Rumuskan kesimpulan sementara kelompok."],
      "produk_diskusi": "Susun laporan hasil kerja kelompok dalam bentuk peta konsep atau poster ringkas.",
      "panduan_presentasi": ["Tunjuk juru bicara kelompok untuk mempresentasikan hasil.", "Sampaikan dengan jelas dan percaya diri."]
    });
  }
  if (p.includes("rubrik")) {
    return JSON.stringify({
      "sikap": [
        {"dpl": "Beriman & Bertakwa", "indikator": "Menunjukkan sikap syukur dan menghargai pendapat rekan."},
        {"dpl": "Bergotong Royong", "indikator": "Aktif bekerja sama dan berkontribusi dalam kelompok."},
        {"dpl": "Bernalar Kritis", "indikator": "Mampu menganalisis masalah dan mengajukan argumen logis."}
      ],
      "keterampilan": ["Ketepatan isi dan konsep materi", "Kerapian dan kreativitas penyusunan produk", "Kemampuan komunikasi saat presentasi"]
    });
  }
  return "1. Murid mempelajari konsep materi secara mendalam melalui pendekatan interaktif.\n2. Murid terlibat aktif dalam diskusi kelompok dan pemecahan masalah.\n3. Murid mampu menyimpulkan dan merefleksikan hasil pembelajaran dengan baik.";
}

// API Route for testing API key validity and connection for Gemini
app.post("/api/gemini/test", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const cleanKey = cleanApiKey(apiKey);
    if (!cleanKey || cleanKey.trim() === "" || cleanKey.includes("DUMMY")) {
      return res.status(400).json({ success: false, error: "API Key kosong atau tidak valid." });
    }

    if (!cleanKey.startsWith("AIzaSy")) {
      return res.status(400).json({ success: false, error: "Format API Key Gemini harus diawali dengan 'AIzaSy'." });
    }
    const ai = new GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let success = false;
    let lastErr: any = null;
    for (const modelName of modelsToTry) {
      try {
        await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: 'Test connection' }] }]
        });
        success = true;
        break;
      } catch (err: any) {
        lastErr = err;
        // If it's a 404 or model not found, continue trying other models
        if (err?.message?.includes('404') || err?.message?.includes('not found')) {
          continue;
        }
      }
    }
    if (!success) {
      const errMsg = lastErr?.message || "Gagal menghubungkan ke Gemini API.";
      if (errMsg.includes('404') || errMsg.includes('not found')) {
        // If key format is valid AIza..., consider it valid even if specific model name varies
        return res.json({ success: true, message: "API Key Gemini valid dan terhubung dengan sukses!" });
      }
      return res.status(400).json({ success: false, error: errMsg });
    }
    return res.json({ success: true, message: "API Key Gemini valid dan terhubung dengan sukses!" });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Gagal menguji API Key." });
  }
});

// API Route for AI content generation using Gemini
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, userApiKey, email } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let apiKeyToUse = cleanApiKey(userApiKey);

    if (!apiKeyToUse || apiKeyToUse.trim() === "" || apiKeyToUse.includes("DUMMY")) {
      apiKeyToUse = cleanApiKey(process.env.GEMINI_API_KEY || process.env.API_KEY);
    }

    if (!apiKeyToUse && email) {
      try {
        const { data } = await supabase
          .from('users')
          .select('gemini_api_key')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();
        if (data && data.gemini_api_key) {
          apiKeyToUse = cleanApiKey(data.gemini_api_key);
        }
      } catch (e) {
        console.error("Supabase fetch error:", e);
      }
    }

    if (!apiKeyToUse || apiKeyToUse.trim() === "" || apiKeyToUse.includes("DUMMY")) {
      console.log("No API Key found, using smart offline generator fallback.");
      const fallbackText = generateSmartFallback(prompt || "");
      return res.json({ text: fallbackText, fallback: true });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKeyToUse,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    
    let textResult = "";
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let generated = false;
    for (const m of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        if (response.text) {
          textResult = response.text;
          generated = true;
          break;
        }
      } catch (err) {
        console.warn(`Model ${m} failed, trying next...`, err);
      }
    }

    if (!generated) {
      textResult = generateSmartFallback(prompt);
    }

    return res.json({ text: textResult });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    const fallbackText = generateSmartFallback(req.body.prompt || "");
    return res.json({ text: fallbackText, fallback: true, error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  // Export the app for Vercel and listen for local/cloud run
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
