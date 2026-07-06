import { GoogleGenAI } from "@google/genai";
import { RPMData } from "../types";

/**
 * Gets a GoogleGenAI instance with the appropriate API Key.
 * Priority:
 * 1. userApiKey parameter
 * 2. Key stored in localStorage
 * 3. Default environment API key
 */
export const getGeminiClient = (userApiKey?: string | null): GoogleGenAI => {
  const key = userApiKey || localStorage.getItem("user_gemini_api_key") || (typeof process !== "undefined" ? process.env.API_KEY : undefined);
  if (!key) {
    throw new Error("API Key Gemini tidak ditemukan. Silakan masukkan API Key Gemini Anda.");
  }
  return new GoogleGenAI({ 
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

/**
 * Cleans a string response that might contain Markdown code blocks
 * and attempts to parse it as JSON.
 */
export const cleanJSON = (text: any): any => {
  if (!text) return null;
  try {
    const textStr = typeof text === 'string' ? text : String(text);
    let str = textStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstOpen = str.indexOf('{');
    const lastClose = str.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      str = str.substring(firstOpen, lastClose + 1);
    }
    // Basic cleanup for common JSON formatting issues in LLM output
    str = str.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
    str = str.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON Parse Error", e);
    return null;
  }
};

export const generateContent = async (prompt: string, userApiKey?: string | null): Promise<string> => {
  try {
    const key = userApiKey || localStorage.getItem("user_gemini_api_key") || null;
    const email = localStorage.getItem("rpm_user_email") || null;
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        userApiKey: key,
        email
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "Maaf, AI tidak dapat memberikan respons saat ini.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && (error.message.includes("403") || error.message.includes("401") || error.message.includes("tidak valid") || error.message.includes("tidak memiliki akses"))) {
      throw new Error("API Key Gemini tidak valid atau tidak memiliki akses. Silakan periksa kembali API Key Anda.");
    }
    if (error.message && error.message.includes("429")) {
      throw new Error("Kuota penggunaan AI sedang penuh (429). Silakan coba lagi beberapa saat lagi.");
    }
    throw new Error(error.message || "Gagal menghubungkan ke layanan AI. Pastikan API Key Anda aktif.");
  }
};

export const buildBulkPrompts = (type: 'rpm' | 'lampiran', formData: RPMData): string => {
  const baseContext = `
    Konteks Pembelajaran:
    - Mapel: ${formData.mataPelajaran}
    - Materi: ${formData.materiPokok}
    - Kelas: ${formData.kelas}
    - CP: ${formData.capaianPembelajaran}
    - Model: ${formData.modelPembelajaran}
    - Pendekatan: ${formData.pendekatanPembelajaran}
    - Metode: ${formData.metode}
    - Pemanfaatan Digital (Alat Digital): ${formData.alatDigital || "-"}
    - Lingkungan Belajar: ${formData.lingkunganBelajar || "-"}
    - Lintas Disiplin Ilmu: ${formData.lintasDisiplin || "-"}
    - Kemitraan: ${formData.kemitraan || "-"}
    
    Istilah wajib: Gunakan kata "Murid" (bukan siswa/peserta didik).
  `;

  if (type === 'rpm') {
      return `${baseContext}
      Buat Rencana Pelaksanaan Pembelajaran (RPM) yang komprehensif dalam format JSON:
      {
        "tujuanPembelajaran": "Buat 3 Tujuan Pembelajaran spesifik mengikuti rumus 'Melalui [pendekatan/metode], murid dapat [KKO] [materi] dengan [tepat]'. Gunakan daftar penomoran.",
        "kegiatanAwal": "Buat Kegiatan Awal dengan minimal 3 poin (Apersepsi/Motivasi, dll) menggunakan **BOLD** pada kata kunci.",
        "kegiatanInti": {
          "memahami": "3-5 poin aktivitas murid aktif",
          "mengaplikasikan": "3-5 poin aktivitas murid diskusi/eksperimen",
          "merefleksi": "3-5 poin aktivitas murid menyimpulkan/refleksi"
        },
        "kegiatanPenutup": "Buat Kegiatan Penutup dengan minimal 3 poin menggunakan **BOLD** pada kata kunci."
      }
      `;
  } else {
      return `${baseContext}
      Buat lampiran data pelengkap untuk RPM dalam format JSON:
      {
        "metode": "3 metode pembelajaran, pisahkan koma.",
        "materi": "Ringkasan materi pembelajaran yang esensial, padat, and jelas untuk murid dalam format HTML.",
        "lkm": {
          "judul_kegiatan": "Judul LKM",
          "petunjuk_kegiatan": ["Poin 1", "Poin 2"],
          "stimulus": "Teks stimulus masalah",
          "orientasi_masalah": ["Tanya 1", "Tanya 2"],
          "investigasi_aktivitas": ["Aksi 1", "Aksi 2"],
          "analisis_berpikir_kritis": ["Tanya 1", "Tanya 2"],
          "produk_diskusi": "Instruksi produk",
          "panduan_presentasi": ["Poin 1", "Poin 2"]
        },
        "rubrik": {
          "sikap": [{"dpl": "Sesuai Dimensi", "indikator": "Indikator sikap"}],
          "keterampilan": ["Aspek 1", "Aspek 2"]
        }
      }
      `;
  }
};

export const buildPrompt = (fieldName: string, formData: RPMData, additionalContext: string, fileName?: string): string => {
    let context = `Mata Pelajaran: ${formData.mataPelajaran}, Materi: ${formData.materiPokok}, CP: ${formData.capaianPembelajaran}, Kelas: ${formData.kelas}, Model: ${formData.modelPembelajaran}, Pendekatan: ${formData.pendekatanPembelajaran}, Metode: ${formData.metode}, Pemanfaatan Digital: ${formData.alatDigital || "-"}, Lingkungan Belajar: ${formData.lingkunganBelajar || "-"}, Lintas Disiplin Ilmu: ${formData.lintasDisiplin || "-"}, Kemitraan: ${formData.kemitraan || "-"}.`;
    if (additionalContext) context += `\nKonteks tambahan: ${additionalContext}`;
    if (fileName) context += `\nReferensikan data dari file: ${fileName}`;

    const prompts: Record<string, string> = {
        tujuanPembelajaran: `Buat 3 Tujuan Pembelajaran spesifik mengikuti rumus 'Melalui [pendekatan/metode], murid dapat [KKO] [materi] dengan [tepat]'.`,
        kegiatanAwal: `Buat Kegiatan Awal (Pendahuluan) interaktif. Gunakan kata "Murid".`,
        kegiatanInti: `Buat Kegiatan Inti dalam format JSON: {"memahami": "...", "mengaplikasikan": "...", "merefleksi": "..."}. Sesuaikan dengan model ${formData.modelPembelajaran}.`,
        kegiatanPenutup: `Buat Kegiatan Penutup (Refleksi) yang bermakna.`,
        metode: `Saran 3 metode pembelajaran yang paling cocok.`,
        lintasDisiplin: `2 Mata pelajaran yang relevan untuk diintegrasikan.`,
        kemitraan: `Pihak luar (ortu/ahli/instansi) yang bisa diajak kerjasama.`,
        lingkunganBelajar: `Deskripsi lingkungan belajar yang mendukung materi ini.`,
        alatDigital: `Alat/platform digital yang menunjang pembelajaran.`
    };

    return `Bertindaklah sebagai Guru Profesional. Berdasarkan konteks berikut:\n${context}\n\nTugas: ${prompts[fieldName] || "Jelaskan tentang " + fieldName}\n\nOutput HANYA teks konten (tanpa penjelasan tambahan). Gunakan kata "Murid".`;
};
