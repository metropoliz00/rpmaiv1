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
}

export interface RubrikData {
  sikap: Array<{ dpl: string; indikator: string }>;
  keterampilan: string[];
}

export interface LKMData {
  judul_kegiatan: string;
  tujuan_kegiatan: string;
  alat_bahan: string;
  langkah: string[];
  pertanyaan: string[];
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
  tempat: '',
  tanggal: '',
  namaKepalaSekolah: '',
  nipKepalaSekolah: '',
  dpl: [],
  kegiatanAwal: '',
  intiMemahami: '',
  intiMengaplikasikan: '',
  intiMerefleksi: '',
  kegiatanPenutup: ''
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