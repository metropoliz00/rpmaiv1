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

export const generateSmartFallback = (prompt: string): string => {
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
      console.warn("Server generation warning, using smart fallback.");
      return generateSmartFallback(prompt);
    }

    const data = await response.json();
    return data.text || generateSmartFallback(prompt);
  } catch (error: any) {
    console.warn("Gemini API Network/Server Error, using smart fallback:", error);
    return generateSmartFallback(prompt);
  }
};

export const testApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch("/api/gemini/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, message: data.error || "API Key tidak valid atau gagal terhubung." };
    }
    return { success: true, message: data.message || "API Key valid dan terhubung dengan sukses!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menguji koneksi API Key." };
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
