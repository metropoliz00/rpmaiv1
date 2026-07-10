import React from 'react';
import { User, BookOpen, Layout, Upload, FilePlus, List, Loader2, Sparkles } from 'lucide-react';
import { InputGroup, SectionTitle } from './UI';
import { RPMData, dplOptions, getDefaultDurationsForJP, adjustDurations, getMinutesFromAlokasi, getModelSyntaxes, getDefaultKegiatanAwal, getDefaultKegiatanPenutup } from '../types';
import { getCPBySubjectAndClass } from '../services/capaianPembelajaranService';
import { fetchDbKelas, fetchDbMataPelajaran, fetchDbMateri } from '../services/curriculumService';

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
  generateKegiatanAI?: () => void;
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
  const [dbKelas, setDbKelas] = React.useState<string[] | null>(null);
  const [dbMataPelajaran, setDbMataPelajaran] = React.useState<string[] | null>(null);
  const [dbMateri, setDbMateri] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    async function loadDb() {
      const [k, mp, mat] = await Promise.all([
        fetchDbKelas(),
        fetchDbMataPelajaran(),
        fetchDbMateri()
      ]);
      setDbKelas(k);
      setDbMataPelajaran(mp);
      setDbMateri(mat);
    }
    loadDb();
  }, []);

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

  const fallbackMataPelajaran = ["Pendidikan Agama Islam", "Pendidikan Pancasila", "Bahasa Indonesia", "Matematika", "IPAS", "PJOK", "Seni", "Bahasa Inggris", "Bahasa Jawa", "KKA"];
  const fallbackKelas = ["I", "II", "III", "IV", "V", "VI"];

  return (
    <div className="animate-fade-in-up">
      <SectionTitle title="Detail Pembelajaran & Konteks" icon={BookOpen} />
      


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Mata Pelajaran">
            {dbMataPelajaran && dbMataPelajaran.length > 0 ? (
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.mataPelajaran} onChange={(e) => setFormData({...formData, mataPelajaran: e.target.value})}>
                    <option value="">Pilih Mata Pelajaran (Database)</option>
                    {dbMataPelajaran.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            ) : dbMataPelajaran !== null && dbMataPelajaran.length === 0 ? (
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-400" disabled>
                    <option value="">(Kosong - Belum ada data di database)</option>
                </select>
            ) : (
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.mataPelajaran} onChange={(e) => setFormData({...formData, mataPelajaran: e.target.value})}>
                    <option value="">Pilih Mata Pelajaran</option>
                    {fallbackMataPelajaran.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            )}
        </InputGroup>
        <InputGroup label="Materi Pokok">
            {dbMateri && dbMateri.length > 0 ? (
                <div className="space-y-2">
                    <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.materiPokok} onChange={(e) => setFormData({...formData, materiPokok: e.target.value})}>
                        <option value="">Pilih dari Database atau ketik sendiri di bawah</option>
                        {dbMateri.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                    <input 
                        type="text" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm" 
                        value={formData.materiPokok} 
                        onChange={(e) => setFormData({...formData, materiPokok: e.target.value})} 
                        placeholder="Atau ketik materi pokok secara manual di sini..." 
                    />
                </div>
            ) : dbMateri !== null && dbMateri.length === 0 ? (
                <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg" 
                    value={formData.materiPokok} 
                    onChange={(e) => setFormData({...formData, materiPokok: e.target.value})} 
                    placeholder="Masukkan materi pokok secara manual" 
                />
            ) : (
                <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg" 
                    value={formData.materiPokok} 
                    onChange={(e) => setFormData({...formData, materiPokok: e.target.value})} 
                    placeholder="Masukkan materi pokok" 
                />
            )}
        </InputGroup>
        <InputGroup label="Kelas">
             {dbKelas && dbKelas.length > 0 ? (
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.kelas} onChange={(e) => setFormData({...formData, kelas: e.target.value})}>
                    <option value="">Pilih Kelas (Database)</option>
                    {dbKelas.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            ) : dbKelas !== null && dbKelas.length === 0 ? (
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-400" disabled>
                    <option value="">(Kosong - Belum ada data di database)</option>
                </select>
            ) : (
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.kelas} onChange={(e) => setFormData({...formData, kelas: e.target.value})}>
                    <option value="">Pilih Kelas</option>
                    {fallbackKelas.map(item => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            )}
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
                <option value="">Pilih Semester</option>
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
  "Cooperative Learning",
  "Lainnya"
];

export const Step3Detail: React.FC<Step3Props> = ({ formData, setFormData, generateField, generateKegiatanAI, loaders }) => {
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
                        const val = e.target.value;
                        if (val === 'Lainnya') setFormData({...formData, pendekatanPembelajaran: 'Lainnya'});
                        else setFormData({...formData, pendekatanPembelajaran: val});
                    }}>
                        <option value="">Pilih Pendekatan</option>
                        {pendekatanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {(formData.pendekatanPembelajaran === 'Lainnya' || (!pendekatanOptions.includes(formData.pendekatanPembelajaran) && formData.pendekatanPembelajaran !== '')) && (
                        <input type="text" className="w-full p-3 mt-2 border border-gray-300 rounded-lg" value={formData.pendekatanPembelajaran === 'Lainnya' ? '' : formData.pendekatanPembelajaran} onChange={(e) => setFormData({...formData, pendekatanPembelajaran: e.target.value})} placeholder="Masukkan pendekatan pembelajaran lainnya" />
                    )}
                </InputGroup>

                <InputGroup label="Model Pembelajaran">
                    <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={modelOptions.includes(formData.modelPembelajaran) ? formData.modelPembelajaran : (formData.modelPembelajaran ? 'Lainnya' : '')} onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Lainnya') setFormData({...formData, modelPembelajaran: 'Lainnya'});
                        else setFormData({...formData, modelPembelajaran: val});
                    }}>
                        <option value="">Pilih Model Pembelajaran</option>
                        {modelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {(formData.modelPembelajaran === 'Lainnya' || (!modelOptions.includes(formData.modelPembelajaran) && formData.modelPembelajaran !== '')) && (
                        <input type="text" className="w-full p-3 mt-2 border border-gray-300 rounded-lg" value={formData.modelPembelajaran === 'Lainnya' ? '' : formData.modelPembelajaran} onChange={(e) => setFormData({...formData, modelPembelajaran: e.target.value})} placeholder="Masukkan model pembelajaran lainnya" />
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
                    <div className="flex items-center gap-2">
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
                </div>
                <textarea 
                    className="w-full p-3.5 border border-gray-300 rounded-lg h-36 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans leading-relaxed" 
                    value={formData.tujuanPembelajaran} 
                    onChange={(e) => setFormData({...formData, tujuanPembelajaran: e.target.value})} 
                    placeholder="Contoh: 1. Melalui diskusi kelompok, murid dapat menjelaskan konsep... dengan tepat." 
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-purple-50 p-4 rounded-xl border border-purple-200 gap-3 mb-4">
                <div>
                    <h4 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-600 animate-pulse" />
                        Generate Seluruh Langkah Pembelajaran AI
                    </h4>
                    <p className="text-xs text-purple-700">Generate Kegiatan Awal, Inti (Memahami, Mengaplikasikan, Merefleksi), dan Penutup sekaligus dalam satu klik.</p>
                </div>
                {generateKegiatanAI && (
                    <button
                        type="button"
                        onClick={generateKegiatanAI}
                        disabled={loaders['kegiatanPembelajaran']}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 shrink-0 active:scale-95"
                    >
                        {loaders['kegiatanPembelajaran'] ? (
                            <>
                                <Loader2 size={15} className="animate-spin" /> Sedang Generate...
                            </>
                        ) : (
                            <>
                                <Sparkles size={15} className="animate-pulse" /> Generate Kegiatan AI
                            </>
                        )}
                    </button>
                )}
            </div>

            <SectionTitle title="Langkah Pembelajaran" icon={List} />

            <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
                {/* Durasi Konfigurasi */}
                {formData.alokasiWaktu ? (() => {
                    const totalMinutes = getMinutesFromAlokasi(formData.alokasiWaktu);
                    const awalPct = totalMinutes > 0 ? ((formData.kegiatanAwalDurasi || 0) / totalMinutes) * 100 : 0;
                    const intiPct = totalMinutes > 0 ? ((formData.kegiatanIntiDurasi || 0) / totalMinutes) * 100 : 0;
                    const penutupPct = totalMinutes > 0 ? ((formData.kegiatanPenutupDurasi || 0) / totalMinutes) * 100 : 0;

                    return (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Alokasi Waktu Pembelajaran</h4>
                                    <p className="text-xs text-blue-700">Total: <span className="font-bold">{formData.alokasiWaktu}</span> ({totalMinutes} Menit)</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        Awal: {formData.kegiatanAwalDurasi}m | Inti: {formData.kegiatanIntiDurasi}m | Penutup: {formData.kegiatanPenutupDurasi}m
                                    </span>
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="h-3 w-full bg-blue-100 rounded-full flex overflow-hidden shadow-inner">
                                <div style={{ width: `${awalPct}%` }} className="bg-orange-400 h-full transition-all duration-300" title={`Awal: ${formData.kegiatanAwalDurasi} Menit`} />
                                <div style={{ width: `${intiPct}%` }} className="bg-blue-500 h-full transition-all duration-300" title={`Inti: ${formData.kegiatanIntiDurasi} Menit`} />
                                <div style={{ width: `${penutupPct}%` }} className="bg-green-500 h-full transition-all duration-300" title={`Penutup: ${formData.kegiatanPenutupDurasi} Menit`} />
                            </div>
                        </div>
                    );
                })() : (
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800 flex items-center gap-2">
                        <span>⚠️</span>
                        <span><span className="font-bold">Alokasi Waktu belum dipilih.</span> Silakan pilih JP di langkah "Identitas & Konten" terlebih dahulu agar durasi kegiatan awal, inti, dan penutup dapat terdistribusi secara otomatis.</span>
                    </div>
                )}

                {/* Kegiatan Awal */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl border border-orange-200">
                        <div>
                            <label className="block text-sm font-bold text-orange-900">Kegiatan Awal</label>
                            <span className="text-xs text-orange-700">Pendahuluan, Apersepsi, Pemantik</span>
                        </div>
                        {formData.alokasiWaktu && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-orange-900">Durasi:</span>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const total = getMinutesFromAlokasi(formData.alokasiWaktu);
                                        const adj = adjustDurations('awal', (formData.kegiatanAwalDurasi || 0) - 5, total, { awal: formData.kegiatanAwalDurasi || 0, inti: formData.kegiatanIntiDurasi || 0, penutup: formData.kegiatanPenutupDurasi || 0 });
                                        setFormData({...formData, kegiatanAwalDurasi: adj.awal, kegiatanIntiDurasi: adj.inti, kegiatanPenutupDurasi: adj.penutup});
                                    }}
                                    className="h-8 px-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-100 text-orange-800 font-bold text-xs"
                                >
                                    -5m
                                </button>
                                <span className="text-xs font-bold w-12 text-center bg-white py-1 px-2 border border-orange-300 rounded-lg">{formData.kegiatanAwalDurasi} m</span>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const total = getMinutesFromAlokasi(formData.alokasiWaktu);
                                        const adj = adjustDurations('awal', (formData.kegiatanAwalDurasi || 0) + 5, total, { awal: formData.kegiatanAwalDurasi || 0, inti: formData.kegiatanIntiDurasi || 0, penutup: formData.kegiatanPenutupDurasi || 0 });
                                        setFormData({...formData, kegiatanAwalDurasi: adj.awal, kegiatanIntiDurasi: adj.inti, kegiatanPenutupDurasi: adj.penutup});
                                    }}
                                    className="h-8 px-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-100 text-orange-800 font-bold text-xs"
                                >
                                    +5m
                                </button>
                            </div>
                        )}
                    </div>
                    <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg h-40 font-mono text-sm bg-gray-50 text-gray-700" 
                        value={getDefaultKegiatanAwal(formData.materiPokok)} 
                        readOnly 
                    />
                </div>
                
                {/* Kegiatan Inti */}
                <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-200">
                        <div>
                            <label className="block text-sm font-bold text-blue-900">Kegiatan Inti</label>
                            <span className="text-xs text-blue-700">Eksplorasi & Elaborasi (Memahami, Mengaplikasikan, Merefleksi)</span>
                        </div>
                        {formData.alokasiWaktu && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-blue-900">Durasi:</span>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const total = getMinutesFromAlokasi(formData.alokasiWaktu);
                                        const adj = adjustDurations('inti', (formData.kegiatanIntiDurasi || 0) - 5, total, { awal: formData.kegiatanAwalDurasi || 0, inti: formData.kegiatanIntiDurasi || 0, penutup: formData.kegiatanPenutupDurasi || 0 });
                                        setFormData({...formData, kegiatanAwalDurasi: adj.awal, kegiatanIntiDurasi: adj.inti, kegiatanPenutupDurasi: adj.penutup});
                                    }}
                                    className="h-8 px-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 text-blue-800 font-bold text-xs"
                                >
                                    -5m
                                </button>
                                <span className="text-xs font-bold w-12 text-center bg-white py-1 px-2 border border-blue-300 rounded-lg">{formData.kegiatanIntiDurasi} m</span>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const total = getMinutesFromAlokasi(formData.alokasiWaktu);
                                        const adj = adjustDurations('inti', (formData.kegiatanIntiDurasi || 0) + 5, total, { awal: formData.kegiatanAwalDurasi || 0, inti: formData.kegiatanIntiDurasi || 0, penutup: formData.kegiatanPenutupDurasi || 0 });
                                        setFormData({...formData, kegiatanAwalDurasi: adj.awal, kegiatanIntiDurasi: adj.inti, kegiatanPenutupDurasi: adj.penutup});
                                    }}
                                    className="h-8 px-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 text-blue-800 font-bold text-xs"
                                >
                                    +5m
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-4 pl-4 border-l-4 border-blue-100">
                        <div className="text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            ✨ Sintak Model Pembelajaran Aktif: <span className="font-bold">{formData.modelPembelajaran || 'PBL'}</span> (Isi kegiatan murid pada setiap langkah/sintak di bawah ini)
                        </div>
                        {getModelSyntaxes(formData.modelPembelajaran).map((sintak) => {
                            const val = formData.sintakValues?.[sintak.id] || (
                                sintak.id === 'sintak1' ? formData.intiMemahami :
                                sintak.id === 'sintak2' ? formData.intiMengaplikasikan :
                                sintak.id === 'sintak3' ? formData.intiMerefleksi : ''
                            );
                            const isGenerating = loaders[sintak.id];
                            return (
                                <div key={sintak.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-gray-800">{sintak.label}</label>
                                        {generateField && (
                                            <button
                                                type="button"
                                                disabled={isGenerating}
                                                onClick={() => generateField('kegiatanInti', sintak.id)}
                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors disabled:opacity-50"
                                            >
                                                {isGenerating ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                                                {isGenerating ? 'Generating...' : 'Generate AI'}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 italic">{sintak.description}</p>
                                    <textarea 
                                        className="w-full p-3 border border-gray-300 rounded-lg h-28 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value={val} 
                                        onChange={(e) => {
                                            const updated = { ...(formData.sintakValues || {}), [sintak.id]: e.target.value };
                                            let im = formData.intiMemahami;
                                            let imeg = formData.intiMengaplikasikan;
                                            let imer = formData.intiMerefleksi;
                                            if (sintak.id === 'sintak1') im = e.target.value;
                                            if (sintak.id === 'sintak2') imeg = e.target.value;
                                            if (sintak.id === 'sintak3') imer = e.target.value;
                                            setFormData({
                                                ...formData,
                                                sintakValues: updated,
                                                intiMemahami: im,
                                                intiMengaplikasikan: imeg,
                                                intiMerefleksi: imer
                                            });
                                        }} 
                                        placeholder={`Contoh: 1. Murid mengamati masalah...`} 
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Kegiatan Penutup */}
                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-200">
                        <div>
                            <label className="block text-sm font-bold text-green-900">Kegiatan Penutup</label>
                            <span className="text-xs text-green-700">Refleksi, Apresiasi, Tindak Lanjut</span>
                        </div>
                        {formData.alokasiWaktu && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-green-900">Durasi:</span>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const total = getMinutesFromAlokasi(formData.alokasiWaktu);
                                        const adj = adjustDurations('penutup', (formData.kegiatanPenutupDurasi || 0) - 5, total, { awal: formData.kegiatanAwalDurasi || 0, inti: formData.kegiatanIntiDurasi || 0, penutup: formData.kegiatanPenutupDurasi || 0 });
                                        setFormData({...formData, kegiatanAwalDurasi: adj.awal, kegiatanIntiDurasi: adj.inti, kegiatanPenutupDurasi: adj.penutup});
                                    }}
                                    className="h-8 px-2 bg-white border border-green-300 rounded-lg hover:bg-green-100 text-green-800 font-bold text-xs"
                                >
                                    -5m
                                </button>
                                <span className="text-xs font-bold w-12 text-center bg-white py-1 px-2 border border-green-300 rounded-lg">{formData.kegiatanPenutupDurasi} m</span>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const total = getMinutesFromAlokasi(formData.alokasiWaktu);
                                        const adj = adjustDurations('penutup', (formData.kegiatanPenutupDurasi || 0) + 5, total, { awal: formData.kegiatanAwalDurasi || 0, inti: formData.kegiatanIntiDurasi || 0, penutup: formData.kegiatanPenutupDurasi || 0 });
                                        setFormData({...formData, kegiatanAwalDurasi: adj.awal, kegiatanIntiDurasi: adj.inti, kegiatanPenutupDurasi: adj.penutup});
                                    }}
                                    className="h-8 px-2 bg-white border border-green-300 rounded-lg hover:bg-green-100 text-green-800 font-bold text-xs"
                                >
                                    +5m
                                </button>
                            </div>
                        )}
                    </div>
                    <textarea 
                        className="w-full p-3 border border-gray-300 rounded-lg h-40 font-mono text-sm bg-gray-50 text-gray-700" 
                        value={getDefaultKegiatanPenutup(formData.materiPokok)} 
                        readOnly 
                    />
                </div>
            </div>
        </div>
    );
};