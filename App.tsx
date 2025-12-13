import React, { useState } from 'react';
import { 
  Bot, ChevronRight, ChevronLeft, Save, Edit3, File, Presentation, 
  FileText, List, CheckSquare, Layers, Copy, FileDown, CheckCircle, Printer,
  UserCircle, X, MapPin, Briefcase, GraduationCap
} from 'lucide-react';
import { Step1Identitas, Step2Konten, Step3Detail } from './components/FormSteps';
import { RPMDocument } from './components/Preview';
import { Button } from './components/UI';
import { initialFormData, RPMData, RubrikData, LKMData } from './types';
import { generateContent, cleanJSON, buildPrompt } from './services/geminiService';

export default function App() {
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
  const [formData, setFormData] = useState<RPMData>(initialFormData);

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
        Buat Materi Ajar HTML yang SANGAT DETAIL dan MENDALAM untuk murid.
        Konteks:
        - Mapel: ${formData.mataPelajaran}
        - Topik: ${formData.materiPokok}
        - CP: ${formData.capaianPembelajaran}
        - Kelas: ${formData.kelas}

        Struktur Wajib (gunakan tag HTML):
        <h3>1. Pengantar</h3> (Paragraf pembuka yang menarik)
        <h3>2. Konsep Utama</h3> (Penjelasan mendalam teori/konsep)
        <h3>3. Fakta & Data</h3> (Poin-poin penting, fakta unik, atau rumus jika ada)
        <h3>4. Penerapan dalam Kehidupan</h3> (Contoh nyata)
        <h3>5. Rangkuman</h3> (Poin kunci)

        Gunakan tag <p>, <ul>, <li>, <strong>, <em>. 
        JANGAN gunakan markdown. Keluarkan HANYA kode HTML yang siap render.
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
        Buat Soal Sumatif HTML untuk murid.
        Materi: ${formData.materiPokok}. Kelas: ${formData.kelas}.
        
        Instruksi Format:
        1. Gunakan tag <ol> untuk list soal.
        2. Gunakan <li> untuk setiap butir soal.
        3. Berikan jarak antar soal menggunakan <br/><br/> atau margin css inline.
        4. Sediakan area jawaban (titik-titik atau kotak kosong).

        Jumlah Soal:
        - ${soalConfig.pg} Pilihan Ganda (Opsi a,b,c,d ke bawah).
        - ${soalConfig.isian} Isian Singkat (Sediakan titik-titik ........).
        - ${soalConfig.uraian} Uraian (Sediakan ruang jawaban luas).
        
        Output HANYA kode HTML (tanpa markdown block).
        Contoh struktur:
        <h3>A. Pilihan Ganda</h3>
        <ol>
           <li style="margin-bottom: 10px;">Pertanyaan?<br/>
               a. Opsi A<br/>b. Opsi B...
           </li>
        </ol>
        ...dst
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
        Buat LKM (Lembar Kerja Murid) JSON valid yang lengkap. 
        Topik: ${formData.materiPokok}.
        
        Format JSON:
        {
          "judul_kegiatan": "Nama kegiatan yang menarik",
          "tujuan_kegiatan": "Tujuan spesifik LKM ini",
          "alat_bahan": "Daftar alat dan bahan (dipisahkan koma)",
          "langkah": ["Langkah 1", "Langkah 2", "Langkah 3", "Langkah 4"],
          "pertanyaan": ["Pertanyaan Analisis 1", "Pertanyaan Analisis 2", "Kesimpulan"]
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><Bot size={28} className="text-white" /></div>
            <div>
                <h1 className="text-xl font-bold tracking-wide">RPM Generator <span className="text-orange-500">Pro</span></h1>
                <p className="text-xs text-blue-100 opacity-90">Rencana Pembelajaran Mendalam</p>
            </div>
            <button 
                onClick={() => setShowDevInfo(true)} 
                className="ml-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-blue-100 hover:text-white"
                title="Info Developer"
            >
                <UserCircle size={24} />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
             <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-orange-500 text-white' : 'text-blue-200'}`}>1. Identitas</span>
             <ChevronRight size={16} className="text-blue-400" />
             <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-orange-500 text-white' : 'text-blue-200'}`}>2. Konten & AI</span>
             <ChevronRight size={16} className="text-blue-400" />
             <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-orange-500 text-white' : 'text-blue-200'}`}>3. Detail</span>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {!showPreview ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-50 p-8">
                <form>
                    {step === 1 && <Step1Identitas formData={formData} setFormData={setFormData} />}
                    {step === 2 && <Step2Konten formData={formData} setFormData={setFormData} uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} additionalContext={additionalContext} setAdditionalContext={setAdditionalContext} />}
                    {step === 3 && <Step3Detail formData={formData} setFormData={setFormData} generateField={handleGenerateField} loaders={loaders} />}
                </form>
                <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                    {step > 1 ? <Button onClick={() => setStep(step - 1)} variant="secondary" icon={ChevronLeft}>Kembali</Button> : <div></div>}
                    {step < 3 ? <Button onClick={() => setStep(step + 1)} variant="primary" className="flex-row-reverse">Lanjut <ChevronRight size={20} /></Button> : <Button onClick={() => setShowPreview(true)} variant="accent" icon={Save}>Lihat Preview & Cetak</Button>}
                </div>
            </div>
          ) : (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 print:hidden bg-white p-4 rounded-xl shadow-sm border">
                    <Button onClick={() => setShowPreview(false)} variant="secondary" icon={Edit3}>Edit Data</Button>
                    <div className="flex gap-2">
                        <Button onClick={handleDownloadWord} variant="primary" icon={FileDown}>Download Word (.doc)</Button>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-200 print:hidden flex flex-wrap gap-2">
                     <Button onClick={() => switchDoc('rpm')} variant={activeDocs.rpm ? "active" : "outline"} size="sm" icon={File}>Dokumen Utama</Button>
                     <Button onClick={() => switchDoc('paparan')} variant={activeDocs.paparan ? "active" : "outline"} size="sm" icon={Presentation}>Paparan Materi</Button>
                     <Button onClick={() => switchDoc('lkm')} variant={activeDocs.lkm ? "active" : "outline"} size="sm" icon={FileText}>LKM</Button>
                     <Button onClick={() => switchDoc('rubrik')} variant={activeDocs.rubrik ? "active" : "outline"} size="sm" icon={List}>Rubrik</Button>
                     <Button onClick={() => switchDoc('soal')} variant={activeDocs.soal ? "active" : "outline"} size="sm" icon={CheckSquare}>Soal</Button>
                     <Button onClick={activateAllDocs} variant="success" size="sm" icon={Layers}>Tampilkan Semua</Button>
                </div>
                
                <div className="overflow-x-auto pb-10 bg-gray-200 p-4 md:p-8 rounded-xl print:p-0 print:bg-white print:rounded-none print:overflow-visible">
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
              <p className="text-sm font-semibold text-gray-600">RPM Generator Pro © 2025</p>
              <p className="text-xs text-gray-500 mt-1">Dedy Meyga Saputra, S.Pd, M.Pd | UPT SD Negeri Remen 2</p>
          </div>
      </footer>

      {/* Developer Info Modal */}
      {showDevInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden">
            <div className="bg-white rounded-2xl p-0 w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-in-up">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
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
                    
                    <h2 className="text-sm font-bold tracking-wider text-purple-600 uppercase mb-1">Developer Generator AI</h2>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Dedy Meyga Saputra, S.Pd, M.Pd</h3>
                    
                    <div className="space-y-3 text-left bg-gray-50 p-4 rounded-xl text-sm">
                        <div className="flex items-start gap-3">
                            <Briefcase size={18} className="text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-700">Guru Kelas</p>
                                <p className="text-gray-500">UPT SD Negeri Remen 2</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-700">Lokasi</p>
                                <p className="text-gray-500">Kecamatan Jenu Kabupaten Tuban Provinsi Jawa Timur</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <GraduationCap size={18} className="text-orange-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-700">Edukasi</p>
                                <p className="text-gray-500">Pendidikan Dasar & Teknologi Pembelajaran</p>
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

      {toastMessage && <div className="fixed bottom-10 right-10 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in z-50"><CheckCircle size={20} className="text-green-400" /><span>{toastMessage}</span></div>}
    </div>
  );
}