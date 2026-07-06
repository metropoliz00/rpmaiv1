export const getCPBySubjectAndClass = (subject: string, kelas: string): string => {
  const s = subject.trim();
  const k = kelas.trim();
  
  let fase = '';
  if (k === 'I' || k === 'II' || k === '1' || k === '2') {
    fase = 'A';
  } else if (k === 'III' || k === 'IV' || k === '3' || k === '4') {
    fase = 'B';
  } else if (k === 'V' || k === 'VI' || k === '5' || k === '6') {
    fase = 'C';
  }

  if (!fase) return '';

  if (s === 'Pendidikan Agama Islam') {
    if (fase === 'A') {
      return `Pada akhir Fase A, murid memiliki kemampuan sebagai berikut:
1.1. Al-Qur'an Hadis: Membaca dan membedakan huruf hijaiah berharakat, huruf hijaiah bersambung; menghafal Surah al-Fatihah, beberapa surah pendek Al-Qur'an, dan hadis tentang kebersihan.
1.2. Akidah: Menjelaskan dan meyakini rukun iman, iman kepada Allah Swt., beberapa asmaulhusna, dan iman kepada malaikat.
1.3. Akhlak: Menerapkan akhlak terhadap Allah Swt. dengan menyucikan dan memuji-Nya, dan akhlak terhadap diri sendiri.
1.4. Fikih: Menerapkan rukun Islam, syahadatain, tata cara bersuci, salat fardu, zikir dan berdoa setelah salat.
1.5. Sejarah Peradaban Islam: Menceritakan kisah keteladanan beberapa nabi dan rasul.`;
    } else if (fase === 'B') {
      return `Pada akhir Fase B, murid memiliki kemampuan sebagai berikut:
2.1. Al-Qur'an Hadis: Membaca, menulis, dan membedakan huruf hijaiah bersambung; menghafal dan menjelaskan beberapa surah pendek, hadis tentang kewajiban salat dan menjaga hubungan baik dengan sesama.
2.2. Akidah: Menjelaskan dan meyakini sifat-sifat Allah Swt., iman kepada kitab-kitab Allah Swt., beberapa asmaulhusna, dan iman kepada rasul-rasul Allah Swt.
2.3. Akhlak: Menerapkan akhlak terhadap Allah Swt. dengan berbaik sangka kepada-Nya, akhlak terhadap orang tua, keluarga, dan guru.
2.4. Fikih: Menerapkan azan dan ikamah, salat jumat dan salat sunah; menjelaskan balig dan tanggung jawab yang menyertainya (taklif).
2.5. Sejarah Peradaban Islam: Menceritakan dan menjelaskan kisah Nabi Muhammad saw. sebelum dan sesudah menjadi rasul periode Makkah.`;
    } else if (fase === 'C') {
      return `Pada akhir Fase C, murid memiliki kemampuan sebagai berikut:
3.1. Al-Qur'an Hadis: Membaca, menulis, dan membedakan huruf hijaiah bersambung; menjelaskan beberapa surah pendek dan hadis tentang berbuat baik kepada orang tua, guru, dan teman.
3.2. Akidah: Menjelaskan dan meyakini beberapa asmaulhusna, iman kepada hari akhir, iman kepada qada' dan qadar.
3.3. Akhlak: Menerapkan akhlak terhadap Allah Swt. dengan berdoa dan bertawakal kepada-Nya, akhlak terhadap teman, tetangga, non-muslim, hewan, dan tumbuhan.
3.4. Fikih: Menerapkan puasa wajib dan sunah, makanan minuman yang halal dan haram, zakat, infak, sedekah, dan wakaf.
3.5. Sejarah Peradaban Islam: Menceritakan dan menjelaskan kisah Nabi Muhammad saw. periode Madinah dan khulafaurasyidin.`;
    }
  }

  if (s === 'PJOK') {
    if (fase === 'A') {
      return `Capaian Pembelajaran (CP) PJOK pada FASE A (Kelas 1-2):
1.1 Terampil Bergerak: Mempraktikkan keterampilan gerak fundamental dan menerapkannya dalam berbagai situasi gerak yang berbeda; mengeksplorasi berbagai strategi gerak; dan mengeksplorasi berbagai konsep gerak serta menyimpulkan efektivitasnya.
1.2 Belajar Melalui Gerak: Menaati peraturan untuk menumbuhkan fair play di dalam berbagai aktivitas jasmani; menerapkan strategi kolaborasi ketika berpartisipasi dalam aktivitas jasmani.
1.3 Bergaya Hidup Aktif: Berpartisipasi di dalam berbagai aktivitas jasmani dan mengidentifikasi manfaatnya.
1.4 Memilih Hidup yang menyehatkan: Mengenali gaya hidup aktif dan sehat; mengenali manfaat komponen makanan bergizi seimbang; serta mengenali situasi dan potensi yang berisiko terhadap kesehatan dan keselamatan serta strategi mencari bantuan kepada orang dewasa terpercaya.`;
    } else if (fase === 'B') {
      return `Capaian Pembelajaran (CP) PJOK pada FASE B (Kelas 3-4):
2.1 Terampil Bergerak: Menghaluskan keterampilan gerak fundamental dan menerapkannya dalam situasi gerak yang baru; menyesuaikan strategi gerak untuk mendapatkan capaian keterampilan gerak; dan memperagakan berbagai konsep gerak yang dapat diterapkan dalam rangkaian gerak.
2.2 Belajar Melalui Gerak: Menerapkan strategi gerak sederhana dan memecahkan masalah gerak; menerapkan peraturan untuk menumbuhkan fair play di dalam berbagai aktivitas jasmani; dan berpartisipasi secara positif dalam kelompok atau tim di dalam berbagai aktivitas jasmani.
2.3 Bergaya Hidup Aktif: Berpartisipasi dalam berbagai aktivitas jasmani dan mengenali faktor-faktor yang menyebabkan aktivitas jasmani menyenangkan.
2.4 Memilih Hidup yang menyehatkan: Mengenali risiko kesehatan akibat gaya hidup dan berbagai aktivitas jasmani untuk pencegahannya; mengidentifikasi pola makan sehat dan bergizi seimbang sesuai rekomendasi kesehatan untuk menunjang aktivitas sehari-hari; dan mempraktikkan penanganan cedera ringan sesuai pemahaman tentang prinsip pertolongan pertama.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) PJOK pada FASE C (Kelas 5-6):
3.1 Terampil Bergerak: Menjesuaikan keterampilan gerak melintasi berbagai situasi gerak; mentransfer strategi gerak yang sudah dikuasai ke dalam berbagai situasi gerak yang berbeda; dan menginvestigasi berbagai konsep gerak yang dapat diterapkan untuk meningkatkan capaian keterampilan gerak.
3.2 Belajar Melalui Gerak: Menguji efektivitas penerapan strategi gerak dalam berbagai situasi gerak; merancang peraturan alternatif dan modifikasi permainan untuk mendukung fair play dan partisipasi inklusif; dan menjalankan berbagai peran untuk mencapai keberhasilan kelompok atau tim di dalam berbagai aktivitas jasmani.
3.3 Bergaya Hidup Aktif: Berpartisipasi dalam aktivitas jasmani dan menjelaskan pengaruh aktivitas jasmani yang teratur terhadap kesehatan; mengidentifikasi rekomendasi aktivitas jasmani serta pencegahan perilaku sedenter.
3.4 Memilih Hidup yang menyehatkan: Mengidentifikasi dan menghubungkan antara gaya hidup, risiko kesehatan, dan aktivitas pencegahannya sesuai rekomendasi otoritas kesehatan; menjelaskan pola makan sehat untuk menunjang aktivitas jasmani berdasarkan informasi kandungan gizi pada makanan; dan mempraktikkan penanganan cedera sedang sesuai pemahaman tentang prinsip pertolongan pertama.`;
    }
  }

  if (s === 'Pendidikan Pancasila') {
    if (fase === 'A') {
      return `Capaian Pembelajaran (CP) Pendidikan Pancasila pada Fase A:
1.1 Pancasila: Mengenal bendera negara, lagu kebangsaan, simbol dan sila-sila Pancasila dalam lambang negara Garuda Pancasila dan simbol Pancasila beserta sila-sila Pancasila; menerapkan nilai-nilai Pancasila di lingkungan keluarga.
1.2 UUD Negara Republik Indonesia Tahun 1945: Mengenal aturan di lingkungan keluarga; menunjukkan dan menceritakan mematuhi aturan di lingkungan keluarga.
1.3 Bhinneka Tunggal Ika: Mengenal semboyan Bhinneka Tunggal Ika; mengidentifikasi dan menghargai identitas dirinya sesuai dengan jenis kelamin, hobi, bahasa, serta agama dan kepercayaan di lingkungan sekitar.
1.4 Negara Kesatuan Republik Indonesia: Mengenal karakteristik lingkungan tempat tinggal dan sekolah, sebagai bagian dari wilayah Negara Kesatuan Republik Indonesia; menceritakan dan mempraktikkan bekerja sama menjaga lingkungan sekitar dalam keberagaman.`;
    } else if (fase === 'B') {
      return `Capaian Pembelajaran (CP) Pendidikan Pancasila pada Fase B:
2.1 Pancasila: Mengidentifikasi makna sila-sila Pancasila, dan penerapannya dalam kehidupan sehari-hari; mengenal karakter para perumus Pancasila; menunjukkan sikap bangga menjadi anak Indonesia yang memiliki bahasa Indonesia sebagai bahasa persatuan di lingkungan sekitar.
2.2 UUD Negara Republik Indonesia Tahun 1945: Mengidentifikasi dan melaksanakan aturan di sekolah dan lingkungan tempat tinggal; mengidentifikasi dan menerapkan hak yang didapat dan kewajiban sebagai anggota keluarga dan sebagai warga sekolah.
2.3 Bhinneka Tunggal Ika: Membedakan dan menghargai identitas, keluarga, dan teman-temannya sesuai budaya, suku bangsa, bahasa, agama dan kepercayaannya di lingkungan sekitar.
2.4 Negara Kesatuan Republik Indonesia: Mengidentifikasi lingkungan tempat tinggal (RT, RW, desa atau kelurahan, dan kecamatan) sebagai bagian dari wilayah Negara Kesatuan Republik Indonesia; menunjukkan perilaku bekerja sama dalam berbagai bentuk keberagaman suku bangsa, sosial, dan budaya di Indonesia yang terikat persatuan dan kesatuan di lingkungan sekitar.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Pendidikan Pancasila pada Fase C:
3.1 Pancasila: Memahami kronologi sejarah kelahiran Pancasila; meneladani sikap para perumus Pancasila dan menerapkan di lingkungan masyarakat; menghubungkan sila-sila dalam Pancasila sebagai suatu kesatuan yang utuh; menguraikan makna nilai-nilai Pancasila sebagai dasar negara, dan pandangan hidup bangsa.
3.2 UUD Negara Republik Indonesia Tahun 1945: Mengimplementasikan bentuk-bentuk norma, hak, dan kewajiban dalam kedudukannya sebagai warga negara; mengenal Pembukaan Undang-Undang Indonesia tahun Dasar 1945; Negara Republik mempraktikkan musyawarah untuk membuat kesepakatan dan aturan bersama, serta menerapkannya dalam lingkungan keluarga dan sekolah.
3.3 Bhinneka Tunggal Ika: Menyajikan hasil identifikasi sikap menghormati, menjaga, dan melestarikan keberagaman budaya sesuai semboyan dalam bingkai Bhinneka Tunggal Ika di lingkungan sekitar.
3.4 Negara Kesatuan Republik Indonesia: Mengenal wilayahnya dalam konteks kabupaten/kota, dan provinsi sebagai bagian dari wilayah Negara Kesatuan Republik Indonesia; menunjukkan perilaku gotong royong untuk menjaga persatuan di lingkungan sekolah dan sekitar sebagai wujud bela Negara.`;
    }
  }

  if (s === 'Bahasa Indonesia') {
    if (fase === 'A') {
      return `Capaian Pembelajaran (CP) Bahasa Indonesia pada Fase A:
1.1 Menyimak: Memahami informasi dari teks nonsastra berbentuk teks aural berupa percakapan yang berkaitan dengan diri, keluarga, dan/atau lingkungan sekitar; dan memahami pesan teks sastra berbentuk teks aural.
1.2 Membaca dan Memirsa: Membaca kata-kata sederhana dengan fasih dari bacaan/tayangan yang dipirsa tentang diri, keluarga, kesehatan, dan/atau lingkungan sekitar; dan memahami isi bacaan/tayangan yang dipirsa.
1.3 Berbicara dan Mempresentasikan: Merespons dengan bertanya, menjawab, dan menanggapi komentar orang lain dengan baik dan santun; mengungkapkan perasaan dan gagasan secara lisan; menceritakan kembali isi berbagai tipe teks.
1.4 Menulis: Menulis permulaan dengan benar; mengembangkan tulisan tangan yang semakin baik; menulis berbagai tipe teks sederhana tentang diri, keluarga, dan/atau lingkungan sekitar dengan beberapa kalimat sederhana.`;
    } else if (fase === 'B') {
      return `Capaian Pembelajaran (CP) Bahasa Indonesia pada Fase B:
2.1 Menyimak: Memahami ide pokok suatu informasi dari teks nonsastra berbentuk teks aural; dan memahami isi teks sastra berbentuk teks aural.
2.2 Membaca dan Memirsa: Membaca kata-kata baru dengan fasih; memahami ide pokok, ide pendukung, pesan, dan informasi dalam teks sastra dan nonsastra berbentuk cetak/elektronik.
2.3 Berbicara dan Mempresentasikan: Menyajikan pendapat dengan pilihan kata dan sikap tubuh yang sesuai, menggunakan volume dan intonasi yang tepat; menanggapi diskusi; menceritakan kembali isi/informasi.
2.4 Menulis: Menulis berbagai tipe teks sederhana dengan rangkaian kalimat yang beragam; menggunakan kaidah kebahasaan dan kosakata baru yang memiliki makna denotatif untuk menulis teks sesuai konteks.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Bahasa Indonesia pada Fase C:
3.1 Menyimak: Menganalisis informasi dari teks nonsastra berbentuk teks aural; dan menganalisis isi teks sastra berbentuk teks aural.
3.2 Membaca dan Memirsa: Membaca kata-kata dengan berbagai pola kombinasi huruf dengan fasih; menganalisis informasi serta nilai-nilai dalam teks sastra dan nonsastra berwujud teks visual dan/atau audiovisual.
3.3 Berbicara dan Mempresentasikan: Mempresentasikan gagasan dari berbagai tipe teks dengan efektif dan santun; menyampaikan perasaan berdasarkan fakta, imajinasi secara indah dan menarik.
3.4 Menulis: Menulis berbagai tipe teks sederhana berdasarkan gagasan, hasil pengamatan, pengalaman, imajinasi dengan rangkaian kalimat kompleks; menggunakan kaidah kebahasaan dan kosakata baru dengan makna denotatif dan konotatif.`;
    }
  }

  if (s === 'Matematika') {
    if (fase === 'A') {
      return `Capaian Pembelajaran (CP) Matematika pada Fase A:
1.1 Bilangan: Menunjukkan pemahaman dan memiliki intuisi bilangan pada bilangan cacah sampai 100; membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan, menyusun, dan mengurai bilangan; melakukan operasi penjumlahan dan pengurangan sampai 20; memahami pecahan setengah dan seperempat.
1.2 Aljabar: Menunjukkan pemahaman makna simbol "="; mengenali, meniru, dan melanjutkan pola bukan bilangan.
1.3 Pengukuran: Membandingkan panjang dan berat benda secara langsung, serta membandingkan durasi waktu; mengukur menggunakan satuan tidak baku.
1.4 Geometri: Mengenal berbagai bangun datar dan bangun ruang; melakukan penyusunan dan penguraian bangun datar; menentukan posisi benda.
1.5 Analisis Data dan Peluang: Mengurutkan, menyortir, mengelompokkan, membandingkan, dan menyajikan data menggunakan turus dan piktogram.`;
    } else if (fase === 'B') {
      return `Capaian Pembelajaran (CP) Matematika pada Fase B:
2.1 Bilangan: Memiliki pemahaman dan intuisi bilangan pada bilangan cacah sampai 10.000; membaca, menulis, membandingkan, dan mengurutkan; melakukan penjumlahan dan pengurangan sampai 1.000; perkalian dan pembagian sampai 100; mengenal kelipatan, faktor, pecahan senilai, desimal, dan persen.
2.2 Aljabar: Menemukan nilai yang tidak diketahui dalam kalimat matematika penjumlahan dan pengurangan sampai 100; mengidentifikasi, meniru, dan mengembangkan pola gambar/bilangan.
2.3 Pengukuran: Mengukur panjang dan berat menggunakan satuan baku; mengukur luas dan volume menggunakan satuan tidak baku dan baku.
2.4 Geometri: Mendeskripsikan ciri berbagai bentuk bangun datar; menyusun dan mengurai bangun datar dengan lebih dari satu cara.
2.5 Analisis Data dan Peluang: Mengurutkan, membandingkan, menyajikan, menganalisis, dan menginterpretasikan data dalam tabel, diagram gambar, piktogram, dan diagram batang.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Matematika pada Fase C:
3.1 Bilangan: Menunjukkan pemahaman dan intuisi bilangan cacah sampai 1.000.000; menyelesaikan masalah KPK dan FPB, pecahan campuran, desimal, persen, perkalian, dan pembagian pecahan.
3.2 Aljabar: Menemukan nilai yang belum diketahui dalam kalimat matematika perkalian, pembagian, penjumlahan, pengurangan sampai 1.000; bernalar secara proporsional.
3.3 Pengukuran: Menentukan keliling dan luas berbagai bentuk bangun datar; mengukur besar sudut.
3.4 Geometri: Mengkonstruksi dan mengurai bangun ruang; mengenal visualisasi spasial; menentukan lokasi menggunakan sistem berpetak.
3.5 Analisis Data dan Peluang: Mengurutkan, membandingkan, menyajikan, dan menganalisis data dalam piktogram, diagram batang, tabel frekuensi; menentukan peluang kejadian.`;
    }
  }

  if (s === 'IPAS') {
    if (fase === 'B') {
      return `Capaian Pembelajaran (CP) IPAS pada Fase B:
1.1 Pemahaman IPAS: Menjelaskan bentuk dan fungsi pancaindra; menganalisis siklus hidup makhluk hidup; menghasilkan solusi pelestarian SDA; menyimpulkan perubahan wujud zat, bentuk energi, jenis gaya, interaksi sosial, letak geografis, sejarah lokal, dan nilai mata uang.
1.2 Keterampilan Proses: Mengamati, mempertanyakan dan memprediksi, merencanakan dan melakukan penyelidikan, memproses dan menganalisis data, mengevaluasi dan refleksi, serta mengomunikasikan hasil.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) IPAS pada Fase C:
2.1 Pemahaman IPAS: Merefleksikan sistem organ tubuh manusia; menganalisis hubungan biotik-abiotik ekosistem; menjelaskan bunyi dan cahaya, penghematan energi, tata surya, rotasi/revolusi bumi, letak geografis Indonesia, sejarah pahlawan, keanekaragaman budaya, dan kegiatan ekonomi.
2.2 Keterampilan Proses: Mengamati, mempertanyakan dan memprediksi, merencanakan dan melakukan penyelidikan, memproses dan menganalisis data, mengevaluasi dan refleksi, serta mengomunikasikan hasil.`;
    }
  }

  if (s === 'Seni') {
    if (fase === 'A') {
      return `Capaian Pembelajaran (CP) Seni Rupa pada Fase A:
1.1 Mengalami: Mengenali dan menyebutkan unsur-unsur rupa dalam benda-benda di sekitar atau karya seni rupa.
1.2 Merefleksikan: Merefleksikan dan mengapresiasi karya diri sendiri.
1.3 Berpikir dan Bekerja Artistik: Mengenali dan menguji coba alat dan/atau bahan yang dimiliki.
1.4 Menciptakan: Membuat karya seni rupa berdasarkan pengalaman dan hasil pengamatan terhadap lingkungan sekitar.
1.5 Berdampak: Menghasilkan karya seni rupa yang berdampak pada perasaan dirinya.`;
    } else if (fase === 'B') {
      return `Capaian Pembelajaran (CP) Seni Rupa pada Fase B:
2.1 Mengalami: Mengidentifikasi unsur rupa dan prinsip desain dalam benda-benda di sekitar atau karya seni rupa.
2.2 Merefleksikan: Merefleksikan dan mengapresiasi karya diri sendiri dan teman sekelas menggunakan kosa kata seni rupa yang sesuai.
2.3 Berpikir dan Bekerja Artistik: Mengenali dan menguji coba alat dan/atau bahan yang penggunaannya.
2.4 Menciptakan: Membuat karya seni rupa berdasarkan pengalaman dan hasil pengamatan terhadap lingkungan sekitar.
2.5 Berdampak: Menghasilkan karya seni rupa yang berdampak pada perasaan atau mewakili harapannya.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Seni Rupa pada Fase C:
3.1 Mengalami: Menjelaskan unsur rupa dan prinsip desain dalam benda-benda di sekitar atau karya seni rupa.
3.2 Merefleksikan: Merefleksikan dan mengapresiasi karya diri sendiri dan teman sekelas menggunakan kosa kata seni rupa yang sesuai.
3.3 Berpikir dan Bekerja Artistik: Mengenali dan menguji coba variasi teknik penggunaan alat dan/atau bahan.
3.4 Menciptakan: Membuat karya seni rupa berdasarkan pengalaman dan/atau hasil pengamatan terhadap lingkungan pengembangan imajinasi.
3.5 Berdampak: Menghasilkan karya seni rupa yang mewakili minatnya.`;
    }
  }

  if (s === 'Bahasa Inggris') {
    if (fase === 'B') {
      return `Capaian Pembelajaran (CP) Bahasa Inggris pada Fase B:
1.1 Menyimak - berbicara (Listening - Speaking): Memahami dan merespon teks lisan atau teks multimodal sederhana tentang kehidupan sehari-hari baik secara verbal atau non-verbal sesuai konteks.
1.2 Membaca – Memirsa (Reading – Viewing): Memahami teks tulis pendek sederhana atau teks multimodal tentang kehidupan sehari-hari dan meresponsnya secara verbal atau non-verbal sesuai konteks.
1.3 Menulis – Mempresentasikan (Writing – Presenting): Mengomunikasikan gagasan tentang topik sehari-hari dalam teks tulis pendek atau teks multimodal sesuai konteks.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Bahasa Inggris pada Fase C:
2.1 Menyimak – Berbicara (Listening – Writing): Memahami alur informasi teks secara keseluruhan dan merespon teks lisan atau teks multimodal sederhana tentang topik sehari-hari secara lisan dengan kalimat pendek dan sederhana sesuai konteks.
2.2 Membaca – Memirsa (Reading – Viewing): Memahami alur informasi secara keseluruhan, gagasan utama dan informasi rinci dari beragam teks pendek atau teks multimodal tentang topik sehari-hari dan meresponnya sesuai konteks.
2.3 Menulis – Mempresentasikan (Writing – Presenting): Mengomunikasikan ide dan pengalamannya melalui berbagai jenis teks tulis sederhana atau teks multimodal tentang topik sehari-hari sesuai konteks.`;
    }
  }

  if (s === 'Bahasa Jawa') {
    if (fase === 'A') {
      return `Capaian Pembelajaran (CP) Bahasa Jawa pada Fase A:
Peserta didik mampu bersikap menjadi penyimak bunyi huruf, suku kata, dan kata tentang nama-nama anggota tubuh dan kata kerja dalam ragam bahasa ngoko dan krama. Memahami pesan lisan dan informasi dari media audio, teks aural pada jenis dongeng, tembang dolanan, instruksi lisan, dan percakapan. Berbicara dengan santun sesuai dengan unggah-ungguh basa tentang beragam topik yang dikenali. Menunjukkan keterampilan menulis permulaan huruf latin dengan benar.`;
    } else if (fase === 'B') {
      return `Capaian Pembelajaran (CP) Bahasa Jawa pada Fase B:
Peserta didik mampu memahami ide pokok suatu pesan lisan, informasi dari media audio, teks aural, dan instruksi lisan. Memahami dan memaknai teks narasi dan aksara Jawa yang dibacakan. Memahami pesan dan informasi tentang kehidupan sehari-hari, teks narasi, dan puisi anak. Membaca kata dalam aksara Jawa legena dan sandhangan swara. Berbicara dengan pilihan kata dan sikap tubuh/gestur yang santun sesuai unggah-ungguh basa. Menulis teks narasi, deskripsi, rekon, dan menulis kata serta kalimat sederhana dalam aksara Jawa.`;
    } else if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Bahasa Jawa pada Fase C:
Peserta didik mampu menganalisis informasi berupa fakta, prosedur, dan nilai-nilai dari berbagai jenis teks informatif dan fiksi. Memparafrasekan tembang macapat. Menganalisis basa rinengga dalam teks. Membaca kata-kata dengan berbagai pola kombinasi huruf dengan fasih dan indah, serta memahami aksara Jawa (pasangan dan sandhangan). Menyampaikan informasi secara lisan untuk tujuan menghibur dan meyakinkan mitra tutur sesuai kaidah dan konteks. Menulis teks prosa, puisi, dan menuliskan aksara Jawa sesuai dengan kaidah.`;
    }
  }

  if (s === 'KKA') {
    if (fase === 'C') {
      return `Capaian Pembelajaran (CP) Koding dan Kecerdasan Artifisial pada Fase C:
1.1 Berpikir Komputasional: Memahami permasalahan sederhana dalam kehidupan sehari-hari, menerapkan pemecahan masalah secara sistematis, serta menuliskan instruksi logis dan terstruktur menggunakan sekumpulan kosakata atau simbol.
1.2 Literasi Digital: Memahami konsep dasar, manfaat, dan dampak teknologi digital, memahami sistem komputer tingkat pradasar, menerapkan pengamanan informasi pribadi dalam komunikasi daring, memanfaatkan internet, dan memproduksi serta mendiseminasi konten digital dalam bentuk teks dan gambar.
1.3 Literasi dan Etika Kecerdasan Artifisial: Memahami konsep KA sederhana, manfaat dan dampak KA pada kehidupan sehari-hari, prinsip bahwa KA dikembangkan untuk meningkatkan kesejahteraan manusia dan tidak boleh merugikan manusia.
1.4 Pemanfaatan dan Pengembangan Kecerdasan Artifisial: Menyimulasikan secara sederhana kerja KA saat mengenali pola, mengklasifikasi benda konkret berdasarkan sifatnya, dan mengetahui bagaimana prediksi sistem KA dipengaruhi input benda konkret.`;
    }
  }

  return '';
};
