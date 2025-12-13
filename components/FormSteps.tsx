import React from 'react';
import { User, BookOpen, Layout, Upload, FilePlus, List, Loader2, Sparkles } from 'lucide-react';
import { InputGroup, SectionTitle } from './UI';
import { RPMData, dplOptions } from '../types';

interface StepProps {
  formData: RPMData;
  setFormData: React.Dispatch<React.SetStateAction<RPMData>>;
}

interface Step2Props extends StepProps {
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  additionalContext: string;
  setAdditionalContext: (s: string) => void;
}

interface Step3Props extends StepProps {
  generateField: (field: string, target?: string) => void;
  loaders: Record<string, boolean>;
}

export const Step1Identitas: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <div className="animate-fade-in-up">
      <SectionTitle title="Identitas & Profil Sekolah" icon={User} />
      <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
        <div className="grid grid-cols-1 gap-6">
            <InputGroup label="Nama Sekolah" required><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.namaSekolah} onChange={(e) => setFormData({...formData, namaSekolah: e.target.value})} /></InputGroup>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
             <InputGroup label="Nama Kepala Sekolah"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.namaKepalaSekolah} onChange={(e) => setFormData({...formData, namaKepalaSekolah: e.target.value})} /></InputGroup>
             <InputGroup label="NIP Kepala Sekolah"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.nipKepalaSekolah} onChange={(e) => setFormData({...formData, nipKepalaSekolah: e.target.value})} /></InputGroup>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
             <InputGroup label="Nama Guru"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.namaPenyusun} onChange={(e) => setFormData({...formData, namaPenyusun: e.target.value})} /></InputGroup>
             <InputGroup label="NIP Guru"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.nipPenyusun} onChange={(e) => setFormData({...formData, nipPenyusun: e.target.value})} /></InputGroup>
          </div>
      </div>
    </div>
  );
};

export const Step2Konten: React.FC<Step2Props> = ({ formData, setFormData, uploadedFile, setUploadedFile, additionalContext, setAdditionalContext }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setUploadedFile(file);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <SectionTitle title="Detail Pembelajaran & Konteks" icon={BookOpen} />
      
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <h4 className="font-bold text-indigo-800 mb-2 text-sm flex items-center gap-2"><Upload size={16}/> Tambahan Konteks AI</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Upload File Pendukung (PDF/Doc)</label>
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                        <FilePlus size={16}/> Pilih File
                        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <span className="text-xs text-gray-500 italic">{uploadedFile ? uploadedFile.name : "Belum ada file"}</span>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Paste Materi/Teks Tambahan</label>
                <textarea className="w-full p-2 border border-gray-300 rounded-lg text-sm h-20" placeholder="Paste ringkasan materi atau instruksi khusus di sini untuk memperkuat hasil AI..." value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)}></textarea>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Mata Pelajaran">
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.mataPelajaran} onChange={(e) => setFormData({...formData, mataPelajaran: e.target.value})}>
                <option value="">Pilih Mata Pelajaran</option>
                <option value="Pendidikan Agama Islam">Pendidikan Agama Islam</option>
                <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Matematika">Matematika</option>
                <option value="IPAS">IPAS</option>
                <option value="PJOK">PJOK</option>
                <option value="Seni">Seni</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="Bahasa Jawa">Bahasa Jawa</option>
            </select>
        </InputGroup>
        <InputGroup label="Materi Pokok"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.materiPokok} onChange={(e) => setFormData({...formData, materiPokok: e.target.value})} /></InputGroup>
        <InputGroup label="Kelas">
             <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.kelas} onChange={(e) => setFormData({...formData, kelas: e.target.value})}>
                <option value="">Pilih Kelas</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
            </select>
        </InputGroup>
        <InputGroup label="Alokasi Waktu">
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.alokasiWaktu} onChange={(e) => setFormData({...formData, alokasiWaktu: e.target.value})}>
                <option value="">Pilih JP</option>
                <option value="1 JP (1 x 35 Menit)">1 JP (1 x 35 Menit)</option>
                <option value="2 JP (2 x 35 Menit)">2 JP (2 x 35 Menit)</option>
                <option value="3 JP (3 x 35 Menit)">3 JP (3 x 35 Menit)</option>
                <option value="4 JP (4 x 35 Menit)">4 JP (4 x 35 Menit)</option>
                <option value="5 JP (5 x 35 Menit)">5 JP (5 x 35 Menit)</option>
                <option value="6 JP (6 x 35 Menit)">6 JP (6 x 35 Menit)</option>
            </select>
        </InputGroup>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Tahun Ajaran">
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.tahunPelajaran} onChange={(e) => setFormData({...formData, tahunPelajaran: e.target.value})}>
                <option value="">Pilih Tahun Ajaran</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2027/2028">2027/2028</option>
                <option value="2028/2029">2028/2029</option>
                <option value="2029/2030">2029/2030</option>
            </select>
        </InputGroup>
        <InputGroup label="Semester">
             <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                <option value="1 (Ganjil)">1 (Ganjil)</option>
                <option value="2 (Genap)">2 (Genap)</option>
            </select>
        </InputGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Tempat">
             <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.tempat} onChange={(e) => setFormData({...formData, tempat: e.target.value})} placeholder="Tempat" />
        </InputGroup>
        <InputGroup label="Tanggal">
             <input type="date" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
        </InputGroup>
      </div>
    </div>
  );
};

export const Step3Detail: React.FC<Step3Props> = ({ formData, setFormData, generateField, loaders }) => {
    const handleDplChange = (label: string) => {
        if (formData.dpl.includes(label)) {
            setFormData({...formData, dpl: formData.dpl.filter(d => d !== label)});
        } else {
            setFormData({...formData, dpl: [...formData.dpl, label]});
        }
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <SectionTitle title="Komponen Pembelajaran" icon={Layout} />
            
            {/* Capaian Pembelajaran */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <InputGroup label="Capaian Pembelajaran (CP)" subLabel="Salin CP dari kurikulum">
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32" value={formData.capaianPembelajaran} onChange={(e) => setFormData({...formData, capaianPembelajaran: e.target.value})} />
                </InputGroup>
            </div>

            {/* Model & Metode */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Model Pembelajaran">
                    <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.modelPembelajaran} onChange={(e) => setFormData({...formData, modelPembelajaran: e.target.value})}>
                        <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                        <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                        <option value="Discovery Learning">Discovery Learning</option>
                        <option value="Inquiry Learning">Inquiry Learning</option>
                        <option value="Cooperative Learning">Cooperative Learning</option>
                    </select>
                </InputGroup>

                <InputGroup label="Metode Pembelajaran" onGenerateAI={() => generateField('metode')} isGenerating={loaders['metode']}>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.metode} onChange={(e) => setFormData({...formData, metode: e.target.value})} placeholder="Contoh: Diskusi, Tanya Jawab..." />
                </InputGroup>
            </div>
            
            {/* Media & Lingkungan */}
             <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Pemanfaatan Digital" onGenerateAI={() => generateField('alatDigital')} isGenerating={loaders['alatDigital']}>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.alatDigital} onChange={(e) => setFormData({...formData, alatDigital: e.target.value})} />
                </InputGroup>
                <InputGroup label="Lingkungan Belajar" onGenerateAI={() => generateField('lingkunganBelajar')} isGenerating={loaders['lingkunganBelajar']}>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.lingkunganBelajar} onChange={(e) => setFormData({...formData, lingkunganBelajar: e.target.value})} />
                </InputGroup>
                 <InputGroup label="Lintas Disiplin Ilmu" onGenerateAI={() => generateField('lintasDisiplin')} isGenerating={loaders['lintasDisiplin']}>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.lintasDisiplin} onChange={(e) => setFormData({...formData, lintasDisiplin: e.target.value})} />
                </InputGroup>
                <InputGroup label="Kemitraan" onGenerateAI={() => generateField('kemitraan')} isGenerating={loaders['kemitraan']}>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.kemitraan} onChange={(e) => setFormData({...formData, kemitraan: e.target.value})} />
                </InputGroup>
            </div>

            {/* DPL Checkboxes */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-4">Dimensi Profil Lulusan (Pilih minimal 1)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dplOptions.map((opt) => (
                        <div key={opt.label} onClick={() => handleDplChange(opt.label)} 
                             className={`cursor-pointer p-3 rounded-lg border text-xs font-semibold transition-all ${formData.dpl.includes(opt.label) ? `border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200` : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                             {opt.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tujuan Pembelajaran Moved Here */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <InputGroup label="Tujuan Pembelajaran" subLabel="AI akan menggunakan data Model, Media, dan Lingkungan yang telah diisi di atas untuk membuat tujuan yang relevan." onGenerateAI={() => generateField('tujuanPembelajaran')} isGenerating={loaders['tujuanPembelajaran']}>
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32" value={formData.tujuanPembelajaran} onChange={(e) => setFormData({...formData, tujuanPembelajaran: e.target.value})} />
                </InputGroup>
            </div>

            <SectionTitle title="Langkah Pembelajaran" icon={List} />

            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
                 <InputGroup label="Kegiatan Awal" subLabel="Pendahuluan, Apersepsi, Pemantik" onGenerateAI={() => generateField('kegiatanAwal')} isGenerating={loaders['kegiatanAwal']}>
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg h-40 font-mono text-sm" value={formData.kegiatanAwal} onChange={(e) => setFormData({...formData, kegiatanAwal: e.target.value})} />
                </InputGroup>
                
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                         <label className="block text-sm font-bold text-gray-700">Kegiatan Inti</label>
                         <button 
                            type="button" 
                            onClick={() => generateField('kegiatanInti')} 
                            disabled={loaders['kegiatanInti']}
                            className="text-xs flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                            {loaders['kegiatanInti'] ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                            Generate Full Inti (3 Tahap)
                        </button>
                    </div>
                    
                    <div className="space-y-4 pl-4 border-l-4 border-blue-100">
                        <InputGroup label="1. Memahami (Awal Model)" subLabel="Aktivitas murid mengamati/menanya">
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm" value={formData.intiMemahami} onChange={(e) => setFormData({...formData, intiMemahami: e.target.value})} />
                        </InputGroup>
                         <InputGroup label="2. Mengaplikasikan (Tengah Model)" subLabel="Aktivitas murid mencoba/diskusi">
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm" value={formData.intiMengaplikasikan} onChange={(e) => setFormData({...formData, intiMengaplikasikan: e.target.value})} />
                        </InputGroup>
                         <InputGroup label="3. Merefleksi (Akhir Model)" subLabel="Aktivitas murid menyimpulkan">
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm" value={formData.intiMerefleksi} onChange={(e) => setFormData({...formData, intiMerefleksi: e.target.value})} />
                        </InputGroup>
                    </div>
                </div>

                <InputGroup label="Kegiatan Penutup" subLabel="Refleksi, Apresiasi, Tindak Lanjut" onGenerateAI={() => generateField('kegiatanPenutup')} isGenerating={loaders['kegiatanPenutup']}>
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg h-40 font-mono text-sm" value={formData.kegiatanPenutup} onChange={(e) => setFormData({...formData, kegiatanPenutup: e.target.value})} />
                </InputGroup>
            </div>
        </div>
    );
};