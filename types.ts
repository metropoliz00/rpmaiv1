export interface RPMData {
  namaSekolah: string;
  namaPenyusun: string;
  nipPenyusun: string;
  mataPelajaran: string;
  materiPokok: string;
  kelas: string;
  semester: string;
  alokasiWaktu: string;
  tahunPelajaran: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  modelPembelajaran: string;
  metode: string;
  alatDigital: string;
  lintasDisiplin: string;
  kemitraan: string;
  lingkunganBelajar: string;
  pendekatanPembelajaran: string;
  tempat: string;
  tanggal: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  dpl: string[];
  kegiatanAwal: string;
  intiMemahami: string;
  intiMengaplikasikan: string;
  intiMerefleksi: string;
  kegiatanPenutup: string;
  kegiatanAwalDurasi: number;
  kegiatanIntiDurasi: number;
  kegiatanPenutupDurasi: number;
  sintakValues?: Record<string, string>;
  materiContent?: string;
  lkmContent?: any;
  rubrikContent?: any;
  soalContent?: string;
}

export interface SintakDef {
  id: string;
  label: string;
  description: string;
}

export const getModelSyntaxes = (model: string): SintakDef[] => {
  const m = (model || '').toLowerCase();
  if (m.includes('project') || m.includes('pjbl')) {
    return [
      { id: 'sintak1', label: '1. Pertanyaan Mendasar (Start with Essential Question)', description: 'Murid dihadapkan pada pertanyaan atau masalah esensial terkait proyek.' },
      { id: 'sintak2', label: '2. Menyusun Perencanaan Proyek (Design Plan)', description: 'Murid menyusun rencana pembuatan proyek, aturan, dan pemilihan aktivitas.' },
      { id: 'sintak3', label: '3. Menyusun Jadwal (Create Schedule)', description: 'Murid bersama guru menyusun jadwal penyelesaian proyek.' },
      { id: 'sintak4', label: '4. Memonitor Kemajuan Proyek (Monitor Progress)', description: 'Murid melaksanakan proyek dengan bimbingan dan monitoring guru.' },
      { id: 'sintak5', label: '5. Menguji Hasil (Assess Outcome)', description: 'Murid mempresentasikan atau menguji produk/hasil proyek.' },
      { id: 'sintak6', label: '6. Evaluasi Pengalaman (Evaluate Experience)', description: 'Murid melakukan refleksi dan evaluasi terhadap proses dan hasil proyek.' }
    ];
  } else if (m.includes('discovery')) {
    return [
      { id: 'sintak1', label: '1. Stimulasi / Pemberian Rangsangan (Stimulation)', description: 'Murid mengamati fenomena, membaca bahan bacaan, atau diberi pertanyaan pancingan.' },
      { id: 'sintak2', label: '2. Identifikasi Masalah (Problem Statement)', description: 'Murid merumuskan pertanyaan/hipotesis sementara terhadap masalah.' },
      { id: 'sintak3', label: '3. Pengumpulan Data (Data Collection)', description: 'Murid mengumpulkan informasi melalui eksperimen, literatur, atau observasi.' },
      { id: 'sintak4', label: '4. Pengolahan Data (Data Processing)', description: 'Murid mengolah, mengelompokkan, dan menganalisis data hasil temuan.' },
      { id: 'sintak5', label: '5. Pembuktian (Verification)', description: 'Murid membuktikan hipotesis dengan temuan data dan teori.' },
      { id: 'sintak6', label: '6. Menarik Kesimpulan (Generalization)', description: 'Murid merumuskan kesimpulan prinsip/konsep umum.' }
    ];
  } else if (m.includes('inquiry')) {
    return [
      { id: 'sintak1', label: '1. Orientasi & Perumusan Masalah', description: 'Murid mengamati situasi dan merumuskan pertanyaan penyelidikan.' },
      { id: 'sintak2', label: '2. Merumuskan Hipotesis', description: 'Murid menyusun dugaan atau jawaban sementara.' },
      { id: 'sintak3', label: '3. Mengumpulkan Data', description: 'Murid mencari data dan bukti melalui observasi atau eksperimen.' },
      { id: 'sintak4', label: '4. Menguji Hipotesis', description: 'Murid menganalisis data untuk menguji kebenaran hipotesis.' },
      { id: 'sintak5', label: '5. Merumuskan Kesimpulan', description: 'Murid menyimpulkan hasil penemuan penyelidikan.' }
    ];
  } else if (m.includes('cooperative')) {
    return [
      { id: 'sintak1', label: '1. Penyampaian Tujuan & Motivasi', description: 'Murid memahami tujuan pembelajaran dan termotivasi.' },
      { id: 'sintak2', label: '2. Penyajian Informasi', description: 'Murid menyimak paparan materi dasar dari guru/sumber.' },
      { id: 'sintak3', label: '3. Pengorganisasian Kelompok Belajar', description: 'Murid bergabung dalam kelompok heterogen untuk berkolaborasi.' },
      { id: 'sintak4', label: '4. Membimbing Kelompok Bekerja', description: 'Murid berdiskusi dan menyelesaikan tugas kelompok dengan bimbingan.' },
      { id: 'sintak5', label: '5. Evaluasi & Presentasi', description: 'Murid mempresentasikan hasil kerja kelompok dan dievaluasi.' },
      { id: 'sintak6', label: '6. Penghargaan Kelompok', description: 'Murid menerima apresiasi atas kinerja kelompok.' }
    ];
  } else if (m.includes('pbl') || m.includes('problem based')) {
    return [
      { id: 'sintak1', label: '1. Orientasi Peserta Didik pada Masalah', description: 'Murid mengamati masalah nyata atau studi kasus yang disajikan.' },
      { id: 'sintak2', label: '2. Mengorganisasikan Peserta Didik untuk Belajar', description: 'Murid mendefinisikan tugas belajar dan membentuk kelompok.' },
      { id: 'sintak3', label: '3. Membimbing Penyelidikan Individu / Kelompok', description: 'Murid mengumpulkan informasi dan melakukan investigasi/eksperimen.' },
      { id: 'sintak4', label: '4. Mengembangkan dan Menyajikan Hasil Karya', description: 'Murid menyusun laporan/produk dan mempresentasikannya.' },
      { id: 'sintak5', label: '5. Menganalisis & Mengevaluasi Proses Pemecahan Masalah', description: 'Murid merefleksi dan mengevaluasi hasil pemecahan masalah.' }
    ];
  } else if (m && m !== 'lainnya') {
    // Custom / Lainnya model specified by user
    const customName = model.trim();
    return [
      { id: 'sintak1', label: `1. Orientasi & Pengenalan (${customName})`, description: `Murid memahami konsep dasar dan orientasi awal dalam model ${customName}.` },
      { id: 'sintak2', label: `2. Eksplorasi & Pengumpulan Informasi (${customName})`, description: `Murid menggali informasi dan mengumpulkan data terkait topik ${customName}.` },
      { id: 'sintak3', label: `3. Elaborasi & Kolaborasi / Praktik (${customName})`, description: `Murid berkolaborasi, mendiskusikan, atau melakukan praktik sesuai langkah ${customName}.` },
      { id: 'sintak4', label: `4. Konfirmasi & Presentasi Hasil (${customName})`, description: `Murid menyajikan hasil kerja dan mendapatkan konfirmasi/umpan balik.` },
      { id: 'sintak5', label: `5. Refleksi & Kesimpulan (${customName})`, description: `Murid melakukan refleksi dan menyimpulkan pembelajaran yang diperoleh.` }
    ];
  } else {
    // Default / Empty
    return [
      { id: 'sintak1', label: '1. Orientasi Peserta Didik pada Masalah', description: 'Murid mengamati masalah nyata atau studi kasus yang disajikan.' },
      { id: 'sintak2', label: '2. Mengorganisasikan Peserta Didik untuk Belajar', description: 'Murid mendefinisikan tugas belajar dan membentuk kelompok.' },
      { id: 'sintak3', label: '3. Membimbing Penyelidikan Individu / Kelompok', description: 'Murid mengumpulkan informasi dan melakukan investigasi/eksperimen.' },
      { id: 'sintak4', label: '4. Mengembangkan dan Menyajikan Hasil Karya', description: 'Murid menyusun laporan/produk dan mempresentasikannya.' },
      { id: 'sintak5', label: '5. Menganalisis & Mengevaluasi Proses Pemecahan Masalah', description: 'Murid merefleksi dan mengevaluasi hasil pemecahan masalah.' }
    ];
  }
};

export const getMinutesFromAlokasi = (alokasi: string): number => {
  if (!alokasi) return 0;
  const jpMatch = alokasi.match(/(\d+)\s*JP/i);
  if (jpMatch) {
    const jpCount = parseInt(jpMatch[1], 10);
    return jpCount * 35;
  }
  return 0;
};

export const getDefaultDurationsForJP = (alokasi: string) => {
  const total = getMinutesFromAlokasi(alokasi);
  if (total <= 0) return { awal: 0, inti: 0, penutup: 0 };
  
  if (total === 35) return { awal: 5, inti: 25, penutup: 5 };
  if (total === 70) return { awal: 10, inti: 50, penutup: 10 };
  if (total === 105) return { awal: 15, inti: 75, penutup: 15 };
  if (total === 140) return { awal: 20, inti: 100, penutup: 20 };
  if (total === 175) return { awal: 25, inti: 125, penutup: 25 };
  if (total === 210) return { awal: 30, inti: 150, penutup: 30 };
  
  const awal = Math.round((total * 0.15) / 5) * 5 || 5;
  const penutup = Math.round((total * 0.15) / 5) * 5 || 5;
  const inti = total - awal - penutup;
  return { awal, inti, penutup };
};

export const adjustDurations = (
  changedField: 'awal' | 'inti' | 'penutup',
  newValue: number,
  total: number,
  current: { awal: number; inti: number; penutup: number }
) => {
  let { awal, inti, penutup } = { ...current };
  newValue = Math.max(0, Math.min(total, newValue));

  if (changedField === 'awal') {
    awal = newValue;
    inti = total - awal - penutup;
    if (inti < 0) {
      inti = 0;
      penutup = total - awal;
    }
  } else if (changedField === 'penutup') {
    penutup = newValue;
    inti = total - awal - penutup;
    if (inti < 0) {
      inti = 0;
      awal = total - penutup;
    }
  } else if (changedField === 'inti') {
    inti = newValue;
    const remaining = total - inti;
    awal = Math.round(remaining / 2);
    penutup = remaining - awal;
  }

  return { awal, inti, penutup };
};

export interface RubrikData {
  sikap: Array<{ dpl: string; indikator: string }>;
  keterampilan: string[];
}

export interface LKMData {
  judul_kegiatan: string;
  tujuan_kegiatan: string;
  alat_bahan: string;
  langkah?: string[];
  pertanyaan?: string[];
  petunjuk_kegiatan?: string[];
  stimulus?: string;
  orientasi_masalah?: string[];
  investigasi_aktivitas?: string[];
  analisis_berpikir_kritis?: string[];
  produk_diskusi?: string;
  panduan_presentasi?: string[];
}

export interface SoalConfig {
  pg: number;
  isian: number;
  uraian: number;
}

export const initialFormData: RPMData = {
  namaSekolah: '',
  namaPenyusun: '',
  nipPenyusun: '',
  mataPelajaran: '',
  materiPokok: '',
  kelas: '',
  semester: '1 (Ganjil)',
  alokasiWaktu: '',
  tahunPelajaran: '',
  capaianPembelajaran: '',
  tujuanPembelajaran: '',
  modelPembelajaran: 'Problem Based Learning (PBL)',
  metode: '',
  alatDigital: '',
  lintasDisiplin: '',
  kemitraan: '',
  lingkunganBelajar: '',
  pendekatanPembelajaran: '',
  tempat: '',
  tanggal: '',
  namaKepalaSekolah: '',
  nipKepalaSekolah: '',
  dpl: [],
  kegiatanAwal: '',
  intiMemahami: '',
  intiMengaplikasikan: '',
  intiMerefleksi: '',
  kegiatanPenutup: '',
  kegiatanAwalDurasi: 0,
  kegiatanIntiDurasi: 0,
  kegiatanPenutupDurasi: 0
};

export const dplOptions = [
  { label: "Keimanan dan Ketakwaan terhadap Tuhan YME", color: "bg-green-100 text-green-800" },
  { label: "Kewargaan", color: "bg-blue-100 text-blue-800" },
  { label: "Penalaran Kritis", color: "bg-yellow-100 text-yellow-800" },
  { label: "Kreativitas", color: "bg-pink-100 text-pink-800" },
  { label: "Kolaborasi", color: "bg-orange-100 text-orange-800" },
  { label: "Kemandirian", color: "bg-purple-100 text-purple-800" },
  { label: "Kesehatan", color: "bg-teal-100 text-teal-800" },
  { label: "Komunikasi", color: "bg-indigo-100 text-indigo-800" }
];