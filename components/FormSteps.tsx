import React from 'react';
import { User, BookOpen, Layout, Upload, FilePlus, List, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { InputGroup, SectionTitle } from './UI';
import { RPMData, dplOptions, getDefaultDurationsForJP, adjustDurations, getMinutesFromAlokasi } from '../types';
import { getCPBySubjectAndClass } from '../services/capaianPembelajaranService';

interface StepProps {
  formData: RPMData;
  setFormData: React.Dispatch<React.SetStateAction<RPMData>>;
}

interface Step2Props extends StepProps {
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  additionalContext: string;
  setAdditionalContext: (s: string) => void;
  generateField?: (field: string, target?: string) => void;
  loaders?: Record<string, boolean>;
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
            <InputGroup label="Nama Sekolah" required><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.namaSekolah} onChange={(e) => setFormData({...formData, namaSekolah: e.target.value})} placeholder="Masukkan nama sekolah" /></InputGroup>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
             <InputGroup label="Nama Kepala Sekolah"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.namaKepalaSekolah} onChange={(e) => setFormData({...formData, namaKepalaSekolah: e.target.value})} placeholder="Masukkan nama kepala sekolah" /></InputGroup>
             <InputGroup label="NIP Kepala Sekolah"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.nipKepalaSekolah} onChange={(e) => setFormData({...formData, nipKepalaSekolah: e.target.value})} placeholder="Masukkan NIP kepala sekolah" /></InputGroup>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
             <InputGroup label="Nama Guru"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.namaPenyusun} onChange={(e) => setFormData({...formData, namaPenyusun: e.target.value})} placeholder="Masukkan nama guru" /></InputGroup>
             <InputGroup label="NIP Guru"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.nipPenyusun} onChange={(e) => setFormData({...formData, nipPenyusun: e.target.value})} placeholder="Masukkan NIP guru" /></InputGroup>
          </div>
      </div>
    </div>
  );
};

const digitalPresets = [
  "Chromebook",
  "Quizizz",
  "YouTube Video",
  "TV Interaktif",
  "Media Pembelajaran Interaktif",
  "Blog Pembelajaran",
  "LKPD Digital (LiveWorksheets)",
  "Canva",
  "Geogebra",
  "Assembler Edu",
  "Phet Simulation"
];

const lingkunganPresets = [
  "Ruang Kelas",
  "Perpustakaan Sekolah",
  "Halaman / Lapangan Sekolah",
  "Lingkungan Sekitar Sekolah",
  "Sawah/Kebun",
  "Pojok Baca Kelas"
];

const lintasDisiplinPresets = [
  "PAI",
  "IPAS",
  "Pendidikan Pancasila",
  "Bahasa Indonesia",
  "Matematika",
  "Seni Budaya",
  "KKA",
  "Bahasa Jawa",
  "Bahasa Inggris",
  "PJOK"
];

const kemitraanPresets = [
  "Orang Tua Murid",
  "Rekan Sejawat",
  "Puskesmas",
  "kepolisian",
  "Kelompok belajar",
  "Komunitas Peduli Lingkungan"
];

export const Step2Konten: React.FC<Step2Props> = ({ formData, setFormData, uploadedFile, setUploadedFile, additionalContext, setAdditionalContext, generateField, loaders }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setUploadedFile(file);
    }
  };

  React.useEffect(() => {
    if (formData.mataPelajaran && formData.kelas) {
      const cp = getCPBySubjectAndClass(formData.mataPelajaran, formData.kelas);
      if (cp) {
        setFormData(prev => {
          if (prev.capaianPembelajaran !== cp) {
            return {
              ...prev,
              capaianPembelajaran: cp
            };
          }
          return prev;
        });
      }
    }
  }, [formData.mataPelajaran, formData.kelas, setFormData]);

  return (
    <div className="animate-fade-in-up">
      <SectionTitle title="Detail Pembelajaran & Konteks" icon={BookOpen} />
      
      <div className="mb-6 p-5 bg-purple-50/50 rounded-xl border border-purple-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-3 text-sm flex items-center gap-2"><Sparkles size={16} className="text-purple-600 animate-pulse"/> Tambahan Konteks AI (Opsional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Upload File Pendukung (PDF/Doc)</label>
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 transition-all">
                        <FilePlus size={16} className="text-purple-600" /> Pilih File
                        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <span className="text-xs text-gray-500 italic truncate max-w-[150px] sm:max-w-xs">{uploadedFile ? uploadedFile.name : "Belum ada file"}</span>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Paste Materi/Teks Tambahan</label>
                <textarea className="w-full p-2.5 border border-gray-300 rounded-lg text-xs h-20 focus:ring-1 focus:ring-purple-500 focus:border-purple-500" placeholder="Paste ringkasan materi atau instruksi khusus di sini untuk memperkuat hasil AI..." value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)}></textarea>
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
                <option value="KKA">KKA</option>
            </select>
        </InputGroup>
        <InputGroup label="Materi Pokok"><input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.materiPokok} onChange={(e) => setFormData({...formData, materiPokok: e.target.value})} placeholder="Masukkan materi pokok" /></InputGroup>
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
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.alokasiWaktu} onChange={(e) => {
                const val = e.target.value;
                const defaults = getDefaultDurationsForJP(val);
                setFormData({
                    ...formData,
                    alokasiWaktu: val,
                    kegiatanAwalDurasi: defaults.awal,
                    kegiatanIntiDurasi: defaults.inti,
                    kegiatanPenutupDurasi: defaults.penutup
                });
            }}>
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

const metodeOptions = [
  "Diskusi Kelompok",
  "Tanya Jawab",
  "Presentasi",
  "Eksperimen",
  "Demonstrasi",
  "Simulasi",
  "Bermain Peran",
  "Penugasan",
  "Ceramah Interaktif",
  "Mind Mapping",
  "Pengamatan Lingkungan",
  "Kerja Kelompok",
  "Sosiodrama",
  "Lainnya"
];

const pendekatanOptions = ["Kontekstual", "Saintifik", "Gamifikasi", "Kooperatif", "Problem Solving", "Lainnya"];
const modelOptions = [
  "Problem Based Learning (PBL)",
  "Project Based Learning (PjBL)",
  "Discovery Learning",
  "Inquiry Learning",
  "Cooperative Learning"
];

export const Step3Detail: React.FC<Step3Props> = ({ formData, setFormData, generateField, onGenerateBulkRPM, onGenerateBulkLampiran, loaders }) => {
    const togglePreset = (field: 'alatDigital' | 'lingkunganBelajar' | 'lintasDisiplin' | 'kemitraan', value: string) => {
        const currentVal = formData[field] || '';
        const items = currentVal.split(',').map(s => s.trim()).filter(Boolean);
        
        if (items.includes(value)) {
            const filtered = items.filter(item => item !== value);
            setFormData(prev => ({ ...prev, [field]: filtered.join(', ') }));
        } else {
            setFormData(prev => ({ ...prev, [field]: [...items, value].join(', ') }));
        }
    };

    const renderPresetPills = (field: 'alatDigital' | 'lingkunganBelajar' | 'lintasDisiplin' | 'kemitraan', presets: string[]) => {
        const currentVal = formData[field] || '';
        const selectedItems = currentVal.split(',').map(s => s.trim()).filter(Boolean);
        
        return (
            <div className="flex flex-wrap gap-1.5 mt-2">
                {presets.map(preset => {
                    const isSelected = selectedItems.includes(preset);
                    return (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => togglePreset(field, preset)}
                            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all border ${
                                isSelected 
                                    ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100' 
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                        >
                            {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                        </button>
                    );
                })}
            </div>
        );
    };

    const handleDplChange = (label: string) => {
        if (formData.dpl.includes(label)) {
            setFormData({...formData, dpl: formData.dpl.filter(d => d !== label)});
        } else {
            setFormData({...formData, dpl: [...formData.dpl, label]});
        }
    };

    const selectedMetodeList = formData.metode
        ? formData.metode.split(',').map(m => m.trim()).filter(m => m.length > 0)
        : [];

    const handleMetodeChange = (item: string) => {
        let newList: string[];
        if (selectedMetodeList.includes(item)) {
            newList = selectedMetodeList.filter(m => m !== item);
        } else {
            newList = [...selectedMetodeList, item];
        }
        setFormData({ ...formData, metode: newList.join(', ') });
    };

    const detectedCP = (formData.mataPelajaran && formData.kelas) ? getCPBySubjectAndClass(formData.mataPelajaran, formData.kelas) : '';
    const getFase = (k: string) => {
        if (!k) return '';
        const cleanK = k.trim().toUpperCase();
        if (['I', 'II', '1', '2'].includes(cleanK)) return 'A';
        if (['III', 'IV', '3', '4'].includes(cleanK)) return 'B';
        if (['V', 'VI', '5', '6'].includes(cleanK)) return 'C';
        return '';
    };
    const currentFase = getFase(formData.kelas);

    return (
        <div className="animate-fade-in-up space-y-8">
            <SectionTitle title="Komponen Pembelajaran" icon={Layout} />
            
            {/* Capaian Pembelajaran */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="space-y-0.5">
                        <label className="block text-sm font-bold text-gray-800">Capaian Pembelajaran (CP)</label>
                        <p className="text-xs text-gray-500">Capaian kompetensi dasar kurikulum yang terdeteksi otomatis</p>
                    </div>
                    {currentFase && (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                📋 Terdeteksi FASE {currentFase} (Kelas {formData.kelas})
                            </span>
                            {detectedCP && formData.capaianPembelajaran !== detectedCP && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, capaianPembelajaran: detectedCP})}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all shadow-sm active:scale-95"
                                    title="Reset ke CP resmi dari kurikulum"
                                >
                                    <RefreshCw size={12} className="text-amber-600" /> Reset ke CP Default
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <textarea 
                    className="w-full p-3.5 border border-gray-300 rounded-lg h-36 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans leading-relaxed" 
                    value={formData.capaianPembelajaran} 
                    onChange={(e) => setFormData({...formData, capaianPembelajaran: e.target.value})} 
                    placeholder="Masukkan atau edit capaian pembelajaran" 
                />
            </div>

            {/* Model & Metode */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Pendekatan Pembelajaran">
                    <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={pendekatanOptions.includes(formData.pendekatanPembelajaran) ? formData.pendekatanPembelajaran : (formData.pendekatanPembelajaran ? 'Lainnya' : '')} onChange={(e) => {
                        if (e.target.value === 'Lainnya') setFormData({...formData, pendekatanPembelajaran: ''});
                        else setFormData({...formData, pendekatanPembelajaran: e.target.value});
                    }}>
                        <option value="">Pilih Pendekatan</option>
                        {pendekatanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {!pendekatanOptions.includes(formData.pendekatanPembelajaran) && formData.pendekatanPembelajaran !== '' && (
                        <input type="text" className="w-full p-3 mt-2 border border-gray-300 rounded-lg" value={formData.pendekatanPembelajaran} onChange={(e) => setFormData({...formData, pendekatanPembelajaran: e.target.value})} placeholder="Masukkan pendekatan pembelajaran lainnya" />
                    )}
                </InputGroup>

                <InputGroup label="Model Pembelajaran">
                    <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={modelOptions.includes(formData.modelPembelajaran) ? formData.modelPembelajaran : (formData.modelPembelajaran ? 'Lainnya' : '')} onChange={(e) => {
                        if (e.target.value === 'Lainnya') setFormData({...formData, modelPembelajaran: ''});
                        else setFormData({...formData, modelPembelajaran: e.target.value});
                    }}>
                        <option value="">Pilihan Model</option>
                        {modelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        <option value="Lainnya">Lainnya</option>
                    </select>
                    {!modelOptions.includes(formData.modelPembelajaran) && formData.modelPembelajaran !== '' && (
                        <input type="text" className="w-full p-3 mt-2 border border-gray-300 rounded-lg" value={formData.modelPembelajaran} onChange={(e) => setFormData({...formData, modelPembelajaran: e.target.value})} placeholder="Masukkan model pembelajaran lainnya" />
                    )}
                </InputGroup>

                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Metode Pembelajaran (Pilih lebih dari 1)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {metodeOptions.map((opt) => (
                            <div key={opt} onClick={() => handleMetodeChange(opt)} 
                                 className={`cursor-pointer p-2.5 rounded-lg border text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center text-center min-h-[44px] sm:min-h-0 leading-tight ${selectedMetodeList.includes(opt) ? `border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200` : 'border-gray-200 hover:bg-gray-50 text-gray-600 bg-white'}`}>
                                 {opt}
                            </div>
                        ))}
                    </div>
                    {selectedMetodeList.includes('Lainnya') && (
                        <input type="text" className="w-full p-3 mt-2 border border-gray-300 rounded-lg" onChange={(e) => {
                             const newList = selectedMetodeList.filter(m => m !== 'Lainnya');
                             setFormData({...formData, metode: [...newList, e.target.value].join(', ')});
                        }} placeholder="Masukkan metode pembelajaran lainnya" />
                    )}
                </div>
            </div>
            
            {/* Media & Lingkungan */}
             <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Pemanfaatan Digital" subLabel="Pilih referensi di bawah untuk mengisi cepat">
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.alatDigital} onChange={(e) => setFormData({...formData, alatDigital: e.target.value})} placeholder="Masukkan media/alat digital" />
                    {renderPresetPills('alatDigital', digitalPresets)}
                </InputGroup>
                <InputGroup label="Lingkungan Belajar" subLabel="Pilih referensi di bawah untuk mengisi cepat">
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.lingkunganBelajar} onChange={(e) => setFormData({...formData, lingkunganBelajar: e.target.value})} placeholder="Masukkan deskripsi lingkungan belajar" />
                    {renderPresetPills('lingkunganBelajar', lingkunganPresets)}
                </InputGroup>
                 <InputGroup label="Lintas Disiplin Ilmu" subLabel="Pilih referensi di bawah untuk mengisi cepat">
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.lintasDisiplin} onChange={(e) => setFormData({...formData, lintasDisiplin: e.target.value})} placeholder="Masukkan disiplin ilmu terkait" />
                    {renderPresetPills('lintasDisiplin', lintasDisiplinPresets)}
                </InputGroup>
                <InputGroup label="Kemitraan" subLabel="Pilih referensi di bawah untuk mengisi cepat">
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.kemitraan} onChange={(e) => setFormData({...formData, kemitraan: e.target.value})} placeholder="Masukkan pihak kemitraan" />
                    {renderPresetPills('kemitraan', kemitraanPresets)}
                </InputGroup>
            </div>

            {/* DPL Checkboxes */}
            <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-4">Dimensi Profil Lulusan (Pilih minimal 1)</label>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {dplOptions.map((opt) => (
                        <div key={opt.label} onClick={() => handleDplChange(opt.label)} 
                             className={`cursor-pointer p-2.5 sm:p-3 rounded-lg border text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center text-center min-h-[44px] sm:min-h-0 leading-tight ${formData.dpl.includes(opt.label) ? `border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200` : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                             {opt.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tujuan Pembelajaran Moved Here */}
            <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="space-y-0.5">
                        <label className="block text-sm font-bold text-gray-800">Tujuan Pembelajaran</label>
                        <p className="text-xs text-gray-500">AI akan menggunakan data Model, Media, dan Lingkungan yang telah diisi di atas untuk membuat tujuan yang relevan.</p>
                    </div>
                    {generateField && (
                        <button
                            type="button"
                            onClick={() => generateField('tujuanPembelajaran')}
                            disabled={loaders?.['tujuanPembelajaran']}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white transition-all shadow-md shadow-purple-500/10 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shrink-0"
                        >
                            {loaders?.['tujuanPembelajaran'] ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" /> Menulis Tujuan...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={13} className="animate-pulse" /> Generate Tujuan AI
                                </>
                            )}
                        </button>
                    )}
                </div>
                <textarea 
                    className="w-full p-3.5 border border-gray-300 rounded-lg h-36 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans leading-relaxed" 
                    value={formData.tujuanPembelajaran} 
                    onChange={(e) => setFormData({...formData, tujuanPembelajaran: e.target.value})} 
                    placeholder="Contoh: 1. Melalui diskusi kelompok, murid dapat menjelaskan konsep... dengan tepat." 
                />
            </div>

            <SectionTitle title="Langkah Pembelajaran" icon={List} />

            <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
                {/* Durasi Konfigurasi */}
                {formData.alokasiWaktu ? (() => {
                    const totalMinutes = getMinutesFromAlokasi(formData.alokasiWaktu);
                    const awalPct = totalMinutes > 0 ? ((formData.kegiatanAwalDurasi || 0) / totalMinutes) * 100 : 0;
                    const intiPct = totalMinutes > 0 ? ((formData.kegiatanIntiDurasi || 0) / totalMinutes) * 100 : 0;
                    const penutupPct = totalMinutes > 0 ? ((formData.kegiatanPenutupDurasi || 0) / totalMinutes) * 100 : 0;

                    const handleDurationChange = (field: 'awal' | 'inti' | 'penutup', val: number) => {
                        const adjusted = adjustDurations(field, val, totalMinutes, {
                            awal: formData.kegiatanAwalDurasi || 0,
                            inti: formData.kegiatanIntiDurasi || 0,
                            penutup: formData.kegiatanPenutupDurasi || 0
                        });
                        setFormData({
                            ...formData,
                            kegiatanAwalDurasi: adjusted.awal,
                            kegiatanIntiDurasi: adjusted.inti,
                            kegiatanPenutupDurasi: adjusted.penutup
                        });
                    };

                    return (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Alokasi Waktu Pembelajaran</h4>
                                    <p className="text-xs text-blue-700">Total: <span className="font-bold">{formData.alokasiWaktu}</span> ({totalMinutes} Menit)</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        Durasi Terdistribusi
                                    </span>
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="h-3 w-full bg-blue-100 rounded-full flex overflow-hidden shadow-inner">
                                <div style={{ width: `${awalPct}%` }} className="bg-orange-400 h-full transition-all duration-300" title={`Awal: ${formData.kegiatanAwalDurasi} Menit`} />
                                <div style={{ width: `${intiPct}%` }} className="bg-blue-500 h-full transition-all duration-300" title={`Inti: ${formData.kegiatanIntiDurasi} Menit`} />
                                <div style={{ width: `${penutupPct}%` }} className="bg-green-500 h-full transition-all duration-300" title={`Penutup: ${formData.kegiatanPenutupDurasi} Menit`} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {/* Kegiatan Awal */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-orange-900">
                                        <span>Awal (Pendahuluan)</span>
                                        <span>{formData.kegiatanAwalDurasi} menit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleDurationChange('awal', (formData.kegiatanAwalDurasi || 0) - 5)}
                                            className="h-10 px-3 bg-white border border-gray-300 rounded-lg hover:bg-orange-50 text-orange-700 font-bold text-xs active:bg-orange-100 transition-colors shrink-0"
                                        >
                                            -5m
                                        </button>
                                        <input 
                                            type="number"
                                            min="0"
                                            max={totalMinutes}
                                            value={formData.kegiatanAwalDurasi}
                                            onChange={(e) => handleDurationChange('awal', parseInt(e.target.value) || 0)}
                                            className="w-full text-center h-10 border border-gray-300 rounded-lg text-sm font-semibold bg-white"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleDurationChange('awal', (formData.kegiatanAwalDurasi || 0) + 5)}
                                            className="h-10 px-3 bg-white border border-gray-300 rounded-lg hover:bg-orange-50 text-orange-700 font-bold text-xs active:bg-orange-100 transition-colors shrink-0"
                                        >
                                            +5m
                                        </button>
                                    </div>
                                </div>

                                {/* Kegiatan Inti */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-blue-900">
                                        <span>Inti (Eksplorasi)</span>
                                        <span>{formData.kegiatanIntiDurasi} menit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleDurationChange('inti', (formData.kegiatanIntiDurasi || 0) - 5)}
                                            className="h-10 px-3 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-xs active:bg-blue-100 transition-colors shrink-0"
                                        >
                                            -5m
                                        </button>
                                        <input 
                                            type="number"
                                            min="0"
                                            max={totalMinutes}
                                            value={formData.kegiatanIntiDurasi}
                                            onChange={(e) => handleDurationChange('inti', parseInt(e.target.value) || 0)}
                                            className="w-full text-center h-10 border border-gray-300 rounded-lg text-sm font-semibold bg-white"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleDurationChange('inti', (formData.kegiatanIntiDurasi || 0) + 5)}
                                            className="h-10 px-3 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 text-blue-700 font-bold text-xs active:bg-blue-100 transition-colors shrink-0"
                                        >
                                            +5m
                                        </button>
                                    </div>
                                </div>

                                {/* Kegiatan Penutup */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold text-green-900">
                                        <span>Penutup (Refleksi)</span>
                                        <span>{formData.kegiatanPenutupDurasi} menit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleDurationChange('penutup', (formData.kegiatanPenutupDurasi || 0) - 5)}
                                            className="h-10 px-3 bg-white border border-gray-300 rounded-lg hover:bg-green-50 text-green-700 font-bold text-xs active:bg-green-100 transition-colors shrink-0"
                                        >
                                            -5m
                                        </button>
                                        <input 
                                            type="number"
                                            min="0"
                                            max={totalMinutes}
                                            value={formData.kegiatanPenutupDurasi}
                                            onChange={(e) => handleDurationChange('penutup', parseInt(e.target.value) || 0)}
                                            className="w-full text-center h-10 border border-gray-300 rounded-lg text-sm font-semibold bg-white"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleDurationChange('penutup', (formData.kegiatanPenutupDurasi || 0) + 5)}
                                            className="h-10 px-3 bg-white border border-gray-300 rounded-lg hover:bg-green-50 text-green-700 font-bold text-xs active:bg-green-100 transition-colors shrink-0"
                                        >
                                            +5m
                                        </button>
                                    </div>
                                </div>
                             </div>
                         </div>
                     );
                 })() : (
                     <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800 flex items-center gap-2">
                         <span>⚠️</span>
                         <span><span className="font-bold">Alokasi Waktu belum dipilih.</span> Silakan pilih JP di langkah "Identitas & Konten" terlebih dahulu agar durasi kegiatan awal, inti, dan penutup dapat terdistribusi secara otomatis.</span>
                     </div>
                 )}

                 <div className="flex justify-between items-center mb-2">
                     <label className="block text-sm font-bold text-gray-700">Kegiatan Awal</label>
                     <button type="button" onClick={() => generateField('kegiatanAwal')} disabled={loaders['kegiatanAwal']} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 flex items-center gap-1.5 disabled:opacity-50">
                         {loaders['kegiatanAwal'] ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                         Generate Awal AI
                     </button>
                 </div>
                 <InputGroup label="" subLabel="Pendahuluan, Apersepsi, Pemantik">
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg h-40 font-mono text-sm" value={formData.kegiatanAwal} onChange={(e) => setFormData({...formData, kegiatanAwal: e.target.value})} placeholder="Masukkan kegiatan awal" />
                </InputGroup>
                
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                         <label className="block text-sm font-bold text-gray-700">Kegiatan Inti</label>
                         <button type="button" onClick={() => generateField('kegiatanInti')} disabled={loaders['kegiatanInti']} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 flex items-center gap-1.5 disabled:opacity-50">
                             {loaders['kegiatanInti'] ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                             Generate Inti AI
                         </button>
                    </div>
                    
                    <div className="space-y-4 pl-4 border-l-4 border-blue-100">
                        <InputGroup label="1. Memahami (Awal Model)" subLabel="Aktivitas murid mengamati/menanya">
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm" value={formData.intiMemahami} onChange={(e) => setFormData({...formData, intiMemahami: e.target.value})} placeholder="Contoh: Murid melakukan observasi..." />
                        </InputGroup>
                         <InputGroup label="2. Mengaplikasikan (Tengah Model)" subLabel="Aktivitas murid mencoba/diskusi">
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm" value={formData.intiMengaplikasikan} onChange={(e) => setFormData({...formData, intiMengaplikasikan: e.target.value})} placeholder="Contoh: Murid berdiskusi..." />
                        </InputGroup>
                         <InputGroup label="3. Merefleksi (Akhir Model)" subLabel="Aktivitas murid menyimpulkan">
                            <textarea className="w-full p-3 border border-gray-300 rounded-lg h-32 font-mono text-sm" value={formData.intiMerefleksi} onChange={(e) => setFormData({...formData, intiMerefleksi: e.target.value})} placeholder="Contoh: Murid menyimpulkan..." />
                        </InputGroup>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2 mt-4">
                    <label className="block text-sm font-bold text-gray-700">Kegiatan Penutup</label>
                    <button type="button" onClick={() => generateField('kegiatanPenutup')} disabled={loaders['kegiatanPenutup']} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 flex items-center gap-1.5 disabled:opacity-50">
                        {loaders['kegiatanPenutup'] ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                        Generate Penutup AI
                    </button>
                </div>
                <InputGroup label="" subLabel="Refleksi, Apresiasi, Tindak Lanjut">
                    <textarea className="w-full p-3 border border-gray-300 rounded-lg h-40 font-mono text-sm" value={formData.kegiatanPenutup} onChange={(e) => setFormData({...formData, kegiatanPenutup: e.target.value})} placeholder="Masukkan kegiatan penutup" />
                </InputGroup>
            </div>
        </div>
    );
};