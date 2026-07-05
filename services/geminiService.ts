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
export const cleanJSON = (text: string | undefined): any => {
  if (!text) return null;
  try {
    let str = text.replace(/```json/g, '').replace(/```/g, '').trim();
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
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        userApiKey: key
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
    throw new Error(error.message || "Gagal menghubungkan ke layanan AI. Pastikan API Key Anda aktif.");
  }
};

export const buildPrompt = (
  fieldName: string,
  formData: RPMData,
  additionalContext: string,
  fileName?: string
): string => {
  const baseContext = `
    Konteks Pembelajaran:
    - Mapel: ${formData.mataPelajaran}
    - Materi: ${formData.materiPokok}
    - Kelas: ${formData.kelas}
    - CP: ${formData.capaianPembelajaran}
    - Model: ${formData.modelPembelajaran}
    - Tambahan Info: ${additionalContext}
    ${fileName ? `- Referensi File: ${fileName}` : ''}
    
    Istilah wajib: Gunakan kata "Murid" (bukan siswa/peserta didik).
  `;

  let specificPrompt = "";

  switch (fieldName) {
    case 'tujuanPembelajaran':
      specificPrompt = `
        Buat 3 Tujuan Pembelajaran yang spesifik, terukur, dan relevan dengan CP.
        Setiap tujuan pembelajaran HARUS dirumuskan mengikuti kaidah formula berikut secara ketat:
        'Melalui [pendekatan, media, model, atau metode], murid dapat [kata kerja operasional Taksonomi Bloom atau Taksonomi SOLO] [materi pembelajaran] dengan [Benar, Sesuai, Tepat, dll disesuaikan dengan keadaan/materi]'.
        Pilih salah satu (pendekatan, media, model, atau metode) yang paling pas dan relevan dengan materi untuk diletakkan di bagian awal kalimat.
        Jika tujuan pembelajaran tersebut meminta murid untuk menyebutkan atau menjelaskan sesuatu, berikan perintah yang menyebutkan berapa jumlahnya secara spesifik (misalnya: menyebutkan minimal 3..., menjelaskan 2...).
        PENTING: Integrasikan penggunaan media/digital "${formData.alatDigital}" atau lingkungan belajar "${formData.lingkunganBelajar}" (jika ada) secara alami ke dalam rumus kalimat tersebut agar terlihat operasional dan nyata.
        Format: List dengan penomoran (1. ..., 2. ...). Langsung isinya saja.
      `;
      break;
    case 'metode':
      specificPrompt = `Sebutkan 3 metode/strategi pembelajaran yang spesifik untuk model ${formData.modelPembelajaran}. LANGSUNG POINNYA SAJA dipisahkan koma. Jangan ada penjelasan.`;
      break;
    case 'lintasDisiplin':
      specificPrompt = `Sebutkan 2 mata pelajaran lain yang relevan dari daftar berikut: PAIBP, Pendidikan Pancasila, Bahasa Indonesia, Matematika, IPAS, Seni Budaya, PJOK, Bahasa Inggris, Bahasa Jawa, KKA. LANGSUNG POINNYA SAJA dipisahkan koma. JANGAN berikan penjelasan.`;
      break;
    case 'kemitraan':
      specificPrompt = `Sebutkan pihak/mitra yang bisa dilibatkan (misal: Orang Tua, Ahli). LANGSUNG POINNYA SAJA dipisahkan koma. Tanpa penjelasan.`;
      break;
    case 'lingkunganBelajar':
      specificPrompt = `Sebutkan tempat belajar yang spesifik dan relevan dengan materi (misal: Di dalam kelas, Halaman sekolah, Perpustakaan). Langsung sebutkan nama tempatnya saja, dipisahkan koma. Tanpa penjelasan panjang.`;
      break;
    case 'alatDigital':
      specificPrompt = `Sebutkan alat/media digital yang relevan. LANGSUNG POINNYA SAJA dipisahkan koma. Tanpa penjelasan.`;
      break;
    case 'kegiatanAwal':
      specificPrompt = `
        Buat Kegiatan Awal (Pendahuluan) yang terstruktur dan sangat rapi. Minimal 3 poin utama.
        Poin pertama HARUS persis: "Guru mengucapkan salam, berdoa, dan mengecek kehadiran murid." dilanjutkan dengan Apersepsi.
        Tulis langsung poin-poinnya dipisahkan oleh baris baru (newline).
        PENTING: JANGAN tuliskan angka penomoran (1., 2.) atau tanda hubung/bullet di luar bold di awal kalimat. Tulis langsung dengan format:
        **Apersepsi / Motivasi:** Murid...
        Gunakan **BOLD** pada kata kunci penting di setiap poin.
      `;
      break;
    case 'kegiatanPenutup':
      specificPrompt = `
        Buat Kegiatan Penutup yang terstruktur dan sangat rapi. Minimal 3 poin utama.
        Tulis langsung poin-poinnya dipisahkan oleh baris baru (newline).
        PENTING: JANGAN tuliskan angka penomoran (1., 2.) atau tanda hubung/bullet di luar bold di awal kalimat. Tulis langsung dengan format:
        **Menyimpulkan Pembelajaran:** Murid bersama dengan guru membuat kesimpulan...
        **Refleksi:** Murid melakukan refleksi terhadap jalannya proses pembelajaran...
        **Evaluasi dan Tindak Lanjut:** Murid mengerjakan asesmen formatif...
        
        Gunakan **BOLD** pada kata kunci penting di setiap poin.
      `;
      break;
    case 'kegiatanInti':
       specificPrompt = `
         Buat rincian Kegiatan Inti pembelajaran berdasarkan model ${formData.modelPembelajaran} untuk materi ${formData.materiPokok}.
         Bagi menjadi 3 tahap spesifik dalam format JSON:
         1. "memahami": (Syntax awal model). MURID harus aktif (mengamati/menanya), bukan guru ceramah.
         2. "mengaplikasikan": (Syntax tengah model). Murid mencoba/diskusi/eksperimen.
         3. "merefleksi": (Syntax akhir model). Murid menyimpulkan/presentasi.

         Output JSON Wajib:
         {
            "memahami": "Narasi aktivitas...",
            "mengaplikasikan": "Narasi aktivitas...",
            "merefleksi": "Narasi aktivitas..."
         }
         Setiap value wajib terdiri dari 3-5 poin/langkah aktivitas murid yang dipecah menggunakan baris baru (newline atau \\n) dan diawali dengan penomoran angka (1., 2., dst) atau tanda hubung (-). 
         Gunakan **BOLD** pada kata kunci penting.
         Tambahkan label (Berkesadaran), (Bermakna), atau (Menggembirakan) di akhir setiap poin yang relevan.
       `;
       break;
    default:
      specificPrompt = "Buat konten yang relevan.";
  }

  return `${baseContext}\n\nInstruksi: ${specificPrompt}\nPastikan respons langsung ke intinya tanpa basa-basi pembuka/penutup.`;
};