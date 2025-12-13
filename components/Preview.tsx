import React from 'react';
import { RPMData, LKMData, RubrikData, SoalConfig, dplOptions } from '../types';
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
  isGeneratingSoal: boolean;
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
    const lines = text.split(/\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return "-";
    
    // Always render as ordered list for consistency, stripping any AI generated numbers/bullets
    return (
        <ol className="list-decimal ml-5 space-y-1 text-justify">
           {lines.map((line, idx) => {
               // Remove potential existing numbering (1., 1), etc) or bullets (- , *)
               // Matches: starts with digit(s) followed by dot or paren, OR starts with hyphen/bullet/asterisk
               const clean = line.replace(/^(\d+[\.\)]|[\-\•\*])\s*/, '');
               const parts = clean.split(/(\*\*.*?\*\*)/g);
               return (
                   <li key={idx} className="pl-1">
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part}</span>;
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
    onGenerateMateri, onGenerateLKM, onGenerateRubrik, onGenerateSoal, isGeneratingSoal
}) => {

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
        <div id="rpm-document" className="print:w-full">
            {activeDocs.rpm && (
            <A4Page className="rpm-main font-serif text-[11px] leading-snug">
                <HeaderRPM data={formData} />
                
                <div className="mb-6 break-inside-avoid">
                    <table className="w-full border-collapse shadow-lg mb-6 text-inherit">
                        <tbody>
                            <tr>
                                <HeaderCol title="IDENTIFIKASI" />
                                <td className="p-0 align-top border border-gray-300 bg-white">
                                    <table className="w-full border-collapse text-inherit">
                                        <tbody>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 w-32 font-bold bg-gray-50 text-gray-700 shadow-inner border border-black">Murid</td>
                                                <td className="p-2 text-justify border border-black">{getMuridDescription(formData.kelas)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-1.5 font-bold bg-blue-50 text-blue-900 text-center uppercase text-[10px] tracking-wider border border-black" colSpan={2}>Dimensi Profil Lulusan</td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 bg-white border border-black" colSpan={2}>
                                                    <DPLSection />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            
                            <tr>
                                <HeaderCol title="DESIGN PEMBELAJARAN" />
                                <td className="p-0 align-top border border-gray-300 bg-white">
                                    <table className="w-full border-collapse text-inherit">
                                        <tbody>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 w-32 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border border-black">Capaian Pembelajaran</td>
                                                <td className="p-2 text-justify align-top border border-black">{formData.capaianPembelajaran}</td>
                                            </tr>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border border-black">Tujuan Pembelajaran</td>
                                                <td className="p-2 align-top border border-black">{renderListFromText(formData.tujuanPembelajaran)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border border-black">Praktik Pedagogis</td>
                                                <td className="p-2 align-top border border-black">
                                                    <div className="font-bold text-blue-800 mb-1">{formData.modelPembelajaran}</div>
                                                    <div className="text-gray-600 italic">{formData.metode}</div>
                                                </td>
                                            </tr>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner align-top border border-black">Lintas Disiplin, Mitra, Digital & Lingkungan</td>
                                                <td className="p-2 align-top border border-black">
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
                        </tbody>
                    </table>
                </div>

                <div className="mb-6 break-inside-avoid">
                    <table className="w-full border-collapse shadow-lg mb-6 text-inherit">
                        <tbody>
                            <tr>
                                <HeaderCol title="PENGALAMAN PEMBELAJARAN" />
                                <td className="p-0 align-top border border-gray-300 bg-white">
                                    <div className="bg-orange-100 p-2 font-bold text-orange-900 pl-4 border-b border-orange-200 shadow-inner border border-black">Kegiatan Awal (Kesan, Bermakna)</div>
                                    <div className="border-b border-gray-200 p-2 bg-white border border-black">
                                        {renderListFromText(formData.kegiatanAwal)}
                                    </div>

                                    <div className="bg-orange-100 p-2 font-bold text-orange-900 pl-4 border-b border-orange-200 shadow-inner border border-black">Kegiatan Inti (Berkesadaran, Bermakna, Menggembirakan)</div>
                                    <table className="w-full border-collapse text-inherit">
                                        <tbody>
                                            <tr className="border-b border-gray-100">
                                                <td className="p-2 w-[35%] align-top bg-gray-50 border-r border-gray-200 border border-black">
                                                    <strong className="text-blue-900">A. Memahami</strong><br/>
                                                    <span className="text-[10px] italic text-gray-500">(Berkesadaran, Bermakna)</span>
                                                </td>
                                                <td className="p-2 align-top text-justify border border-black">{renderParagraphs(formData.intiMemahami)}</td>
                                            </tr>
                                            <tr className="border-b border-gray-100">
                                                <td className="p-2 align-top bg-gray-50 border-r border-gray-200 border border-black">
                                                    <strong className="text-blue-900">B. Mengaplikasikan</strong><br/>
                                                    <span className="text-[10px] italic text-gray-500">(Bermakna, Mengembirakan)</span>
                                                </td>
                                                <td className="p-2 align-top text-justify border border-black">{renderParagraphs(formData.intiMengaplikasikan)}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 align-top bg-gray-50 border-r border-gray-200 border border-black">
                                                    <strong className="text-blue-900">C. Merefleksi</strong><br/>
                                                    <span className="text-[10px] italic text-gray-500">(Berkesadaran, Bermakna)</span>
                                                </td>
                                                <td className="p-2 align-top text-justify border border-black">{renderParagraphs(formData.intiMerefleksi)}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="border-t border-b border-orange-200 bg-orange-100 p-2 font-bold text-orange-900 pl-4 shadow-inner border border-black">Kegiatan Penutup (Berkesadaran)</div>
                                    <div className="p-2 bg-white border border-black">
                                        {renderListFromText(formData.kegiatanPenutup)}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mb-6 break-inside-avoid">
                    <table className="w-full border-collapse shadow-lg mb-6 text-inherit">
                        <tbody>
                            <tr>
                                <HeaderCol title="ASESMEN PEMBELAJARAN" />
                                <td className="p-0 align-top border border-gray-300 bg-white">
                                    <table className="w-full border-collapse h-full text-inherit">
                                        <tbody>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 w-32 font-semibold bg-gray-50 text-gray-700 shadow-inner border border-black">Asesmen Pada Awal</td>
                                                <td className="p-2 border border-black">Pertanyaan pemantik lisan, Kuis singkat (Diagnostik Kognitif)</td>
                                            </tr>
                                            <tr className="border-b border-gray-200">
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner border border-black">Asesmen Pada Proses</td>
                                                <td className="p-2 border border-black">Observasi Profil Lulusan, Kinerja Kelompok (LKM), Penilaian Antar Teman</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-semibold bg-gray-50 text-gray-700 shadow-inner border border-black">Asesmen Pada Akhir</td>
                                                <td className="p-2 border border-black">Tes Sumatif (Soal Evaluasi), Produk/Karya Murid (Rubrik)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="w-full mt-12 border-none signature-table text-inherit">
                        <tbody>
                            <tr>
                                <td className="w-1/2 text-center border-none align-top" style={{border: 'none'}}>
                                    <p>Mengetahui,<br/>Kepala {formData.namaSekolah}</p>
                                    <div className="h-24"></div>
                                    <p className="font-bold underline text-black">{formData.namaKepalaSekolah}</p>
                                    <p>NIP. {formData.nipKepalaSekolah}</p>
                                </td>
                                <td className="w-1/2 text-center border-none align-top" style={{border: 'none'}}>
                                    <p>{formData.tempat || "......."}, {formData.tanggal ? new Date(formData.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "......."}<br/>Guru Kelas {formData.kelas}</p>
                                    <div className="h-24"></div>
                                    <p className="font-bold underline text-black">{formData.namaPenyusun}</p>
                                    <p>NIP. {formData.nipPenyusun}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </A4Page>
            )}

            {activeDocs.paparan && (
                <A4Page className="print-break-before font-serif text-[11px] leading-snug">
                    <div className="text-center font-bold text-lg mb-4 border-b-2 border-blue-800 pb-2 text-blue-900 font-sans">LAMPIRAN: PAPARAN MATERI</div>
                    <div className="print:hidden mb-4 text-center">
                        <Button onClick={onGenerateMateri} variant="magic" isLoading={loaders['materi']} icon={Sparkles}>Generate Materi Ajar</Button>
                    </div>
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
                <A4Page className="print-break-before font-serif text-[11px] leading-snug">
                    <div className="print:hidden mb-4 text-center">
                        <Button onClick={onGenerateLKM} variant="magic" isLoading={loaders['lkm']} icon={Sparkles}>Generate LKM dengan AI</Button>
                    </div>

                    <div className="border-2 border-black p-1 mb-4">
                        <div className="border border-black p-4">
                            <div className="text-center font-bold text-lg mb-1 uppercase">LEMBAR KERJA MURID (LKM)</div>
                            <div className="text-center font-bold text-base mb-4 uppercase text-gray-600">{generatedLKMContent?.judul_kegiatan || formData.materiPokok}</div>
                            
                            <table className="w-full border-collapse text-inherit">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-1 bg-gray-100 font-bold w-32">Mata Pelajaran</td>
                                        <td className="border border-black p-1">{formData.mataPelajaran}</td>
                                        <td className="border border-black p-1 bg-gray-100 font-bold w-24">Kelas/Sem</td>
                                        <td className="border border-black p-1">{formData.kelas} / {formData.semester}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-1 bg-gray-100 font-bold">Materi Pokok</td>
                                        <td className="border border-black p-1">{formData.materiPokok}</td>
                                        <td className="border border-black p-1 bg-gray-100 font-bold">Waktu</td>
                                        <td className="border border-black p-1">{formData.alokasiWaktu}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div className="mt-2 border border-black text-inherit">
                                <div className="bg-gray-100 p-1 font-bold border-b border-black">Anggota Kelompok:</div>
                                <div className="p-2 grid grid-cols-2 gap-x-4 gap-y-2">
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

                    <div className="text-inherit space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-black p-3 relative">
                                <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-800">A. Tujuan Kegiatan</div>
                                <p>{generatedLKMContent?.tujuan_kegiatan || "..."}</p>
                            </div>
                            <div className="border border-black p-3 relative">
                                <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-800">B. Alat & Bahan</div>
                                <p>{generatedLKMContent?.alat_bahan || "..."}</p>
                            </div>
                        </div>

                        <div className="border border-black p-4 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-800">C. Langkah Kerja</div>
                            {generatedLKMContent?.langkah ? (
                                <ol className="list-decimal ml-5 space-y-1">
                                    {generatedLKMContent.langkah.map((l, i) => <li key={i}>{l}</li>)}
                                </ol>
                            ) : <p className="italic text-gray-400">Belum ada data langkah kerja.</p>}
                        </div>

                        <div className="border border-black p-4 relative">
                            <div className="absolute -top-2 left-2 bg-white px-1 font-bold text-blue-800">D. Hasil Diskusi</div>
                            {generatedLKMContent?.pertanyaan ? (
                                <div className="space-y-4 mt-2">
                                    {generatedLKMContent.pertanyaan.map((q, i) => (
                                        <div key={i} className="break-inside-avoid">
                                            <p className="font-bold mb-1">{i+1}. {q}</p>
                                            <div className="w-full border-b border-black border-dotted h-6"></div>
                                            <div className="w-full border-b border-black border-dotted h-6"></div>
                                            <div className="w-full border-b border-black border-dotted h-6"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="italic text-gray-400">Belum ada pertanyaan.</p>}
                        </div>
                    </div>
                </A4Page>
            )}

            {activeDocs.rubrik && (
                <A4Page className="print-break-before font-serif text-[11px] leading-snug">
                    <div className="print:hidden mb-4 text-center">
                        <Button onClick={onGenerateRubrik} variant="magic" isLoading={loaders['rubrik']} icon={Sparkles}>Generate Rubrik AI</Button>
                    </div>
                    <div className="text-center font-bold text-lg mb-4 border-b-2 border-green-600 pb-2 text-green-900 font-sans">RUBRIK PENILAIAN</div>
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
                <A4Page className="print-break-before font-serif text-[11px] leading-snug">
                     <div className="print:hidden mb-4 p-4 bg-blue-50 rounded border border-blue-200 font-sans">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-blue-900">Konfigurasi Soal</span>
                            <Button onClick={onGenerateSoal} variant="magic" isLoading={isGeneratingSoal} icon={BrainCircuit} size="sm">Buat Soal</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>PG: <input type="number" className="w-12 border rounded p-1" value={soalConfig.pg} onChange={e=>setSoalConfig({...soalConfig, pg: parseInt(e.target.value) || 0})}/></div>
                            <div>Isian: <input type="number" className="w-12 border rounded p-1" value={soalConfig.isian} onChange={e=>setSoalConfig({...soalConfig, isian: parseInt(e.target.value) || 0})}/></div>
                            <div>Uraian: <input type="number" className="w-12 border rounded p-1" value={soalConfig.uraian} onChange={e=>setSoalConfig({...soalConfig, uraian: parseInt(e.target.value) || 0})}/></div>
                        </div>
                    </div>

                    <div className="text-center font-bold text-lg mb-4 border-b-2 border-red-600 pb-2 text-red-900 uppercase font-sans">ASESMEN SUMATIF</div>
                    
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
                            <div dangerouslySetInnerHTML={{__html: generatedSoalContent}} className="prose max-w-none text-inherit leading-relaxed" />
                        ) : <div className="text-gray-400 italic text-center py-20 border border-dashed rounded font-sans">Soal belum dibuat. Klik tombol Generate di atas.</div>}
                    </div>
                </A4Page>
            )}
        </div>
    );
};