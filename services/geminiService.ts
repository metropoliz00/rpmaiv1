import { GoogleGenAI } from "@google/genai";
import { RPMData } from "../types";

// Initialize the Gemini SDK
// Note: Ensure process.env.API_KEY is available in your build environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Maaf, AI tidak dapat memberikan respons saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Gagal menghubungkan ke layanan AI.");
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
        PENTING: Integrasikan penggunaan media/digital "${formData.alatDigital}" dan lingkungan belajar "${formData.lingkunganBelajar}" (jika ada) ke dalam kalimat tujuan agar terlihat operasional dan nyata.
        Format: List dengan penomoran (1. ..., 2. ...). Langsung isinya saja.
      `;
      break;
    case 'metode':
      specificPrompt = `Sebutkan 3 metode/strategi pembelajaran yang spesifik untuk model ${formData.modelPembelajaran}. LANGSUNG POINNYA SAJA dipisahkan koma. Jangan ada penjelasan.`;
      break;
    case 'lintasDisiplin':
      specificPrompt = `Sebutkan 2 mata pelajaran lain yang relevan dengan materi ini. LANGSUNG POINNYA SAJA dipisahkan koma. JANGAN berikan penjelasan.`;
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
      specificPrompt = `Buat Kegiatan Awal (Pendahuluan). Poin pertama HARUS: "Guru mengucapkan salam, berdoa, dan mengecek kehadiran murid." dilanjutkan Apersepsi. Minimal 3 poin. Format numbering (1., 2.). Gunakan **BOLD** pada kata kunci.`;
      break;
    case 'kegiatanPenutup':
      specificPrompt = `Buat Kegiatan Penutup. Minimal 3 poin. Gunakan format numbering (1., 2.). Gunakan **BOLD** pada kata kunci utama (misal: **1. Refleksi:** Murid...).`;
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
         Setiap value adalah string narasi deskriptif atau poin-poin (gunakan tanda - jika perlu) TANPA PENOMORAN ANGKA (seperti 1., 2. dst). 
         Gunakan **BOLD** pada kata kunci penting.
         Tambahkan label (Berkesadaran), (Bermakna), atau (Menggembirakan) di akhir setiap poin yang relevan.
       `;
       break;
    default:
      specificPrompt = "Buat konten yang relevan.";
  }

  return `${baseContext}\n\nInstruksi: ${specificPrompt}\nPastikan respons langsung ke intinya tanpa basa-basi pembuka/penutup.`;
};