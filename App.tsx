import React, { useState } from 'react';
import { 
  Bot, ChevronRight, ChevronLeft, Save, Edit3, File, Presentation, 
  FileText, List, CheckSquare, Layers, Copy, FileDown, CheckCircle, Printer,
  UserCircle, X, MapPin, Briefcase, GraduationCap, Settings, LogOut, Key, Mail, Lock, Eye, EyeOff, ExternalLink, Trash2,
  MessageCircle
} from 'lucide-react';
import { Step1Identitas, Step2Konten, Step3Detail } from './components/FormSteps';
import { RPMDocument } from './components/Preview';
import { Button } from './components/UI';
import { initialFormData, RPMData, RubrikData, LKMData } from './types';
import { generateContent, cleanJSON, buildPrompt } from './services/geminiService';
import { ActivationScreen } from './components/ActivationScreen';
import { checkIsActivated, clearCredentials, getSavedCredentials, saveCredentials } from './services/licenseService';

export default function App() {
  const [isActivated, setIsActivated] = useState(checkIsActivated());
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const handleDeactivate = () => {
    clearCredentials();
    setIsActivated(false);
    setShowDeactivateConfirm(false);
  };

  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDevInfo, setShowDevInfo] = useState(false);
  
  // Loading states
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});
  
  // Content states
  const [generatedSoalContent, setGeneratedSoalContent] = useState("");
  const [generatedMateriContent, setGeneratedMateriContent] = useState("");
  const [generatedRubrikContent, setGeneratedRubrikContent] = useState<RubrikData>({
      sikap: [],
      keterampilan: []
  });
  const [generatedLKMContent, setGeneratedLKMContent] = useState<LKMData | null>(null);

  // PDF/Context
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");

  const [activeDocs, setActiveDocs] = useState({
    rpm: true,
    paparan: false,
    lkm: false,
    rubrik: false,
    soal: false
  });

  const [soalConfig, setSoalConfig] = useState({
    pg: 5,
    isian: 5,
    uraian: 3
  });

  const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
  const [formData, setFormData] = useState<RPMData>(() => {
    try {
      const saved = localStorage.getItem('rpm_form_data');
      return saved ? JSON.parse(saved) : initialFormData;
    } catch (e) {
      return initialFormData;
    }
  });

  // Auto-save formData to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('rpm_form_data', JSON.stringify(formData));
  }, [formData]);

  const handleClearData = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan semua data form dan hasil AI?")) {
      setFormData(initialFormData);
      setGeneratedSoalContent("");
      setGeneratedMateriContent("");
      setGeneratedRubrikContent({ sikap: [], keterampilan: [] });
      setGeneratedLKMContent(null);
      setUploadedFile(null);
      setAdditionalContext("");
      setStep(1);
      setToastMessage("Form berhasil dikosongkan.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Welcome effect on successful activation
  React.useEffect(() => {
    if (isActivated) {
      const creds = getSavedCredentials();
      if (creds) {
        setToastMessage(`Selamat datang, ${creds.email}!`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    }
  }, [isActivated]);

  // --- ACTIONS ---

  const switchDoc = (docKey: string) => {
    setActiveDocs({
        rpm: docKey === 'rpm',
        paparan: docKey === 'paparan',
        lkm: docKey === 'lkm',
        rubrik: docKey === 'rubrik',
        soal: docKey === 'soal'
    });
  };

  const activateAllDocs = () => {
    setActiveDocs({
        rpm: true,
        paparan: true,
        lkm: true,
        rubrik: true,
        soal: true
    });
  };

  const handleGenerateField = async (fieldName: string, targetField: string = fieldName) => {
      if (!formData.materiPokok || !formData.capaianPembelajaran) {
          alert("Mohon isi Materi Pokok dan CP terlebih dahulu.");
          return;
      }

      setLoaders(prev => ({ ...prev, [fieldName]: true }));

      const prompt = buildPrompt(fieldName, formData, additionalContext, uploadedFile?.name);

      try {
          // Special handler for JSON output in 'kegiatanInti'
          if (fieldName === 'kegiatanInti') {
               const res = await generateContent(prompt);
               const json = cleanJSON(res);
               if (json) {
                   setFormData(prev => ({
                       ...prev,
                       intiMemahami: json.memahami || "",
                       intiMengaplikasikan: json.mengaplikasikan || "",
                       intiMerefleksi: json.merefleksi || ""
                   }));
               }
          } else {
              const result = await generateContent(prompt);
              setFormData(prev => ({ ...prev, [targetField]: result.trim() }));
          }
      } catch (e) {
          console.error(e);
          alert("Gagal generate AI.");
      } finally {
          setLoaders(prev => ({ ...prev, [fieldName]: false }));
      }
  };

  const generateMateriAI = async () => {
    setLoaders(prev => ({ ...prev, materi: true }));
    const prompt = `
        Bertindaklah sebagai ahli kurikulum, penulis buku pelajaran, dan guru profesional. Tugas Anda adalah membuat Ringkasan Materi Pembelajaran yang berisi esensi materi paling penting sehingga murid dapat memahami dan mengingat materi dengan cepat tanpa harus membaca seluruh buku.
        
        Konteks:
        - Mapel: ${formData.mataPelajaran}
        - Topik: ${formData.materiPokok}
        - CP: ${formData.capaianPembelajaran}
        - Kelas: ${formData.kelas}
        
        Ketentuan Ringkasan Materi:
        1. Fokus hanya pada inti konsep yang wajib dipahami murid.
        2. Gunakan bahasa yang sederhana, jelas, komunikatif, dan sesuai tingkat perkembangan murid kelas ${formData.kelas}.
        3. Gunakan kata "Murid" secara konsisten untuk menyebut peserta belajar (jangan gunakan siswa atau peserta didik).
        4. Hilangkan penjelasan yang terlalu panjang, berulang, atau tidak esensial.
        5. Susun materi secara runtut dari konsep dasar menuju konsep yang lebih kompleks.
        6. Gunakan poin-poin, tabel, atau daftar agar mudah dibaca.
        7. Berikan penekanan pada istilah, konsep, fakta, prinsip, atau rumus yang harus diingat.
        8. Sertakan hubungan sebab-akibat, fungsi, manfaat, ciri-ciri, langkah-langkah, atau klasifikasi jika relevan dengan materi.
        9. Jika terdapat rumus, tampilkan rumus beserta penjelasan singkat maknanya.
        10. Jika terdapat proses atau tahapan, sajikan dalam urutan yang jelas.
        11. Akhiri dengan bagian "Inti Materi yang Harus Diingat" berisi 5–10 poin paling penting.

        Format Output Wajib (Gunakan tag HTML berikut secara tepat):
        <h3>Ringkasan Materi</h3>
        <h4>Konsep Utama</h4>
        <p>(Jelaskan konsep-konsep inti materi secara singkat dan jelas)</p>
        
        <h4>Poin-Poin Penting</h4>
        <p>(Sajikan fakta, prinsip, ciri-ciri, manfaat, fungsi, rumus, atau klasifikasi yang harus dipahami murid. Gunakan tag &lt;ul&gt; &lt;li&gt; atau &lt;table&gt; jika diperlukan)</p>
        
        <h4>Hubungan Antar Konsep</h4>
        <p>(Jelaskan keterkaitan antar konsep dalam materi)</p>
        
        <h4>Inti Materi yang Harus Diingat</h4>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>✓ Poin penting 1</li>
          <li>✓ Poin penting 2</li>
          <li>✓ Poin penting 3</li>
          <li>✓ dan seterusnya (sajikan 5-10 poin paling penting)</li>
        </ul>

        Aturan teknis:
        - Gunakan tag HTML seperti <h3>, <h4>, <p>, <ul>, <li>, <strong>, <em>, atau <table>, <tr>, <td> untuk tabel.
        - JANGAN gunakan markdown. Keluarkan HANYA kode HTML yang siap dirender di dalam div dangerouslySetInnerHTML.
    `;
    try {
        const res = await generateContent(prompt);
        setGeneratedMateriContent(res.replace(/```html/g, '').replace(/```/g, '').trim());
    } catch(e) { alert("Gagal generate materi"); }
    setLoaders(prev => ({ ...prev, materi: false }));
  };

  const generateSoalAI = async () => {
     setIsGeneratingSoal(true);
     const prompt = `
        Bertindaklah sebagai ahli evaluasi kurikulum, guru profesional, dan penyusun soal standar nasional/internasional. Tugas Anda adalah membuat Soal Sumatif yang dirancang khusus untuk mengukur kemampuan berpikir tingkat tinggi (HOTS), berpikir kritis, analitis, evaluatif, dan pemecahan masalah murid.

        Konteks Pembelajaran:
        - Mata Pelajaran: ${formData.mataPelajaran}
        - Materi Pokok: ${formData.materiPokok}
        - Kelas/Fase: ${formData.kelas} / ${formData.semester}

        Ketentuan Kualitas Soal:
        1. Hindari soal yang hanya menguji hafalan atau ingatan (C1-C2).
        2. Gunakan stimulus berbasis masalah, studi kasus kontekstual, data tabel, grafik, atau fenomena nyata di sekitar murid sebagai dasar pertanyaan.
        3. Setiap soal harus menuntut murid untuk menganalisis hubungan sebab-akibat, membandingkan informasi, menilai keandalan alternatif, memprediksi dampak, atau merumuskan solusi kreatif (C4, C5, C6).
        4. Gunakan kata kerja operasional HOTS seperti: analisislah, bandingkanlah, evaluasilah, buktikanlah, prediksikanlah, hubungkanlah, pecahkanlah.
        5. Gunakan kata "Murid" secara konsisten untuk merujuk pada peserta belajar.

        Jumlah & Format Soal yang Wajib Dibuat:
        - Pilihan Ganda (HOTS): ${soalConfig.pg} butir. Setiap soal harus didahului stimulus/kasus singkat, diikuti opsi pilihan ganda yang homogen dan logis (a, b, c, d ke bawah).
        - Isian Singkat (Berpikir Kritis): ${soalConfig.isian} butir. Pertanyaan yang menuntut kesimpulan logis singkat dari suatu skenario. Sediakan titik-titik (........) untuk tempat menjawab.
        - Uraian (Berpikir Analitis & Pemecahan Masalah): ${soalConfig.uraian} butir. Pertanyaan terbuka mendalam yang menuntut argumentasi ilmiah atau solusi terstruktur. Sediakan ruang jawaban yang luas berupa beberapa baris kosong.

        Instruksi Format Output HTML:
         - Gunakan tag <ol> untuk daftar soal di setiap kategori (Pilihan Ganda, Isian Singkat, Uraian).
         - Pastikan setiap butir soal menggunakan tag <li> agar browser memberikan nomor secara otomatis, jelas, dan rapi.
         - JANGAN menuliskan nomor manual di awal tag <li> (misalnya jangan menulis "<li>1. Stimulus..." atau "<li>1) ...") karena itu akan menyebabkan penomoran ganda (bertumpuk). Biarkan tag <ol> dan <li> menangani penomoran otomatis secara bersih.
        - Atur style CSS inline yang rapi agar nyaman dibaca murid (misal margin-bottom, dsb).
        - Output HANYA berupa kode HTML murni yang siap dirender di dalam div dangerouslySetInnerHTML (tanpa pembungkus markdown block \`\`\`html atau \`\`\`).

        Contoh Struktur Output:
        <h3>A. Soal Pilihan Ganda (Berpikir Kritis & Analitis)</h3>
        <p style="font-size: 11px; color: #4b5563; font-style: italic; margin-bottom: 8px;">Pilihlah salah satu jawaban yang paling tepat berdasarkan analisis Anda terhadap kasus yang disajikan!</p>
        <ol style="padding-left: 20px; margin-bottom: 24px;">
           <li style="margin-bottom: 16px;">
              <strong>Stimulus/Skenario Kasus:</strong> [Tulis kasus/stimulus menarik di sini] <br/>
              [Pertanyaan analitik berdasarkan kasus tersebut...]<br/>
              <span style="display: block; margin-top: 4px; padding-left: 12px;">
                a. [Pilihan A]<br/>
                b. [Pilihan B]<br/>
                c. [Pilihan C]<br/>
                d. [Pilihan D]
              </span>
           </li>
        </ol>

        <h3>B. Soal Isian Singkat (Analisis Logis)</h3>
        <ol style="padding-left: 20px; margin-bottom: 24px;">
           <li style="margin-bottom: 16px;">
              <strong>Skenario Singkat:</strong> [Tulis skenario ringkas...] <br/>
              [Pertanyaan logis...] ..........................................................................................................................................
           </li>
        </ol>

        <h3>C. Soal Uraian (Pemecahan Masalah & Solusi Kreatif)</h3>
        <ol style="padding-left: 20px; margin-bottom: 24px;">
           <li style="margin-bottom: 24px;">
              [Kasus/Masalah Kompleks...] <br/>
              [Pertanyaan Uraian mendalam: analisislah/prediksikanlah/evaluasilah...]<br/>
              <div style="margin-top: 12px; border: 1px dashed #9ca3af; height: 100px; padding: 8px; font-size: 10px; color: #9ca3af;">Lembar Jawaban Murid:</div>
           </li>
        </ol>
     `;
     try {
        const result = await generateContent(prompt);
        setGeneratedSoalContent(result.replace(/```html/g, '').replace(/```/g, '').trim());
     } catch (error) { alert("Gagal generate soal"); }
     setIsGeneratingSoal(false);
  };

  const generateRubrikAI = async () => {
    setLoaders(prev => ({ ...prev, rubrik: true }));
    const prompt = `
      Buat Rubrik JSON valid. Materi: ${formData.materiPokok}. DPL: ${formData.dpl.join(", ")}.
      JSON: { "sikap": [{"dpl": "...", "indikator": "..."}], "keterampilan": ["Indikator 1", "Indikator 2"] }
    `;
    try {
        const res = await generateContent(prompt);
        const json = cleanJSON(res);
        if (json) setGeneratedRubrikContent({ sikap: json.sikap || [], keterampilan: json.keterampilan || [] });
    } catch(e) { alert("Gagal generate rubrik"); }
    setLoaders(prev => ({ ...prev, rubrik: false }));
  };

  const generateLKMAI = async () => {
    setLoaders(prev => ({ ...prev, lkm: true }));
    const prompt = `
        Bertindaklah sebagai ahli kurikulum, guru profesional, fasilitator pembelajaran abad 21, dan pengembang LKPD/LKM. Tugas Anda adalah membuat Lembar Kegiatan Murid (LKM) Kelompok yang selaras dengan model pembelajaran yang dipilih guru dan dirancang untuk mengembangkan kemampuan berpikir kritis, analitis, kolaboratif, kreatif, komunikasi, dan pemecahan masalah.

        LKM harus berpusat pada murid (student-centered), mendorong diskusi aktif, investigasi, analisis data/informasi, argumentasi, serta pengambilan keputusan berdasarkan bukti. Gunakan istilah "Murid" secara konsisten (jangan gunakan "siswa" atau "peserta didik").

        Konteks Pembelajaran:
        - Mata Pelajaran: ${formData.mataPelajaran}
        - Kelas/Fase: ${formData.kelas} / ${formData.semester}
        - Materi Pokok: ${formData.materiPokok}
        - Model Pembelajaran: ${formData.modelPembelajaran}
        - Alokasi Waktu: ${formData.alokasiWaktu}

        Format JSON yang harus dihasilkan wajib valid, lengkap, dan tanpa markdown block:
        {
          "judul_kegiatan": "Nama kegiatan kolaboratif kelompok yang menarik dan kontekstual",
          "tujuan_kegiatan": "Tujuan spesifik LKM ini berkaitan dengan materi dan kompetensi",
          "alat_bahan": "Daftar alat dan bahan (dipisahkan koma)",
          "petunjuk_kegiatan": [
            "Petunjuk singkat 1",
            "Petunjuk singkat 2",
            "Petunjuk singkat 3"
          ],
          "stimulus": "Sajikan sebuah stimulus berupa paragraf artikel singkat/studi kasus/fenomena nyata di sekitar murid yang kontekstual, menarik, dan dekat dengan kehidupan murid.",
          "orientasi_masalah": [
            "Pertanyaan pemantik HOTS untuk mengamati & menemukan masalah dari stimulus di atas.",
            "Pertanyaan pemantik HOTS untuk mengidentifikasi fakta atau menghubungkan informasi awal."
          ],
          "investigasi_aktivitas": [
            "Langkah investigasi kelompok 1 (sesuaikan dengan sintaks model ${formData.modelPembelajaran})",
            "Langkah investigasi kelompok 2 (sesuaikan dengan sintaks model ${formData.modelPembelajaran})",
            "Langkah investigasi kelompok 3 (sesuaikan dengan sintaks model ${formData.modelPembelajaran})"
          ],
          "analisis_berpikir_kritis": [
            "Pertanyaan HOTS Analitis (Misal: Analisislah hubungan sebab-akibat...)",
            "Pertanyaan HOTS Evaluatif/Solutif (Misal: Berikan solusi terbaik untuk...)"
          ],
          "produk_diskusi": "Tentukan bentuk produk hasil diskusi kelompok (misal: Peta konsep / Poster / Diagram / Tabel analisis / Laporan singkat) lengkap dengan instruksi pembuatannya secara ringkas",
          "panduan_presentasi": [
            "Aturan penyampaian pendapat dan presentasi kelompok.",
            "Panduan untuk argumentasi, tanya jawab, dan refleksi hasil diskusi."
          ]
        }
    `;
    try {
        const res = await generateContent(prompt);
        const json = cleanJSON(res);
        if (json) setGeneratedLKMContent(json);
    } catch(e) { alert("Gagal generate LKM"); }
    setLoaders(prev => ({ ...prev, lkm: false }));
  };

  const handleDownloadWord = () => {
      const el = document.getElementById('rpm-document');
      if (!el) return;
      
      const content = el.innerHTML;
      
      const wordStyles = `
        <style>
            @page {
                size: 21.0cm 29.7cm;
                margin: 2cm 2cm 2cm 2cm;
                mso-page-orientation: portrait;
            }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.15; color: black; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 10pt; font-size: 12pt; }
            td, th { border: 1px solid black; padding: 5pt; vertical-align: top; }
            .header-col { width: 140px; font-weight: bold; text-align: center; vertical-align: middle; background-color: transparent !important; }
            .no-border-table td { border: none !important; padding: 2pt 5pt; }
            .signature-table { margin-top: 30pt; width: 100%; border: none !important; }
            .signature-table td { border: none !important; text-align: center; vertical-align: top; }
            h3 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; page-break-after: avoid; }
            p { margin-bottom: 6pt; text-align: justify; text-indent: 0; }
            ul, ol { margin-top: 0; margin-bottom: 6pt; margin-left: 24pt; padding-left: 0; }
            li { margin-bottom: 3pt; text-align: justify; }
            .bg-blue-50, .bg-orange-100, .bg-green-100 { background: none !important; background-color: transparent !important; }
            .dpl-table { width: 100%; border: none !important; }
            .dpl-table td { border: none !important; padding: 2pt; }
        </style>
      `;

      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>RPM Export</title>${wordStyles}</head><body>`;
      const footer = "</body></html>";
      
      const sourceHTML = header + content + footer;
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `RPM_${(formData.materiPokok || 'Dokumen').replace(/\s+/g, '_')}.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
  };

  const handlePrintPDF = () => {
    // Trik: Ubah judul dokumen sementara agar nama file PDF default menjadi informatif saat 'Save as PDF'
    const oldTitle = document.title;
    const safeMateri = (formData.materiPokok || 'Dokumen').replace(/[^a-zA-Z0-9]/g, '_');
    const safeKelas = (formData.kelas || '').replace(/[^a-zA-Z0-9]/g, '_');
    
    document.title = `RPM_${safeMateri}_${safeKelas}`;
    
    // Memicu dialog cetak browser
    window.print();
    
    // Kembalikan judul asli
    document.title = oldTitle;
  };

  const handleCopy = () => {
      const el = document.getElementById('rpm-document');
      if (el) {
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection) {
              range.selectNodeContents(el);
              selection.removeAllRanges();
              selection.addRange(range);
              document.execCommand('copy');
              selection.removeAllRanges();
              setToastMessage("Berhasil disalin!");
              setTimeout(() => setToastMessage(null), 3000);
          }
      }
  };

  if (!isActivated) {
    return <ActivationScreen onActivated={() => setIsActivated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm shrink-0">
              <Bot size={24} className="text-white sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-wide truncate">
                  <span className="inline sm:hidden">RPM <span className="text-orange-500">Pro</span></span>
                  <span className="hidden sm:inline">RPM Generator <span className="text-orange-500">Pro</span></span>
                </h1>
                <p className="text-[10px] sm:text-xs text-blue-100 opacity-90 truncate">Rencana Pembelajaran Mendalam</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1 sm:ml-2">
              <button 
                  onClick={() => setShowDevInfo(true)} 
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-blue-100 hover:text-white"
                  title="Info Developer"
              >
                  <UserCircle size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button 
                  onClick={() => setShowDeactivateConfirm(true)} 
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-blue-100 hover:text-white"
                  title="Keluar dari Sesi"
              >
                  <LogOut size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium shrink-0">
             <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-orange-500 text-white' : 'text-blue-200'}`}>1. Identitas</span>
             <ChevronRight size={16} className="text-blue-400" />
             <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-orange-500 text-white' : 'text-blue-200'}`}>2. Konten & AI</span>
             <ChevronRight size={16} className="text-blue-400" />
             <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-orange-500 text-white' : 'text-blue-200'}`}>3. Detail</span>
          </div>

        </div>
      </header>

      <main className="flex-grow p-3 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {!showPreview ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-50 p-4 sm:p-8">
                <form>
                    {step === 1 && <Step1Identitas formData={formData} setFormData={setFormData} />}
                    {step === 2 && <Step2Konten formData={formData} setFormData={setFormData} uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} additionalContext={additionalContext} setAdditionalContext={setAdditionalContext} />}
                    {step === 3 && <Step3Detail formData={formData} setFormData={setFormData} generateField={handleGenerateField} loaders={loaders} />}
                </form>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-8 pt-6 border-t border-gray-100 gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {step > 1 && (
                          <Button onClick={() => setStep(step - 1)} variant="secondary" icon={ChevronLeft} className="w-full sm:w-auto">Kembali</Button>
                        )}
                        <Button 
                          onClick={handleClearData} 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50 w-full sm:w-auto"
                          icon={Trash2}
                        >
                          Kosongkan Form
                        </Button>
                    </div>
                    {step < 3 ? (
                      <Button onClick={() => setStep(step + 1)} variant="primary" className="flex-row-reverse w-full sm:w-auto">Lanjut <ChevronRight size={20} /></Button>
                    ) : (
                      <Button onClick={() => setShowPreview(true)} variant="accent" icon={Save} className="w-full sm:w-auto">Lihat Preview & Cetak</Button>
                    )}
                </div>
            </div>
          ) : (
            <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 print:hidden bg-white p-3 sm:p-4 rounded-xl shadow-sm border gap-3">
                    <Button onClick={() => setShowPreview(false)} variant="secondary" icon={Edit3} className="w-full sm:w-auto">Edit Data</Button>
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleDownloadWord} variant="primary" icon={FileDown} className="w-full sm:w-auto">Download Word (.doc)</Button>
                        <Button onClick={handlePrintPDF} variant="accent" icon={Printer} className="w-full sm:w-auto">Cetak (Print)</Button>
                    </div>
                </div>
                
                <div className="bg-white p-3 rounded-xl shadow-md mb-6 border border-gray-200 print:hidden flex overflow-x-auto gap-2 no-scrollbar scroll-smooth whitespace-nowrap scrollbar-thin">
                     <Button onClick={() => switchDoc('rpm')} variant={activeDocs.rpm ? "active" : "outline"} size="sm" icon={File} className="shrink-0">Dokumen Utama</Button>
                     <Button onClick={() => switchDoc('paparan')} variant={activeDocs.paparan ? "active" : "outline"} size="sm" icon={Presentation} className="shrink-0">Paparan Materi</Button>
                     <Button onClick={() => switchDoc('lkm')} variant={activeDocs.lkm ? "active" : "outline"} size="sm" icon={FileText} className="shrink-0">LKM</Button>
                     <Button onClick={() => switchDoc('rubrik')} variant={activeDocs.rubrik ? "active" : "outline"} size="sm" icon={List} className="shrink-0">Rubrik</Button>
                     <Button onClick={() => switchDoc('soal')} variant={activeDocs.soal ? "active" : "outline"} size="sm" icon={CheckSquare} className="shrink-0">Soal</Button>
                     <Button onClick={activateAllDocs} variant="success" size="sm" icon={Layers} className="shrink-0">Tampilkan Semua</Button>
                </div>
                
                <div className="overflow-x-auto pb-10 bg-gray-200 p-2 md:p-8 rounded-xl print:p-0 print:bg-white print:rounded-none print:overflow-visible">
                    <RPMDocument 
                        formData={formData}
                        activeDocs={activeDocs}
                        generatedMateriContent={generatedMateriContent}
                        generatedLKMContent={generatedLKMContent}
                        generatedRubrikContent={generatedRubrikContent}
                        generatedSoalContent={generatedSoalContent}
                        soalConfig={soalConfig}
                        setSoalConfig={setSoalConfig}
                        loaders={loaders}
                        onGenerateMateri={generateMateriAI}
                        onGenerateLKM={generateLKMAI}
                        onGenerateRubrik={generateRubrikAI}
                        onGenerateSoal={generateSoalAI}
                        isGeneratingSoal={isGeneratingSoal}
                    />
                </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto print:hidden">
          <div className="max-w-5xl mx-auto px-4 text-center">
              <p className="text-sm font-semibold text-gray-600">RPM Pro © 2026</p>
              <p className="text-xs text-gray-500 mt-1">Dev | MeyGa</p>
          </div>
      </footer>

      {/* Developer Info Modal */}
      {showDevInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
            <div className="bg-white rounded-2xl p-0 w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up">
                <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-800 to-orange-500"></div>
                <button 
                    onClick={() => setShowDevInfo(false)}
                    className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                >
                    <X size={20} />
                </button>
                
                <div className="px-6 pb-8 text-center relative">
                    <div className="w-24 h-24 mx-auto -mt-12 mb-4 bg-white p-1.5 rounded-full shadow-lg">
                         <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600">
                             <UserCircle size={64} />
                         </div>
                    </div>
                    
                    <h2 className="text-sm font-bold tracking-wider text-orange-500 uppercase mb-1">Developer</h2>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Dev | MeyGa</h3>
                    
                    <div className="space-y-3 text-left bg-gray-50 p-4 rounded-xl text-sm">
                        <div className="flex items-start gap-3">
                            <MessageCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-700">WhatsApp</p>
                                <p className="text-gray-500 font-mono font-bold">085704431706</p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowDevInfo(false)}
                        className="mt-6 w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in print:hidden">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up border border-slate-100 text-center">
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <LogOut size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">Konfirmasi Keluar</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed font-sans">
                    Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan dihapus sepenuhnya dari browser ini.
                </p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowDeactivateConfirm(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-sm font-sans"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleDeactivate}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all text-sm font-sans shadow-md"
                    >
                        Ya, Keluar
                    </button>
                </div>
            </div>
        </div>
      )}

      {toastMessage && <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in z-50"><CheckCircle size={20} className="text-green-400" /><span>{toastMessage}</span></div>}
    </div>
  );
}