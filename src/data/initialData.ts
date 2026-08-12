import { Biodata, DiagnosticData, SubjectStudentGrade, StudentEvaluationGrade, ScheduleItem, JournalEntry } from '../types';

export const initialBiodata: Biodata = {
  npsn: "",
  namaSekolah: "",
  alamat: "Jl. Pendidikan No. 12",
  kota: "Batu Bahalang",
  desa: "",
  kecamatan: "",
  namaKepsek: "Rafi'i Hamdi,M.Pd.",
  nipKepsek: "19850101 201001 1 001",
  fase: "Fase B",
  kelas: "III",
  kelasLanjutan: "IV",
  semester: "1",
  namaGuru: "Ahmad Mujahid, S.Pd.",
  nipGuru: "19900202 201502 1 002",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_Tut_Wuri_Handayani.png/800px-Logo_Tut_Wuri_Handayani.png"
};

export const initialLockedTargets: Record<string, number> = {
  "PKN": 75.0,
  "Bahasa Indonesia": 78.0,
  "Matematika": 70.0,
  "IPA": 74.0,
  "TIK": 75.0,
  "Bahasa dan Sastra Banjar": 76.0,
  "SBdP": 80.0,
  "PJOK": 82.0,
  "Bahasa Inggris": 72.0,
  "Pendidikan Agama Islam dan Budi Pekerti": 78.0,
  "Baca Tulis Al-Quran": 77.0,
  "Coding": 73.0,
  "Pendidikan Agama Kristen dan Budi Pekerti": 78.0,
  "Pendidikan Agama Katolik dan Budi Pekerti": 78.0,
  "Pendidikan Agama Buddha dan Budi Pekerti": 78.0,
  "Pendidikan Agama Hindu dan Budi Pekerti": 78.0
};

export const initialDiagnosticDatabase: Record<string, DiagnosticData> = {
  "PKN": { n90: 8, n80: 12, n70: 6, n60: 4 },
  "Bahasa Indonesia": { n90: 10, n80: 14, n70: 4, n60: 2 },
  "Matematika": { n90: 4, n80: 8, n70: 12, n60: 6 },
  "IPA": { n90: 6, n80: 12, n70: 8, n60: 4 },
  "TIK": { n90: 8, n80: 12, n70: 6, n60: 2 },
  "Bahasa dan Sastra Banjar": { n90: 8, n80: 11, n70: 7, n60: 4 },
  "SBdP": { n90: 15, n80: 10, n70: 3, n60: 2 },
  "PJOK": { n90: 18, n80: 8, n70: 3, n60: 1 },
  "Bahasa Inggris": { n90: 5, n80: 10, n70: 10, n60: 5 },
  "Pendidikan Agama Islam dan Budi Pekerti": { n90: 12, n80: 10, n70: 5, n60: 3 },
  "Baca Tulis Al-Quran": { n90: 9, n80: 11, n70: 8, n60: 2 },
  "Coding": { n90: 6, n80: 10, n70: 11, n60: 3 },
  "Pendidikan Agama Kristen dan Budi Pekerti": { n90: 10, n80: 12, n70: 5, n60: 3 },
  "Pendidikan Agama Katolik dan Budi Pekerti": { n90: 10, n80: 12, n70: 5, n60: 3 },
  "Pendidikan Agama Buddha dan Budi Pekerti": { n90: 10, n80: 12, n70: 5, n60: 3 },
  "Pendidikan Agama Hindu dan Budi Pekerti": { n90: 10, n80: 12, n70: 5, n60: 3 }
};

export const FASE_LIST = ["Fase A", "Fase B", "Fase C", "Fase D", "Fase E", "Fase F"];

// ===== Database Capaian Pembelajaran (CP) / Tujuan Pembelajaran (TP) default =====
// Bank resmi yang dipakai bersama oleh: Generator ATP, Hitung KKTP, RPM, Buku Nilai,
// dan Jurnal Mengajar. Guru tidak perlu lagi mencari/mengetik ulang TP.
export const initialDefaultSubjectData: Record<string, Record<string, string[]>> = (() => {
  // Bank TP untuk semua mapel (berlaku sama untuk setiap fase, dapat diubah guru di CP Bank)
  const tpBank: Record<string, string[]> = {
    "PKN": [
      "Peserta didik mampu menjelaskan makna nilai-nilai Pancasila dalam kehidupan sehari-hari.",
      "Peserta didik mampu mengidentifikasi contoh perilaku yang sesuai dengan sila-sila Pancasila di lingkungan keluarga dan sekolah.",
      "Peserta didik mampu menunjukkan sikap gotong royong, tanggung jawab, dan menghargai perbedaan dalam kehidupan bersama.",
      "Peserta didik mampu menjelaskan hak dan kewajiban sebagai anggota keluarga dan warga sekolah.",
      "Peserta didik mampu menerapkan aturan dan kesepakatan bersama dalam kehidupan sehari-hari.",
      "Peserta didik mampu menghargai keberagaman suku, budaya, bahasa, agama, dan karakteristik individu.",
      "Peserta didik mampu menunjukkan sikap cinta tanah air melalui tindakan sederhana di lingkungan sekitar.",
      "Peserta didik mampu menyelesaikan permasalahan sederhana melalui musyawarah dan pengambilan keputusan bersama."
    ],
    "Bahasa Indonesia": [
      "Peserta didik mampu menyimak informasi dari teks lisan dan mengidentifikasi informasi penting yang disampaikan.",
      "Peserta didik mampu membaca teks dengan lancar dan memahami informasi tersurat maupun tersirat.",
      "Peserta didik mampu menentukan ide pokok dan informasi pendukung dalam sebuah teks.",
      "Peserta didik mampu menceritakan kembali isi teks dengan menggunakan bahasa yang runtut.",
      "Peserta didik mampu menulis kalimat dan paragraf sederhana dengan struktur yang tepat.",
      "Peserta didik mampu menyusun teks deskripsi berdasarkan pengamatan terhadap lingkungan sekitar.",
      "Peserta didik mampu menyampaikan pendapat secara lisan dengan bahasa yang santun dan percaya diri.",
      "Peserta didik mampu menghasilkan karya tulis sederhana dengan memperhatikan penggunaan kosakata, ejaan, dan tanda baca."
    ],
    "Matematika": [
      "Peserta didik mampu memahami konsep bilangan dan menggunakannya dalam menyelesaikan permasalahan sehari-hari.",
      "Peserta didik mampu melakukan operasi hitung bilangan secara tepat sesuai tingkat perkembangan peserta didik.",
      "Peserta didik mampu memahami hubungan antara pecahan, desimal, dan persen dalam konteks kehidupan sehari-hari.",
      "Peserta didik mampu menyelesaikan masalah yang berkaitan dengan pengukuran panjang, berat, waktu, dan volume.",
      "Peserta didik mampu mengenali, membandingkan, dan menentukan karakteristik bangun datar dan bangun ruang.",
      "Peserta didik mampu menggunakan konsep keliling dan luas untuk menyelesaikan masalah kontekstual.",
      "Peserta didik mampu membaca, menyajikan, dan menginterpretasikan data dalam bentuk tabel, diagram, atau grafik sederhana.",
      "Peserta didik mampu menggunakan penalaran matematis untuk menemukan strategi penyelesaian masalah."
    ],
    "IPA": [
      "Peserta didik mampu mengidentifikasi karakteristik makhluk hidup dan kebutuhan dasarnya.",
      "Peserta didik mampu menjelaskan hubungan antara manusia, hewan, tumbuhan, dan lingkungan dalam suatu ekosistem.",
      "Peserta didik mampu mengidentifikasi perubahan materi dan perubahan energi yang terjadi dalam kehidupan sehari-hari.",
      "Peserta didik mampu menjelaskan berbagai bentuk energi dan pemanfaatannya dalam kehidupan sehari-hari.",
      "Peserta didik mampu melakukan pengamatan sederhana terhadap fenomena alam menggunakan langkah-langkah ilmiah.",
      "Peserta didik mampu mengidentifikasi sumber daya alam dan menjelaskan cara menjaga kelestariannya.",
      "Peserta didik mampu menjelaskan perubahan lingkungan serta dampaknya terhadap kehidupan manusia dan makhluk hidup.",
      "Peserta didik mampu menyajikan hasil pengamatan atau percobaan sederhana dalam bentuk laporan, tabel, atau gambar."
    ],
    "TIK": [
      "Peserta didik mampu mengenali perangkat keras dan perangkat lunak komputer beserta fungsinya.",
      "Peserta didik mampu mengoperasikan komputer dengan memperhatikan prosedur penggunaan yang aman.",
      "Peserta didik mampu mengelola file dan folder secara sederhana menggunakan perangkat komputer.",
      "Peserta didik mampu menggunakan aplikasi pengolah kata untuk membuat dokumen sederhana.",
      "Peserta didik mampu menggunakan aplikasi presentasi untuk menyajikan informasi sederhana.",
      "Peserta didik mampu menggunakan internet secara aman, bertanggung jawab, dan bijak.",
      "Peserta didik mampu mengenali informasi pribadi dan menerapkan prinsip keamanan digital.",
      "Peserta didik mampu membuat karya digital sederhana dengan memanfaatkan perangkat dan aplikasi komputer."
    ],
    "Bahasa dan Sastra Banjar": [
      "Peserta didik mampu mengenali kosakata Bahasa Banjar yang digunakan dalam kehidupan sehari-hari.",
      "Peserta didik mampu memahami makna ungkapan dan peribahasa sederhana dalam Bahasa Banjar.",
      "Peserta didik mampu menggunakan Bahasa Banjar dalam percakapan sederhana dengan santun.",
      "Peserta didik mampu membaca dan memahami teks sederhana berbahasa Banjar.",
      "Peserta didik mampu menceritakan pengalaman atau cerita sederhana menggunakan Bahasa Banjar.",
      "Peserta didik mampu mengenali unsur-unsur sastra Banjar seperti cerita rakyat, syair, pantun, dan peribahasa.",
      "Peserta didik mampu menyajikan karya sastra sederhana dalam Bahasa Banjar.",
      "Peserta didik mampu menunjukkan sikap bangga dan peduli terhadap bahasa serta sastra daerah Banjar."
    ],
    "SBdP": [
      "Peserta didik mampu mengenali unsur-unsur seni rupa melalui pengamatan terhadap karya seni di lingkungan sekitar.",
      "Peserta didik mampu membuat karya seni rupa menggunakan berbagai teknik dan media sederhana.",
      "Peserta didik mampu mengeksplorasi warna, garis, bentuk, tekstur, dan komposisi dalam berkarya.",
      "Peserta didik mampu mengenali berbagai bentuk seni musik dan unsur-unsurnya.",
      "Peserta didik mampu menyanyikan lagu dengan memperhatikan irama, tempo, dan ekspresi.",
      "Peserta didik mampu mengenali dan mempraktikkan gerak tari sederhana yang bersumber dari budaya daerah.",
      "Peserta didik mampu membuat karya prakarya dengan memanfaatkan bahan yang tersedia di lingkungan sekitar.",
      "Peserta didik mampu mengapresiasi karya seni sendiri dan karya orang lain dengan sikap menghargai."
    ],
    "PJOK": [
      "Peserta didik mampu mempraktikkan berbagai gerak dasar lokomotor, nonlokomotor, dan manipulatif.",
      "Peserta didik mampu mempraktikkan kombinasi gerak dalam permainan dan aktivitas olahraga sederhana.",
      "Peserta didik mampu menunjukkan kemampuan koordinasi, keseimbangan, kelincahan, dan kekuatan melalui aktivitas fisik.",
      "Peserta didik mampu mengikuti permainan olahraga dengan menerapkan aturan dan sikap sportif.",
      "Peserta didik mampu melakukan aktivitas kebugaran jasmani sesuai kemampuan tubuhnya.",
      "Peserta didik mampu menerapkan pola hidup bersih dan sehat dalam kehidupan sehari-hari.",
      "Peserta didik mampu mengenali pentingnya menjaga keselamatan diri selama melakukan aktivitas fisik.",
      "Peserta didik mampu menunjukkan kerja sama, disiplin, tanggung jawab, dan sportivitas dalam aktivitas jasmani."
    ],
    "Bahasa Inggris": [
      "Peserta didik mampu memahami dan menggunakan kosakata Bahasa Inggris sederhana dalam kehidupan sehari-hari.",
      "Peserta didik mampu memperkenalkan diri dan menyampaikan informasi pribadi sederhana dalam Bahasa Inggris.",
      "Peserta didik mampu memahami instruksi sederhana yang disampaikan secara lisan.",
      "Peserta didik mampu melakukan percakapan sederhana menggunakan ungkapan yang sesuai konteks.",
      "Peserta didik mampu membaca dan memahami teks pendek berbahasa Inggris.",
      "Peserta didik mampu menulis kata, kalimat, dan teks sederhana dalam Bahasa Inggris.",
      "Peserta didik mampu mendeskripsikan orang, benda, tempat, atau aktivitas sederhana menggunakan Bahasa Inggris.",
      "Peserta didik mampu menggunakan ungkapan sederhana untuk berkomunikasi secara santun dalam situasi sehari-hari."
    ],
    "Pendidikan Agama Islam dan Budi Pekerti": [
      "Peserta didik mampu mengenal dan memahami dasar-dasar keimanan kepada Allah Swt.",
      "Peserta didik mampu mengenal dan menerapkan perilaku terpuji dalam kehidupan sehari-hari.",
      "Peserta didik mampu memahami dan mempraktikkan tata cara ibadah sesuai tuntunan Islam.",
      "Peserta didik mampu membaca dan memahami ayat atau surah Al-Qur'an yang dipelajari.",
      "Peserta didik mampu menceritakan kisah keteladanan Nabi dan Rasul serta mengambil nilai-nilai positifnya.",
      "Peserta didik mampu menerapkan sikap jujur, disiplin, tanggung jawab, peduli, dan santun dalam kehidupan sehari-hari.",
      "Peserta didik mampu memahami hubungan antara keimanan, ibadah, dan akhlak dalam kehidupan sehari-hari.",
      "Peserta didik mampu menunjukkan perilaku yang mencerminkan nilai-nilai ajaran Islam di lingkungan keluarga, sekolah, dan masyarakat."
    ],
    "Baca Tulis Al-Quran": [
      "Peserta didik mampu mengenali dan membedakan huruf hijaiyah dengan benar.",
      "Peserta didik mampu membaca huruf hijaiyah bersambung sesuai kaidah dasar.",
      "Peserta didik mampu membaca kata dan kalimat sederhana dalam Al-Qur'an dengan lancar.",
      "Peserta didik mampu menulis huruf hijaiyah dan kata sederhana dengan bentuk yang benar.",
      "Peserta didik mampu membaca Al-Qur'an dengan memperhatikan makhraj huruf yang tepat.",
      "Peserta didik mampu menerapkan hukum bacaan tajwid dasar dalam membaca Al-Qur'an.",
      "Peserta didik mampu menghafal surah-surah pendek sesuai target pembelajaran.",
      "Peserta didik mampu membaca Al-Qur'an dengan tartil, lancar, dan menunjukkan sikap hormat terhadap Al-Qur'an."
    ],
    "Coding": [
      "Peserta didik mampu mengenali konsep dasar algoritma melalui aktivitas sederhana dalam kehidupan sehari-hari.",
      "Peserta didik mampu menyusun langkah-langkah penyelesaian masalah secara runtut dan logis.",
      "Peserta didik mampu memahami konsep urutan, pengulangan, dan percabangan dalam pemrograman sederhana.",
      "Peserta didik mampu membuat program sederhana menggunakan lingkungan pemrograman visual berbasis blok.",
      "Peserta didik mampu menggunakan variabel atau nilai untuk menyimpan dan mengolah informasi sederhana.",
      "Peserta didik mampu mengidentifikasi kesalahan sederhana dalam program dan melakukan perbaikan.",
      "Peserta didik mampu membuat proyek coding sederhana untuk menyelesaikan permasalahan tertentu.",
      "Peserta didik mampu menjelaskan cara kerja program yang dibuat dan mempresentasikan hasilnya secara sederhana."
    ],
    "Pendidikan Agama Kristen dan Budi Pekerti": [
      "Peserta didik mampu mengenal Allah sebagai Pencipta melalui pengamatan terhadap alam ciptaan.",
      "Peserta didik mampu mensyukuri ciptaan Allah melalui doa dan perilaku hidup sehari-hari.",
      "Peserta didik mampu mengenal kasih Allah dan keselamatan yang diberikan melalui Yesus Kristus.",
      "Peserta didik mampu meneladani kasih Yesus Kristus dalam kehidupan keluarga, sekolah, dan sesama.",
      "Peserta didik mampu mengenal tokoh-tokoh Alkitab dan meneladani perbuatan baik mereka.",
      "Peserta didik mampu membiasakan berdoa dan bersyukur dalam berbagai situasi kehidupan.",
      "Peserta didik mampu menunjukkan sikap jujur, disiplin, bertanggung jawab, dan peduli terhadap sesama.",
      "Peserta didik mampu menerapkan nilai kasih, pengampunan, dan perdamaian dalam kehidupan bersama."
    ],
    "Pendidikan Agama Katolik dan Budi Pekerti": [
      "Peserta didik mampu mengenal Allah Bapa sebagai pencipta langit dan bumi beserta isinya.",
      "Peserta didik mampu mensyukuri karya Allah dalam hidup manusia dan alam ciptaan.",
      "Peserta didik mampu mengenal Yesus Kristus sebagai sahabat, guru, dan penyelamat umat manusia.",
      "Peserta didik mampu meneladani Yesus dalam bersikap rendah hati, melayani, dan mengampuni.",
      "Peserta didik mampu mengenal peran Roh Kudus dan Gereja dalam kehidupan orang beriman.",
      "Peserta didik mampu membiasakan doa, ibadah, dan perayaan iman sederhana dalam keluarga dan Gereja.",
      "Peserta didik mampu menunjukkan sikap kasih, kejujuran, tanggung jawab, dan kepedulian dalam kehidupan sehari-hari.",
      "Peserta didik mampu menghormati sesama dan menghargai keberagaman agama serta budaya dalam masyarakat."
    ],
    "Pendidikan Agama Buddha dan Budi Pekerti": [
      "Peserta didik mampu mengenal riwayat kehidupan Buddha Gautama dan keteladanan-Nya.",
      "Peserta didik mampu mengenal keyakinan dasar agama Buddha tentang Tuhan, hukum karma, dan Tri Ratna.",
      "Peserta didik mampu membiasakan berdoa, meditasi sederhana, dan sikap batin yang tenang.",
      "Peserta didik mampu menunjukkan sikap cinta kasih, welas asih, dan tolong-menolong terhadap sesama.",
      "Peserta didik mampu mengenal ajaran Buddha tentang kebajikan dan nilai-nilai moral dalam kehidupan sehari-hari.",
      "Peserta didik mampu menerapkan sikap jujur, disiplin, bertanggung jawab, dan hormat kepada orang tua dan guru.",
      "Peserta didik mampu mengenal hari raya dan perayaan keagamaan umat Buddha beserta maknanya.",
      "Peserta didik mampu menghargai keberagaman agama dan budaya serta hidup rukun dalam masyarakat."
    ],
    "Pendidikan Agama Hindu dan Budi Pekerti": [
      "Peserta didik mampu mengenal Tuhan Yang Maha Esa (Sang Hyang Widhi Wasa) dan ciptaan-Nya.",
      "Peserta didik mampu mensyukuri kasih dan pemeliharaan Tuhan melalui doa dan sembahyang sehari-hari.",
      "Peserta didik mampu mengenal dasar-dasar ajaran agama Hindu seperti Tri Kaya Parisudha dan Tri Hita Karana.",
      "Peserta didik mampu menerapkan perilaku berpikir, berkata, dan berbuat baik (Tri Kaya Parisudha) dalam kehidupan sehari-hari.",
      "Peserta didik mampu menjaga hubungan harmonis dengan Tuhan, sesama, dan alam lingkungan (Tri Hita Karana).",
      "Peserta didik mampu mengenal hari raya dan upacara keagamaan umat Hindu beserta maknanya.",
      "Peserta didik mampu menunjukkan sikap bakti kepada orang tua, guru, dan sesama dalam kehidupan sehari-hari.",
      "Peserta didik mampu menghargai keberagaman agama dan budaya serta hidup rukun dan toleran dalam masyarakat."
    ]
  };

  // Semua fase memakai bank TP yang sama. Guru dapat mengubahnya lewat CP Bank / Hitung KKTP.
  return FASE_LIST.reduce<Record<string, Record<string, string[]>>>((acc, fase) => {
    acc[fase] = {};
    Object.keys(tpBank).forEach((mapel) => {
      acc[fase][mapel] = tpBank[mapel].slice();
    });
    return acc;
  }, {});
})();

// ===== Database Capaian Pembelajaran (CP) resmi per fase =====
// CP nasional dikutip per mapel + fase (A/B/C SD sama dengan Fase A-C).
// Dipakai sebagai acuan "CP" di Generator ATP & Bank CP; guru tetap bisa mengubah data TP.
export const initialCpByFase: Record<string, Record<string, string>> = {
  "PKN": {
    "Fase A": "Peserta didik mengenal dan memahami simbol serta sila-sila Pancasila, aturan di lingkungan keluarga dan sekolah, identitas diri dan keberagaman, serta menunjukkan perilaku sesuai nilai-nilai Pancasila dalam kehidupan sehari-hari.",
    "Fase B": "Peserta didik memahami makna sila-sila Pancasila dan penerapannya dalam kehidupan, mengenal hak dan kewajiban sebagai anggota keluarga dan warga sekolah, menghargai keberagaman suku, budaya, bahasa, agama, dan karakteristik masyarakat serta menunjukkan perilaku gotong royong dan bertanggung jawab.",
    "Fase C": "Peserta didik memahami hubungan antarsila Pancasila dan nilai-nilainya dalam kehidupan bermasyarakat, berbangsa, dan bernegara; memahami norma, hak dan kewajiban, keberagaman, persatuan, serta menunjukkan sikap demokratis, gotong royong, tanggung jawab, dan cinta tanah air."
  },
  "Bahasa Indonesia": {
    "Fase A": "Peserta didik mampu menyimak informasi sederhana, memahami pesan dan instruksi, membaca dan memahami kata serta kalimat sederhana, berbicara untuk menyampaikan informasi dan pengalaman, serta menulis kata dan kalimat sederhana dengan benar.",
    "Fase B": "Peserta didik mampu memahami informasi dari teks lisan, tulisan, visual, dan audiovisual; menemukan ide pokok dan informasi penting; membaca berbagai teks dengan lancar; menyampaikan pendapat dan informasi secara lisan; serta menulis teks sederhana secara terstruktur.",
    "Fase C": "Peserta didik mampu memahami, menganalisis, mengevaluasi, dan menginterpretasi informasi dari berbagai teks; menyimpulkan informasi tersurat maupun tersirat; menyampaikan gagasan secara kritis dan kreatif; serta menghasilkan berbagai teks lisan, tulisan, visual, dan multimodal sesuai tujuan dan konteks."
  },
  "Matematika": {
    "Fase A": "Peserta didik memahami bilangan cacah sampai 100, nilai tempat, membandingkan dan mengurutkan bilangan, melakukan penjumlahan dan pengurangan sederhana, mengenal pecahan sederhana, pola, pengukuran, bangun geometri, serta menyajikan dan membaca data sederhana.",
    "Fase B": "Peserta didik memahami bilangan cacah sampai 10.000, operasi hitung, pecahan, desimal sederhana, pola dan kalimat matematika, pengukuran, bangun datar dan ruang, serta mampu menyajikan dan menganalisis data sederhana untuk memecahkan masalah kehidupan sehari-hari.",
    "Fase C": "Peserta didik memahami bilangan yang lebih kompleks, operasi pecahan dan desimal, perbandingan, proporsi, pola dan hubungan aljabar, pengukuran, geometri, koordinat, serta mampu mengumpulkan, menyajikan, membaca, dan menganalisis data untuk menyelesaikan masalah."
  },
  "IPA": {
    "Fase A": "Peserta didik mengenal diri, keluarga, lingkungan sekitar, makhluk hidup, benda dan sifatnya, perubahan sederhana, cuaca, lingkungan alam dan sosial, serta menunjukkan kepedulian terhadap lingkungan.",
    "Fase B": "Peserta didik memahami ciri dan kebutuhan makhluk hidup, perubahan materi, energi, gaya, lingkungan, sumber daya alam, siklus kehidupan, masyarakat dan keberagaman sosial budaya, serta menggunakan pengamatan dan penyelidikan sederhana untuk memahami fenomena di sekitar.",
    "Fase C": "Peserta didik memahami konsep sistem tubuh manusia, ekosistem, energi, gaya, perubahan materi, bumi dan lingkungan, tata surya, serta fenomena sosial dan budaya; mampu melakukan penyelidikan, mengolah data, menarik kesimpulan, dan mengaitkan konsep sains dengan kehidupan sehari-hari."
  },
  "TIK": {
    "Fase A": "Peserta didik mengenal perangkat teknologi digital dan fungsinya, menggunakan perangkat secara sederhana dengan aman, mengenali informasi digital, serta menunjukkan kebiasaan positif dan bertanggung jawab dalam menggunakan teknologi.",
    "Fase B": "Peserta didik mampu menggunakan perangkat komputer dan aplikasi sederhana, mengelola informasi dan data sederhana, memahami langkah-langkah penyelesaian masalah, mengenal algoritma sederhana, serta menerapkan etika dan keamanan dalam penggunaan teknologi digital.",
    "Fase C": "Peserta didik mampu menggunakan teknologi digital untuk mencari, mengolah, menyajikan, dan mengomunikasikan informasi; memahami konsep data, algoritma, jaringan sederhana, keamanan digital, serta menerapkan berpikir komputasional untuk menyelesaikan masalah."
  },
  "Bahasa dan Sastra Banjar": {
    "Fase A": "Peserta didik mengenal kosakata dan ungkapan sederhana Bahasa Banjar, memahami percakapan sehari-hari, mampu menyimak dan mengucapkan kata atau kalimat sederhana, serta mengenal cerita, lagu, dan budaya Banjar.",
    "Fase B": "Peserta didik mampu memahami dan menggunakan Bahasa Banjar dalam percakapan sehari-hari, membaca dan menulis teks sederhana, memahami cerita rakyat dan sastra Banjar, mengenal peribahasa, ungkapan, syair, serta menunjukkan sikap menghargai budaya Banjar.",
    "Fase C": "Peserta didik mampu menggunakan Bahasa Banjar secara lisan dan tulisan dalam berbagai konteks, memahami dan menganalisis teks sastra dan nonsastra Banjar, mengapresiasi cerita rakyat, syair, peribahasa dan tradisi Banjar, serta menghasilkan karya sederhana dalam Bahasa Banjar."
  },
  "SBdP": {
    "Fase A": "Peserta didik mampu mengeksplorasi unsur seni melalui kegiatan menggambar, bernyanyi, bergerak, bermain peran, membuat karya sederhana, serta mengenali dan mengekspresikan pengalaman melalui karya seni.",
    "Fase B": "Peserta didik mampu menciptakan, menampilkan, dan mengapresiasi karya seni rupa, musik, tari, dan/atau teater sederhana serta menghasilkan karya prakarya menggunakan berbagai bahan dan teknik dengan memperhatikan fungsi dan keindahan.",
    "Fase C": "Peserta didik mampu mengeksplorasi, menciptakan, mempresentasikan, dan mengevaluasi karya seni secara lebih mandiri; memahami unsur dan prinsip seni; serta menghasilkan karya seni dan prakarya yang kreatif dengan memanfaatkan lingkungan dan budaya lokal."
  },
  "PJOK": {
    "Fase A": "Peserta didik mampu melakukan berbagai pola gerak dasar, aktivitas permainan dan olahraga sederhana, aktivitas senam dan gerak berirama, serta mengenal kebiasaan hidup sehat dan keselamatan diri.",
    "Fase B": "Peserta didik mampu mempraktikkan berbagai keterampilan gerak dasar dan kombinasi gerak dalam permainan dan olahraga, senam, aktivitas ritmik, aktivitas kebugaran, serta menerapkan pola hidup sehat dan keselamatan.",
    "Fase C": "Peserta didik mampu mengembangkan keterampilan gerak dan strategi dalam berbagai permainan dan olahraga, meningkatkan kebugaran jasmani, melakukan aktivitas senam dan gerak berirama, serta menerapkan pola hidup sehat, keselamatan, sportivitas, kerja sama, dan tanggung jawab."
  },
  "Bahasa Inggris": {
    "Fase A": "Peserta didik mampu memahami dan menggunakan kosakata serta ungkapan Bahasa Inggris sederhana yang berkaitan dengan diri sendiri, keluarga, kelas, benda sekitar, angka, warna, dan aktivitas sehari-hari melalui kegiatan menyimak, berbicara, membaca awal, dan menulis sederhana.",
    "Fase B": "Peserta didik mampu memahami dan menggunakan ungkapan Bahasa Inggris sederhana untuk berinteraksi dalam konteks sehari-hari, memahami informasi dari teks sederhana, serta menghasilkan ungkapan lisan dan tulisan sederhana dengan bantuan visual atau contoh.",
    "Fase C": "Peserta didik mampu memahami dan menggunakan Bahasa Inggris sederhana untuk berkomunikasi dalam konteks kehidupan sehari-hari, memahami informasi tersurat dari berbagai teks sederhana, serta menyampaikan gagasan dan pengalaman secara lisan, tulisan, dan visual dengan struktur dan kosakata yang semakin beragam."
  },
  "Pendidikan Agama Islam dan Budi Pekerti": {
    "Fase A": "Peserta didik mengenal dasar-dasar Al-Qur'an, hadis, akidah, akhlak, fikih, serta sejarah Islam; mampu mempraktikkan ibadah dasar dan menunjukkan perilaku terpuji dalam kehidupan sehari-hari.",
    "Fase B": "Peserta didik memahami kandungan ayat Al-Qur'an dan hadis sederhana, mengenal dan memahami rukun iman, menunjukkan akhlak terpuji, memahami tata cara ibadah, serta mengenal kisah dan keteladanan Nabi dan tokoh Islam.",
    "Fase C": "Peserta didik memahami Al-Qur'an dan hadis sebagai pedoman kehidupan, memperkuat pemahaman akidah, menerapkan akhlak mulia, memahami dan mempraktikkan ibadah dengan benar, serta memahami sejarah dan keteladanan Nabi Muhammad saw. dan perkembangan peradaban Islam."
  },
  "Baca Tulis Al-Quran": {
    "Fase A": "Peserta didik mampu mengenal huruf hijaiyah, membaca huruf dan kata sederhana, mengenal tanda baca harakat, menulis huruf hijaiyah sederhana, menghafal surah-surah pendek, dan menunjukkan adab terhadap Al-Qur'an.",
    "Fase B": "Peserta didik mampu membaca Al-Qur'an dengan lancar dan sesuai makhraj dasar, menerapkan hukum bacaan sederhana, menulis ayat atau kata dalam huruf Arab, menghafal surah dan doa pilihan, serta memahami adab membaca Al-Qur'an.",
    "Fase C": "Peserta didik mampu membaca Al-Qur'an dengan lebih fasih sesuai kaidah tajwid dasar, memahami hukum bacaan yang dipelajari, menulis ayat dengan lebih baik, menghafal surah dan hadis/doa pilihan, serta memahami pesan dasar ayat yang dibaca."
  },
  "Coding": {
    "Fase A": "Peserta didik mampu mengenali pola, mengurutkan langkah, mengikuti instruksi sederhana, memecahkan masalah sederhana secara logis, serta mengenal teknologi digital melalui aktivitas bermain dan kegiatan tanpa perangkat. (CP pengenalan/integrasi)",
    "Fase B": "Peserta didik mampu menerapkan berpikir komputasional melalui pengenalan pola, pengelompokan, pengurutan, algoritma sederhana, serta menyusun langkah penyelesaian masalah menggunakan aktivitas unplugged maupun perangkat digital sederhana. (CP pengenalan/integrasi)",
    "Fase C": "Peserta didik mampu memahami permasalahan sederhana dalam kehidupan sehari-hari, menerapkan pemecahan masalah secara sistematis, menyusun algoritma dan instruksi logis menggunakan kosakata atau simbol, serta mengenal pemanfaatan data dan kecerdasan artifisial secara kritis, aman, etis, dan bertanggung jawab. (CP resmi Koding dan KA)"
  },
  "Pendidikan Agama Kristen dan Budi Pekerti": {
    "Fase A": "Peserta didik mengenal kasih Allah melalui dirinya, keluarga, lingkungan, dan ciptaan Tuhan. Peserta didik mengenal tokoh-tokoh Alkitab dan memahami bahwa dirinya berharga di hadapan Allah. Peserta didik mulai membiasakan perilaku mengasihi, bersyukur, jujur, bertanggung jawab, menghormati orang lain, serta menjaga ciptaan Tuhan.",
    "Fase B": "Peserta didik memahami karya Allah dalam kehidupan manusia, keluarga, gereja, masyarakat, dan lingkungan. Peserta didik mengenal kehidupan dan ajaran Yesus Kristus serta tokoh-tokoh iman dalam Alkitab. Peserta didik mampu menerapkan nilai kasih, pengampunan, kejujuran, tanggung jawab, keadilan, dan kepedulian dalam kehidupan sehari-hari.",
    "Fase C": "Peserta didik memahami karya keselamatan Allah melalui Yesus Kristus dan menerapkan nilai-nilai iman Kristen dalam kehidupan pribadi, keluarga, sekolah, gereja, masyarakat, bangsa, dan lingkungan. Peserta didik mampu merefleksikan tanggung jawabnya sebagai pribadi yang dikasihi Allah serta membangun kehidupan yang berintegritas, adil, damai, dan peduli terhadap sesama."
  },
  "Pendidikan Agama Katolik dan Budi Pekerti": {
    "Fase A": "Peserta didik mengenal Allah sebagai Bapa yang mengasihi manusia dan mengenal dirinya sebagai pribadi yang berharga. Peserta didik mengenal keluarga, lingkungan, Yesus Kristus, doa, serta perayaan iman secara sederhana. Peserta didik mulai membiasakan perilaku kasih, syukur, jujur, peduli, dan menghormati sesama.",
    "Fase B": "Peserta didik memahami Allah yang menyelamatkan dan mengasihi manusia melalui Yesus Kristus. Peserta didik mengenal ajaran dan keteladanan Yesus, kehidupan Gereja, doa dan perayaan iman. Peserta didik mampu menerapkan nilai kasih, pengampunan, kejujuran, tanggung jawab, dan kepedulian dalam kehidupan sehari-hari.",
    "Fase C": "Peserta didik memahami pribadi dan karya Yesus Kristus, Gereja sebagai persekutuan umat beriman, serta panggilan manusia untuk hidup sesuai kehendak Allah. Peserta didik mampu merefleksikan iman Katolik dan mewujudkannya melalui sikap kasih, keadilan, perdamaian, tanggung jawab, persaudaraan, dan kepedulian terhadap lingkungan serta masyarakat."
  },
  "Pendidikan Agama Buddha dan Budi Pekerti": {
    "Fase A": "Peserta didik mengenal Buddha, Dharma, dan Sangha secara sederhana serta mengenal nilai kasih sayang, kebajikan, kejujuran, kesabaran, dan kepedulian. Peserta didik mulai membiasakan perilaku baik terhadap diri sendiri, keluarga, teman, makhluk hidup, dan lingkungan.",
    "Fase B": "Peserta didik memahami ajaran dasar Buddha tentang kebajikan, hukum sebab-akibat, Empat Kebenaran Mulia secara sederhana, Jalan Mulia Berunsur Delapan secara kontekstual, serta pentingnya pengembangan perilaku baik. Peserta didik mampu menerapkan nilai kebijaksanaan, kasih sayang, kejujuran, disiplin, dan tanggung jawab.",
    "Fase C": "Peserta didik memahami ajaran Buddha mengenai kehidupan, karma, Empat Kebenaran Mulia, Jalan Mulia Berunsur Delapan, Pancasila Buddhis, serta pengembangan kebijaksanaan dan kasih sayang. Peserta didik mampu merefleksikan ajaran Buddha dan menerapkannya dalam kehidupan pribadi, sosial, serta lingkungan."
  },
  "Pendidikan Agama Hindu dan Budi Pekerti": {
    "Fase A": "Peserta didik mengenal Tuhan Yang Maha Esa, dirinya, keluarga, lingkungan, serta ciptaan sebagai bagian dari kehidupan yang harmonis. Peserta didik mengenal ajaran sederhana tentang Tri Kaya Parisudha, Tri Hita Karana, doa, serta perilaku baik dalam kehidupan sehari-hari.",
    "Fase B": "Peserta didik memahami ajaran dasar Hindu mengenai Tuhan Yang Maha Esa, kehidupan manusia, Tri Hita Karana, Tri Kaya Parisudha, nilai-nilai etika, serta berbagai bentuk pelaksanaan ajaran agama dalam kehidupan. Peserta didik mampu menerapkan perilaku yang mencerminkan keharmonisan dengan Tuhan, sesama manusia, dan lingkungan.",
    "Fase C": "Peserta didik memahami ajaran Hindu mengenai Tuhan Yang Maha Esa, manusia, etika, kehidupan sosial, alam, kitab suci, serta nilai-nilai dharma. Peserta didik mampu merefleksikan dan menerapkan ajaran Hindu melalui perilaku yang mencerminkan dharma, tanggung jawab, keharmonisan, toleransi, dan kepedulian terhadap lingkungan."
  }
};

export const sampleStudentNames = ["Ahmad Pratama", "Budi Santoso", "Citra Kirana", "Dewa Purnama", "Eka Rahmawati"];

export function generateSampleSubjectGrades(): Record<string, SubjectStudentGrade[]> {
  const result: Record<string, SubjectStudentGrade[]> = {};
  const subjects = Object.keys(initialDiagnosticDatabase);

  subjects.forEach(subject => {
    result[subject] = sampleStudentNames.map((nama, idx) => {
      const lms = [
        Math.floor(Math.random() * 20) + 75,
        Math.floor(Math.random() * 20) + 75,
        Math.floor(Math.random() * 20) + 75,
        Math.floor(Math.random() * 20) + 75,
        Math.floor(Math.random() * 20) + 75
      ];
      return {
        id: idx + 1,
        nama,
        nisn: `012345670${idx + 1}`,
        lms,
        lm1: lms[0],
        lm2: lms[1],
        lm3: lms[2],
        lm4: lms[3],
        lm5: lms[4],
        sas: Math.floor(Math.random() * 20) + 75
      };
    });
  });

  return result;
}

export function generateSampleEvaluationGrades(): Record<string, StudentEvaluationGrade[]> {
  const result: Record<string, StudentEvaluationGrade[]> = {};
  const subjects = Object.keys(initialDiagnosticDatabase);

  subjects.forEach(subject => {
    result[subject] = sampleStudentNames.map((nama, idx) => ({
      id: idx + 1,
      nama,
      nisn: `012345670${idx + 1}`,
      formatif: Math.floor(Math.random() * 20) + 75,
      sumatifLM: Math.floor(Math.random() * 20) + 75,
      sumatifAS: Math.floor(Math.random() * 20) + 75,
      tindakLanjut: "Pemantapan materi rutin"
    }));
  });

  return result;
}

export const initialScheduleItems: ScheduleItem[] = [
  {
    id: 'sch-1',
    hari: 'Senin',
    jamKe: 'Jam 1 - 2',
    waktu: '07:30 - 08:50',
    kelas: 'Kelas IV A',
    matpel: 'Pendidikan Pancasila (PKN)',
    materiDefault: 'Makna Lambang dan Simbol Garuda Pancasila',
    tpDefault: 'Peserta didik mampu memahami sejarah singkat dan makna lambang Garuda Pancasila.',
    metodeDefault: 'Problem Based Learning (PBL)'
  },
  {
    id: 'sch-2',
    hari: 'Senin',
    jamKe: 'Jam 3 - 4',
    waktu: '09:05 - 10:25',
    kelas: 'Kelas IV A',
    matpel: 'Bahasa Indonesia',
    materiDefault: 'Ide Pokok dan Ide Pendukung Teks Informatif',
    tpDefault: 'Peserta didik mampu memahami dan menganalisis ide pokok dari teks informatif.',
    metodeDefault: 'Diskusi Kelompok & Presentasi'
  },
  {
    id: 'sch-3',
    hari: 'Selasa',
    jamKe: 'Jam 1 - 2',
    waktu: '07:30 - 08:50',
    kelas: 'Kelas IV A',
    matpel: 'Matematika',
    materiDefault: 'Pecahan Biasa dan Operasi Penjumlahan',
    tpDefault: 'Peserta didik mampu mengidentifikasi, membandingkan, serta mengurutkan pecahan biasa.',
    metodeDefault: 'Cooperative Learning & Alat Peraga'
  },
  {
    id: 'sch-4',
    hari: 'Selasa',
    jamKe: 'Jam 3 - 4',
    waktu: '09:05 - 10:25',
    kelas: 'Kelas IV A',
    matpel: 'IPA',
    materiDefault: 'Bentuk dan Perubahan Energi di Sekitar Kita',
    tpDefault: 'Peserta didik mampu mengidentifikasi bentuk-bentuk energi dan perubahannya.',
    metodeDefault: 'Eksperimen & Demonstration'
  },
  {
    id: 'sch-5',
    hari: 'Rabu',
    jamKe: 'Jam 1 - 2',
    waktu: '07:30 - 08:50',
    kelas: 'Kelas IV A',
    matpel: 'Bahasa Indonesia',
    materiDefault: 'Menulis Laporan Hasil Pengamatan Objek Lingkungan Sekolah',
    tpDefault: 'Peserta didik mampu menulis laporan pengamatan dengan struktur yang runtut.',
    metodeDefault: 'Project Based Learning (PjBL)'
  },
  {
    id: 'sch-6',
    hari: 'Rabu',
    jamKe: 'Jam 3 - 4',
    waktu: '09:05 - 10:25',
    kelas: 'Kelas IV A',
    matpel: 'Pendidikan Agama Islam dan Budi Pekerti',
    materiDefault: 'Membaca dan Memahami Surah Al-Hujurat',
    tpDefault: 'Peserta didik mampu membaca Al-Quran surah pilihan dengan tartil.',
    metodeDefault: 'Drill & Practice / Tilawah'
  },
  {
    id: 'sch-7',
    hari: 'Kamis',
    jamKe: 'Jam 1 - 2',
    waktu: '07:30 - 08:50',
    kelas: 'Kelas IV A',
    matpel: 'Matematika',
    materiDefault: 'Perkalian dan Pembagian Bilangan Celah Sampai 1000',
    tpDefault: 'Peserta didik mampu menyelesaikan masalah perkalian dan pembagian hingga 1.000.',
    metodeDefault: 'Latihan Terbimbing & Game Edukasi'
  },
  {
    id: 'sch-8',
    hari: 'Jumat',
    jamKe: 'Jam 1 - 2',
    waktu: '07:30 - 08:30',
    kelas: 'Kelas IV A',
    matpel: 'SBdP',
    materiDefault: 'Membuat Karya Seni Rupa Dua Dimensi dari Bahan Alam',
    tpDefault: 'Peserta didik mampu mengekspresikan ide melalui karya seni rupa dua dimensi.',
    metodeDefault: 'Praktik / Unjuk Kerja'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    id: "jrn-101",
    tanggal: "2026-08-03",
    hari: "Senin",
    jamPelajaran: "Jam 1 - 2 (07:30 - 08:50)",
    kelas: "Kelas IV A",
    matpel: "Pendidikan Pancasila (PKN)",
    materi: "Makna Lambang dan Simbol Garuda Pancasila",
    tujuanPembelajaran: "Peserta didik mampu memahami sejarah singkat dan makna lambang Garuda Pancasila.",
    metodePembelajaran: "Problem Based Learning (PBL)",
    kehadiranSiswa: { hadir: 27, sakit: 1, izin: 0, alpa: 0, keterangan: "Budi Santoso (Sakit)" },
    keteranganPelaksanaan: "Terlaksana Sepenuhnya",
    catatanRefleksi: "Pembelajaran berjalan interaktif. Siswa antusias mencocokkan kartu simbol Pancasila dengan sila yang sesuai.",
    createdAt: "2026-08-03T09:00:00.000Z"
  },
  {
    id: "jrn-102",
    tanggal: "2026-08-04",
    hari: "Selasa",
    jamPelajaran: "Jam 1 - 2 (07:30 - 08:50)",
    kelas: "Kelas IV A",
    matpel: "Matematika",
    materi: "Pecahan Biasa dan Operasi Penjumlahan",
    tujuanPembelajaran: "Peserta didik mampu mengidentifikasi, membandingkan, serta mengurutkan pecahan biasa.",
    metodePembelajaran: "Cooperative Learning & Alat Peraga",
    kehadiranSiswa: { hadir: 28, sakit: 0, izin: 0, alpa: 0, keterangan: "Hadir Semua" },
    keteranganPelaksanaan: "Terlaksana Sepenuhnya",
    catatanRefleksi: "Penggunaan media kertas lipat sangat membantu pemahaman konsep pecahan 1/2, 1/4, dan 3/4.",
    createdAt: "2026-08-04T09:00:00.000Z"
  }
];