import React from 'react';
import { RPMData, LKMData, RubrikData, SoalConfig, dplOptions, getDefaultDurationsForJP } from '../types';
import { A4Page, Button } from './UI';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface PreviewProps {
  formData: RPMData;
  activeDocs: Record<string, boolean>;
  generatedMateriContent: string;
  generatedLKMContent: LKMData | null;
  generatedRubrikContent: RubrikData;
  generatedSoalContent: string;
  soalConfig: SoalConfig;
  setSoalConfig: (c: SoalConfig) => void;
  loaders: Record<string, boolean>;
  onGenerateMateri: () => void;
  onGenerateLKM: () => void;
  onGenerateRubrik: () => void;
  onGenerateSoal: () => void;
  onGenerateBulkRPM: () => void;
  onGenerateBulkLampiran: () => void;
  isGeneratingSoal: boolean;
  isGeneratingBulk: boolean;
}

const HeaderCol = ({ title, rowSpan = 1 }: { title: string; rowSpan?: number }) => (
    <td rowSpan={rowSpan} className="header-col align-middle text-center uppercase tracking-wide border border-black p-2 font-bold break-inside-avoid" style={{ width: '140px', backgroundColor: '#f0f0f0' }}>
        {title}
    </td>
);

const HeaderRPM = ({ data }: { data: RPMData }) => (
    <div className="mb-6 text-center relative font-serif">
        <div className="inline-block mb-4 pb-1 border-b-2 border-black">
            <h1 className="font-bold text-lg uppercase tracking-widest text-black">RENCANA PEMBELAJARAN MENDALAM</h1>
            {data.modelPembelajaran && (
                <div className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider mt-1">
                    {data.modelPembelajaran}
                </div>
            )}
        </div>
        <div className="text-left leading-snug">
        <table className="w-full border-none no-border-table text-inherit">
            <tbody>
                <tr><td className="w-32 align-top font-bold py-0.5 border-none" style={{border: 'none', width: '150px'}}>Nama Sekolah</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.namaSekolah}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>Nama Penyusun</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.namaPenyusun}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>NIP</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.nipPenyusun}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>Mata Pelajaran</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.mataPelajaran}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>Materi Pokok</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.materiPokok}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>Kelas/Semester</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.kelas} / {data.semester}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>Tahun Ajaran</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.tahunPelajaran}</td></tr>
                <tr><td className="align-top font-bold py-0.5 border-none" style={{border: 'none'}}>Alokasi Waktu</td><td className="align-top py-0.5 border-none" style={{border: 'none'}}>: {data.alokasiWaktu}</td></tr>
            </tbody>
        </table>
        </div>
    </div>
);

const getMuridDescription = (kelasStr: string) => {
    const kelas = kelasStr.toLowerCase();
    if (kelas.includes("1") || kelas.includes("2")) return "Murid Fase A (Kelas 1-2). Karakteristik: Berpikir konkret, aktif bergerak, suka bermain sambil belajar. Gaya belajar dominan: Kinestetik & Visual.";
    if (kelas.includes("3") || kelas.includes("4")) return "Murid Fase B (Kelas 3-4). Karakteristik: Mulai berpikir abstrak sederhana. Gaya belajar: Visual, Auditori, Kinestetik.";
    if (kelas.includes("5") || kelas.includes("6")) return "Murid Fase C (Kelas 5-6). Karakteristik: Berpikir kritis, suka tantangan. Gaya belajar variatif.";
    return "Murid dengan karakteristik beragam (Audio, Visual, Kinestetik), minat yang bervariasi.";
};

const renderListFromText = (text: string) => {
    if (!text) return "-";
    let cleanedText = text.replace(/<br\s*\/?>/gi, '\n');
    const lines = cleanedText.split(/\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return "-";
    
    // Always render as ordered list for consistency, stripping any AI generated numbers/bullets
    return (
        <ol className="list-decimal ml-5 space-y-3 text-justify">
           {lines.map((line, idx) => {
               let clean = line.trim();
               
               // Robustly strip any combination of leading list symbols (e.g. *, -, •, +), numbers (e.g. 1., 1)), and bold asterisks (**)
               let lastClean = "";
               while (clean !== lastClean) {
                   lastClean = clean;
                   clean = clean.replace(/^[\*\-\•\+\s]+/, ''); // strip bullets and stars at start
                   clean = clean.replace(/^\d+[\.\)\s]+/, '');   // strip leading numbers with dots/parens
                   clean = clean.replace(/^\*\*+/, '');          // strip starting bold markers if separate
               }
               
               // Normalize bold titles (e.g. if we have "Title:**" instead of "**Title:**")
               if (clean.includes(':**') && !clean.startsWith('**')) {
                   clean = '**' + clean;
               }

               const parts = clean.split(/(\*\*.*?\*\*)/g);
               return (
                   <li key={idx} className="pl-1 leading-relaxed text-black">
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
                            }
                            // Replace any stray remaining single asterisks or double asterisks in non-bold parts
                            const cleanPart = part.replace(/\*\*+/g, '').replace(/\*/g, '');
                            return <span key={j}>{cleanPart}</span>;
                        })}
                   </li>
               )
           })}
        </ol>
    );
};

const renderParagraphs = (text: string) => {
    if (!text) return "-";
    const lines = text.split(/\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return "-";

    return (
        <div className="space-y-1 text-justify">
           {lines.map((line, idx) => {
               const parts = line.split(/(\*\*.*?\*\*)/g);
               return (
                   <div key={idx}>
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
                        })}
                   </div>
               )
           })}
        </div>
    );
};

export const RPMDocument: React.FC<PreviewProps> = ({ 
    formData, activeDocs, generatedMateriContent, 
    generatedLKMContent, generatedRubrikContent, generatedSoalContent,
    soalConfig, setSoalConfig, loaders, 
    onGenerateMateri, onGenerateLKM, onGenerateRubrik, onGenerateSoal, 
    onGenerateBulkRPM, onGenerateBulkLampiran, isGeneratingSoal, isGeneratingBulk
}) => {

    const getAwalMinutes = () => {
        if (formData.kegiatanAwalDurasi) return formData.kegiatanAwalDurasi;
        const defaults = getDefaultDurationsForJP(formData.alokasiWaktu);
        return defaults.awal || 10;
    };
    const getIntiMinutes = () => {
        if (formData.kegiatanIntiDurasi) return formData.kegiatanIntiDurasi;
        const defaults = getDefaultDurationsForJP(formData.alokasiWaktu);
        return defaults.inti || 50;
    };
    const getPenutupMinutes = () => {
        if (formData.kegiatanPenutupDurasi) return formData.kegiatanPenutupDurasi;
        const defaults = getDefaultDurationsForJP(formData.alokasiWaktu);
        return defaults.penutup || 10;
    };

    const DPLSection = () => {
        const rows = [];
        for (let i = 0; i < dplOptions.length; i += 4) {
            rows.push(dplOptions.slice(i, i + 4));
        }

        return (
            <table className="w-full border-none dpl-table text-inherit">
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((opt, colIndex) => (
                                <td key={colIndex} className="border-none p-1" style={{border: 'none'}}>
                                    <div className="flex items-start gap-1">
                                        <span style={{fontFamily: 'DejaVu Sans, sans-serif', fontSize: '12px', lineHeight: '1'}}>
                                            {formData.dpl.includes(opt.label) ? "☑" : "☐"}
                                        </span>
                                        <span className="text-[10px]">{opt.label}</span>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="preview-container">
            <div id="rpm-document" className="print:w-full">
            {activeDocs.rpm && (
            <A4Page teacherName={formData.namaPenyusun} className="rpm-main font-serif text-[11px] leading-snug">
                <HeaderRPM data={formData} />
                
                <div className="mb-6">
                    <table className="w-full border-collapse border border-black shadow-lg text-inherit">
                        <tbody>
                            {/* SECTION 1: IDENTIFIKASI */}
                            <tr className="break-inside-avoid">
                                <HeaderCol title="IDENTIFIKASI" />
                                <td className="p-0 align-top border border-black bg-white">
                                    <table className="w-full border-collapse text-inherit">
                                        <tbody>
                                            <tr className="border-b border-black">
                                                <td className="p-2 w-32 font-bold bg-gray-50 text-gray-700 shadow-inner border-r border-black">Murid</td>
                                                <td className="p-2 text-justify">{getMuridDescription(formData.kelas)}</td>
                                            </tr>
                                            <tr className="border-b border-black">
                                                <td className="p-1.5 font-bold bg-blue-50 text-blue-900 text-center uppercase text-[10px] tracking-wider" colSpan={2}>Dimensi Profil Lulusan</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 bg-white" colSpan={2}>
                                                    <DPLSection />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            
                            {/* SECTION 2: DESIGN PEMBELAJARAN */}
                            <tr className="break-inside-avoid">
                                <HeaderCol title="DESIGN PEMBELAJARAN" />
                                <td className="p-0 align-top border border-black bg-white">
                                    <table className="w-full border-collapse text-inherit">
                                        <tbody>
                                            <tr className="border-b border-black">
                                                <td className="p-2 w-32 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border-r border-black">Capaian Pembelajaran</td>
                                                <td className="p-2 text-justify align-top">{formData.capaianPembelajaran}</td>
                                            </tr>
                                            <tr className="border-b border-black">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border-r border-black">Tujuan Pembelajaran</td>
                                                <td className="p-2 align-top">{renderListFromText(formData.tujuanPembelajaran)}</td>
                                            </tr>
                                            <tr className="border-b border-black">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border-r border-black">Praktik Pedagogis</td>
                                                <td className="p-2 align-top">
                                                    <div className="mb-1 text-gray-800"><strong className="text-blue-900 font-bold">Pendekatan pembelajaran:</strong> {formData.pendekatanPembelajaran || "-"}</div>
                                                    <div className="mb-1 text-gray-800"><strong className="text-blue-900 font-bold">Model pembelajaran:</strong> {formData.modelPembelajaran || "-"}</div>
                                                    <div className="text-gray-800"><strong className="text-blue-900 font-bold">Metode pembelajaran:</strong> {formData.metode || "-"}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border-r border-black">Lintas Disiplin, Mitra, Digital & Lingkungan</td>
                                                <td className="p-2 align-top">
                                                    <div className="mb-1"><strong>Lintas Disiplin:</strong> {formData.lintasDisiplin}</div>
                                                    <div className="mb-1"><strong>Mitra:</strong> {formData.kemitraan}</div>
                                                    <div className="mb-1"><strong>Digital:</strong> {formData.alatDigital}</div>
                                                    <div><strong>Lingkungan:</strong> {formData.lingkunganBelajar}</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {/* SECTION 3: PENGALAMAN PEMBELAJARAN */}
                            <tr>
                                <HeaderCol title="PENGALAMAN PEMBELAJARAN" />
                                <td className="p-0 align-top border border-black bg-white">
                                    <div className="bg-orange-100 p-2 font-bold text-orange-900 pl-4 border-b border-black shadow-inner">Kegiatan Awal (Kesan, Bermakna) - {getAwalMinutes()} Menit</div>
                                    <div className="border-b border-black p-2 bg-white">
                                        {renderListFromText(formData.kegiatanAwal)}
                                    </div>

                                    <div className="bg-orange-100 p-2 font-bold text-orange-900 pl-4 border-b border-black shadow-inner">Kegiatan Inti (Berkesadaran, Bermakna, Menggembirakan) - {getIntiMinutes()} Menit</div>
                                    <table className="w-full border-collapse text-inherit">
                                        <tbody>
                                            <tr className="border-b border-black break-inside-avoid">
                                                <td className="p-2 w-[35%] align-top bg-gray-50 border-r border-black">
                                                    <strong className="text-blue-900">A. Memahami</strong><br/>
                                                    <span className="text-[10px] italic text-gray-500">(Berkesadaran, Bermakna)</span>
                                                </td>
                                                <td className="p-2 align-top text-justify">{renderListFromText(formData.intiMemahami)}</td>
                                            </tr>
                                            <tr className="border-b border-black break-inside-avoid">
                                                <td className="p-2 align-top bg-gray-50 border-r border-black">
                                                    <strong className="text-blue-900">B. Mengaplikasikan</strong><br/>
                                                    <span className="text-[10px] italic text-gray-500">(Bermakna, Mengembirakan)</span>
                                                </td>
                                                <td className="p-2 align-top text-justify">{renderListFromText(formData.intiMengaplikasikan)}</td>
                                            </tr>
                                            <tr className="break-inside-avoid">
                                                <td className="p-2 align-top bg-gray-50 border-r border-black">
                                                    <strong className="text-blue-900">C. Merefleksi</strong><br/>
                                                    <span className="text-[10px] italic text-gray-500">(Berkesadaran, Bermakna)</span>
                                                </td>
                                                <td className="p-2 align-top text-justify">{renderListFromText(formData.intiMerefleksi)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="border-t border-b border-black bg-orange-100 p-2 font-bold text-orange-900 pl-4 shadow-inner">Kegiatan Penutup (Berkesadaran) - {getPenutupMinutes()} Menit</div>
                                    <div className="p-2 bg-white">
                                        {renderListFromText(formData.kegiatanPenutup)}
                                    </div>
                                </td>
                            </tr>

                            {/* SECTION 4: ASESMEN PEMBELAJARAN */}
                            <tr className="break-inside-avoid">
                                <HeaderCol title="ASESMEN PEMBELAJARAN" />
                                <td className="p-0 align-top border border-black bg-white">
                                    <table className="w-full border-collapse h-full text-inherit">
                                        <tbody>
                                            <tr className="border-b border-black">
                                                <td className="p-2 w-32 font-semibold bg-gray-50 text-gray-700 shadow-inner border-r border-black">Asesmen Pada Awal</td>
                                                <td className="p-2">Pertanyaan pemantik lisan, Kuis singkat (Diagnostik Kognitif)</td>
                                            </tr>
                                            <tr className="border-b border-black">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner border-r border-black">Asesmen Pada Proses</td>
                                                <td className="p-2">Observasi Profil Lulusan, Kinerja Kelompok (LKM), Penilaian Antar Teman</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner border-r border-black">Asesmen Pada Akhir</td>
                                                <td className="p-2">Tes Sumatif (Soal Evaluasi), Produk/Karya Murid (Rubrik)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="break-inside-avoid mt-8">
                    <table className="w-full border-none signature-table text-inherit">
                        <tbody>
                            <tr>
                                <td className="w-1/2 text-center border-none align-top" style={{border: 'none'}}>
                                    <p>Mengetahui,<br/>Kepala {formData.namaSekolah}</p>
                                    <div className="h-20"></div>
                                    <p className="font-bold text-black">{formData.namaKepalaSekolah}</p>
                                    <p>NIP. {formData.nipKepalaSekolah}</p>
                                </td>
                                <td className="w-1/2 text-center border-none align-top" style={{border: 'none'}}>
                                    <p>{formData.tempat || "......."}, {formData.tanggal ? new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "......."}<br/>Guru Kelas {formData.kelas}</p>
                                    <div className="h-20"></div>
                                    <p className="font-bold text-black">{formData.namaPenyusun}</p>
                                    <p>NIP. {formData.nipPenyusun}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </A4Page>
            )}

            {activeDocs.paparan && (
                <A4Page teacherName={formData.namaPenyusun} className="font-serif text-[11px] leading-snug">
                    <div className="text-center font-bold text-lg mb-4 border-b-2 border-blue-800 pb-2 text-blue-900 font-sans uppercase">PAPARAN MATERI</div>
                    <div className="border border-gray-300 p-8 min-h-[500px] bg-white shadow-sm rounded-lg text-inherit">
                        <h2 className="text-2xl font-bold text-center mb-6 text-blue-800 uppercase">{formData.materiPokok}</h2>
                        {generatedMateriContent ? (
                            <div dangerouslySetInnerHTML={{__html: generatedMateriContent}} className="prose max-w-none text-justify leading-relaxed text-inherit" />
                        ) : (
                            <div className="prose max-w-none text-justify leading-relaxed">
                                <p className="mb-4">Materi ajar tentang <strong>{formData.materiPokok}</strong> ini disusun untuk membantu murid memahami konsep dasar.</p>
                                <div className="text-gray-400 text-center italic py-8 border border-dashed rounded font-sans">Konten materi belum dibuat.</div>
                            </div>
                        )}
                    </div>
                </A4Page>
            )}

            {activeDocs.lkm && (
                <A4Page teacherName={formData.namaPenyusun} className="font-serif text-[11px] leading-snug">

                    <div className="border-2 border-black p-1 mb-4">
                        <div className="border border-black p-4">
                            <div className="text-center font-bold text-base mb-1 uppercase">LEMBAR KERJA MURID (LKM) KELOMPOK</div>
                            <div className="text-center font-bold text-sm mb-4 uppercase text-gray-600">
                                {generatedLKMContent?.judul_kegiatan || `Eksplorasi ${formData.materiPokok}`}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <table className="w-full border-collapse text-inherit text-[10px]">
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-1 bg-gray-100 font-bold w-32">Mata Pelajaran</td>
                                            <td className="border border-black p-1">{formData.mataPelajaran || "..................."}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 bg-gray-100 font-bold">Kelas/Fase</td>
                                            <td className="border border-black p-1">{formData.kelas || "..................."} / {formData.semester || "..................."}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 bg-gray-100 font-bold">Materi Pembelajaran</td>
                                            <td className="border border-black p-1">{formData.materiPokok || "..................."}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 bg-gray-100 font-bold">Model Pembelajaran</td>
                                            <td className="border border-black p-1 font-bold">{formData.modelPembelajaran || "..................."}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-1 bg-gray-100 font-bold">Alokasi Waktu</td>
                                            <td className="border border-black p-1">{formData.alokasiWaktu || "..................."}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="border border-black text-inherit p-2 flex flex-col justify-between text-[10px]">
                                    <div>
                                        <div className="font-bold border-b border-black pb-1 mb-1 flex justify-between">
                                            <span>Nama Kelompok: ................................</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                            <div>1. ........................................</div>
                                            <div>2. ........................................</div>
                                            <div>3. ........................................</div>
                                            <div>4. ........................................</div>
                                            <div>5. ........................................</div>
                                            <div>6. ........................................</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-inherit space-y-4">
                        {/* B. Petunjuk Kegiatan */}
                        <div className="border border-black p-3 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">B. Petunjuk Kegiatan</div>
                            <ul className="list-disc ml-5 space-y-1 mt-1">
                                {generatedLKMContent?.petunjuk_kegiatan ? (
                                    generatedLKMContent.petunjuk_kegiatan.map((item, i) => <li key={i}>{item}</li>)
                                ) : (
                                    <>
                                        <li>Bentuklah kelompok yang terdiri atas 4-6 murid.</li>
                                        <li>Pahamilah stimulus permasalahan yang disajikan di bawah ini dengan saksama.</li>
                                        <li>Diskusikan setiap orientasi masalah, aktivitas investigasi, dan pertanyaan analisis secara kolaboratif.</li>
                                        <li>Gunakan buku pelajaran, materi ajar, atau sumber digital tepercaya sebagai referensi tambahan.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* C. Stimulus Permasalahan */}
                        <div className="border border-black p-3 relative bg-gray-50/50">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">C. Stimulus Permasalahan</div>
                            <div className="mt-1 text-justify italic leading-relaxed text-[11px] whitespace-pre-wrap">
                                {generatedLKMContent?.stimulus || (
                                    <span className="text-gray-400">Silakan klik tombol "Generate Full Lampiran" di bagian atas untuk memunculkan stimulus pembelajaran yang relevan.</span>
                                )}
                            </div>
                        </div>

                        {/* D. Orientasi Masalah */}
                        <div className="border border-black p-3 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">D. Orientasi Masalah</div>
                            <div className="space-y-3 mt-1">
                                {generatedLKMContent?.orientasi_masalah ? (
                                    generatedLKMContent.orientasi_masalah.map((item, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <p className="font-bold mb-1">{i+1}. {item}</p>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="italic text-gray-400">Belum ada pertanyaan orientasi masalah. Klik "Generate Full Lampiran" di bagian atas.</p>
                                )}
                            </div>
                        </div>

                        {/* E. Kegiatan Investigasi Kelompok */}
                        <div className="border border-black p-3 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">
                                E. Kegiatan Investigasi Kelompok ({formData.modelPembelajaran})
                            </div>
                            <div className="space-y-3 mt-1">
                                {generatedLKMContent?.investigasi_aktivitas ? (
                                    generatedLKMContent.investigasi_aktivitas.map((item, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <p className="font-semibold mb-1">Aktivitas {i+1}: {item}</p>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                        </div>
                                    ))
                                ) : generatedLKMContent?.langkah ? (
                                    generatedLKMContent.langkah.map((item, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <p className="font-semibold mb-1">Langkah {i+1}: {item}</p>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="italic text-gray-400">Belum ada aktivitas investigasi. Klik "Generate Full Lampiran" di bagian atas.</p>
                                )}
                            </div>
                        </div>

                        {/* F. Analisis dan Berpikir Kritis */}
                        <div className="border border-black p-3 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">F. Analisis & Berpikir Kritis</div>
                            <div className="space-y-3 mt-1">
                                {generatedLKMContent?.analisis_berpikir_kritis ? (
                                    generatedLKMContent.analisis_berpikir_kritis.map((item, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <p className="font-bold mb-1">{i+1}. {item}</p>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                        </div>
                                    ))
                                ) : generatedLKMContent?.pertanyaan ? (
                                    generatedLKMContent.pertanyaan.map((item, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <p className="font-bold mb-1">{i+1}. {item}</p>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                            <div className="w-full border-b border-gray-400 border-dotted h-5"></div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="italic text-gray-400">Belum ada pertanyaan analisis berpikir kritis.</p>
                                )}
                            </div>
                        </div>

                        {/* G. Produk atau Hasil Diskusi */}
                        <div className="border border-black p-3 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">G. Produk / Hasil Diskusi Kelompok</div>
                            <div className="mt-1">
                                <p className="font-semibold mb-2">Instruksi Hasil Karya:</p>
                                <p className="text-gray-700 leading-relaxed mb-3">
                                    {generatedLKMContent?.produk_diskusi || "Rancang dan buatlah peta konsep atau diagram ringkas tentang hubungan konsep materi yang sudah Anda diskusikan bersama kelompok pada selembar kertas gambar atau media presentasi kelompok."}
                                </p>
                                <div className="border border-black border-dashed h-24 flex items-center justify-center text-gray-400 text-[10px] uppercase">
                                    Draft / Kolom Sketsa Desain Produk Kelompok
                                </div>
                            </div>
                        </div>

                        {/* H. Presentasi dan Komunikasi */}
                        <div className="border border-black p-3 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">H. Presentasi & Komunikasi</div>
                            <ul className="list-disc ml-5 space-y-1 mt-1">
                                {generatedLKMContent?.panduan_presentasi ? (
                                    generatedLKMContent.panduan_presentasi.map((item, i) => <li key={i}>{item}</li>)
                                ) : (
                                    <>
                                        <li>Presentasikan hasil produk atau kesimpulan kelompok Anda di depan kelas secara santun.</li>
                                        <li>Berikan tanggapan, pertanyaan, atau argumen pendukung yang konstruktif terhadap presentasi kelompok lain.</li>
                                        <li>Lakukan refleksi bersama guru atas jalannya diskusi kelompok hari ini.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* I. Kesimpulan Kelompok */}
                        <div className="border border-black p-3 relative break-inside-avoid">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-900">I. Kesimpulan Kelompok</div>
                            <div className="mt-2 space-y-2">
                                <p className="italic text-gray-500 mb-2">Tuliskan kesimpulan akhir kelompok Anda setelah proses investigasi, diskusi, dan presentasi:</p>
                                <div className="w-full border-b border-black border-dotted h-5"></div>
                                <div className="w-full border-b border-black border-dotted h-5"></div>
                                <div className="w-full border-b border-black border-dotted h-5"></div>
                                <div className="w-full border-b border-black border-dotted h-5"></div>
                            </div>
                        </div>
                    </div>
                </A4Page>
            )}

            {activeDocs.rubrik && (
                <A4Page teacherName={formData.namaPenyusun} className="font-serif text-[11px] leading-snug">
                    <div className="text-center font-bold text-lg mb-4 border-b-2 border-green-600 pb-2 text-green-900 font-sans uppercase">RUBRIK PENILAIAN</div>
                    <div className="mb-6">
                        <h3 className="font-bold text-base mb-2 text-green-800">A. Penilaian Sikap</h3>
                        <table className="w-full border border-gray-800 text-inherit mb-4">
                            <thead className="bg-green-100 text-green-900">
                                <tr>
                                    <th className="border border-gray-800 p-2 w-1/4">Dimensi</th>
                                    <th className="border border-gray-800 p-2">SB (Membudaya)</th>
                                    <th className="border border-gray-800 p-2">B (Berkembang)</th>
                                    <th className="border border-gray-800 p-2">C (Mulai)</th>
                                    <th className="border border-gray-800 p-2">K (Belum)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.dpl.length > 0 ? formData.dpl.map((item, idx) => {
                                    const aiData = Array.isArray(generatedRubrikContent?.sikap) ? generatedRubrikContent.sikap.find(s => s.dpl === item) : null;
                                    return (
                                        <tr key={idx}>
                                            <td className="border border-gray-800 p-2 font-bold">{item}<div className="text-[10px] font-normal italic mt-1 text-gray-600">{aiData?.indikator || `Sikap ${item}`}</div></td>
                                            <td className="border border-gray-800 p-2 text-center">SB</td><td className="border border-gray-800 p-2 text-center">B</td><td className="border border-gray-800 p-2 text-center">C</td><td className="border border-gray-800 p-2 text-center">K</td>
                                        </tr>
                                    )
                                }) : <tr><td colSpan={5} className="border p-2 text-center italic">Pilih DPL di tab Identitas</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-2 text-green-800">B. Penilaian Keterampilan</h3>
                        <table className="w-full border border-gray-800 text-inherit">
                            <thead className="bg-green-100 text-green-900">
                                <tr>
                                    <th className="border border-gray-800 p-2 w-1/4">Aspek</th>
                                    <th className="border border-gray-800 p-2">Sangat Baik</th>
                                    <th className="border border-gray-800 p-2">Baik</th>
                                    <th className="border border-gray-800 p-2">Cukup</th>
                                    <th className="border border-gray-800 p-2">Kurang</th>
                                </tr>
                            </thead>
                            <tbody>
                                 {Array.isArray(generatedRubrikContent?.keterampilan) && generatedRubrikContent.keterampilan.length > 0 ? (
                                    generatedRubrikContent.keterampilan.map((skill, idx) => (
                                        <tr key={idx}>
                                            <td className="border border-gray-800 p-2 font-bold">{skill}</td>
                                            <td className="border border-gray-800 p-2">Sangat menguasai</td><td className="border border-gray-800 p-2">Menguasai</td><td className="border border-gray-800 p-2">Cukup</td><td className="border border-gray-800 p-2">Belum</td>
                                        </tr>
                                    ))
                                 ) : <tr><td colSpan={5} className="border p-2 text-center italic">Belum ada rubrik.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </A4Page>
            )}

            {activeDocs.soal && (
                <div className="print:w-full">
                    <div className="print:hidden mb-4 p-4 bg-gray-100 rounded-lg flex flex-col items-center gap-4">
                        <div className="font-bold text-gray-700 mb-2">Konfigurasi Soal Evaluasi</div>
                        <div className="flex flex-wrap gap-4 items-center justify-center">
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">Pilihan Ganda (HOTS)</label>
                                <input type="number" min="0" max="20" className="p-2 border rounded w-24 text-center" value={soalConfig.pg} onChange={e => setSoalConfig({...soalConfig, pg: parseInt(e.target.value) || 0})} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">Isian Singkat</label>
                                <input type="number" min="0" max="20" className="p-2 border rounded w-24 text-center" value={soalConfig.isian} onChange={e => setSoalConfig({...soalConfig, isian: parseInt(e.target.value) || 0})} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-gray-600 mb-1">Uraian</label>
                                <input type="number" min="0" max="10" className="p-2 border rounded w-24 text-center" value={soalConfig.uraian} onChange={e => setSoalConfig({...soalConfig, uraian: parseInt(e.target.value) || 0})} />
                            </div>
                        </div>
                        <Button onClick={onGenerateSoal} variant="magic" isLoading={isGeneratingSoal} icon={Sparkles}>Generate Soal Evaluasi</Button>
                    </div>
                    <A4Page teacherName={formData.namaPenyusun} className="font-serif text-[11px] leading-snug">
                        <div className="text-center font-bold text-lg mb-4 border-b-2 border-red-600 pb-2 text-red-900 uppercase font-sans">ASESMEN SUMATIF (SOAL EVALUASI)</div>
                        
                        <div className="mb-6 text-inherit">
                             <table className="w-full">
                                <tbody>
                                    <tr><td className="font-bold w-24">Nama</td><td>: ............................................</td><td className="font-bold w-24 text-right">Nilai</td><td className="w-24 border border-black h-10"></td></tr>
                                    <tr><td className="font-bold">No. Absen</td><td>: ............................................</td></tr>
                                </tbody>
                             </table>
                        </div>

                        <div className="p-6 border border-gray-300 rounded min-h-[600px] bg-white text-inherit">
                            {generatedSoalContent ? (
                                <div dangerouslySetInnerHTML={{__html: generatedSoalContent}} className="prose max-w-none text-inherit leading-relaxed generated-questions-list" />
                            ) : <div className="text-gray-400 italic text-center py-20 border border-dashed rounded font-sans">Soal belum dibuat. Sesuaikan konfigurasi dan klik tombol Generate di atas.</div>}
                        </div>
                    </A4Page>
                </div>
            )}
        </div>
    </div>
    );
};