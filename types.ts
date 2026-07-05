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
  materiContent?: string;
  lkmContent?: any;
  rubrikContent?: any;
  soalContent?: string;
}

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