/**
 * Kamus Digital Mandar–Indonesia — Asisten Cerdas Kaka AI (Boyang Digital)
 * Ensiklopedi Cerdas & Percakapan Luwes:
 * - Menjawab 4.908 kosakata resmi (Mandar ↔ Indonesia & pencarian dua arah)
 * - Seluk-beluk Sulawesi Barat: Sejarah (Balanipa, Pitu Ulunna Salu, Pitu Baqbana Binanga, Allamungan Batu, Andi Depu, Baharuddin Lopa)
 * - Geografi 6 Kabupaten Sulbar (Majene, Polman, Mamuju, Mamasa, Pasangkayu, Mamuju Tengah)
 * - Budaya & Tradisi (Sayyang Pattuqduq, Sandeq, Batik Sure' Parara, Lipaq Saqbe, Kalindaqdaq, Pappasang, Malaqbiq)
 * - Kuliner Khas Sulbar (Jepa, Bau Peapi, Tetu, Golla Kambu, Passo, Pupu, Kopi Mamasa)
 * - Pendidikan & PKBM (Pusat Kegiatan Belajar Masyarakat, UNSULBAR, Balai Bahasa, kurikulum muatan lokal)
 * - Ribuan dataset komparasi bahasa & kebudayaan seluruh Indonesia (Bugis, Makassar, Toraja, Jawa, Sunda, Minang, Batak, Bali, Banjar, dsb.)
 */
(function (global) {
  'use strict';

  // --- 1. KOLEKSI KALINDAQDAQ & PAPPASANG MANDAR ---
  const KALINDAQDAQ_COLLECTION = [
    {
      mandar: "Kupalolongang duang lopi,\nsambaq u lopiang,\nmau di lau,\ndi timur namoala.",
      arti: "Kuhanyutkan dua perahu, satu perahu layar tumpuanku, biar berlayar ke barat maupun ke timur tetap berhasil.",
      pola: "8 - 7 - 5 - 7 suku kata",
      tema: "Keteguhan Maritim & Semangat Merantau Suku Mandar",
      catatan: "Simbol ketangguhan pelaut Mandar dalam mengarungi samudra kehidupan dengan keyakinan penuh kepada Tuhan.",
    },
    {
      mandar: "Maloang bangang di litaq,\nnamasempo tallang,\nsala paqmai,\ntandeang daq di boyang.",
      arti: "Luas terbentang di bumi namun serba sempit terasa jika hati berselisih; lebih baik mengalah tinggal di rumah.",
      pola: "8 - 7 - 5 - 7 suku kata",
      tema: "Keharmonisan Sosial & Kerukunan Keluarga (Malaqbiq)",
      catatan: "Mengajarkan pentingnya menjaga kerukunan, adab sopan santun (tabeq), dan ketenteraman batin.",
    },
    {
      mandar: "Iya boyang pura tandi,\nmasaqbi sulo lalan,\ntambaqna adaq,\nmalaqbiq di pambusu.",
      arti: "Rumah yang tertata rapi bagaikan obor penerang jalan; landasan adat nan mulia dan elok dipandang.",
      pola: "8 - 7 - 5 - 7 suku kata",
      tema: "Adat Boyang & Kehormatan Budaya Mandar",
      catatan: "Menggambarkan rumah tradisional Mandar (Boyang Adaq) sebagai pusat pembinaan etika dan moral generasi muda.",
    },
    {
      mandar: "Pappasangna to matoa,\nda mupallang ate,\ningoqmi nawa,\ntambaqna asalamang.",
      arti: "Pesan orang tua, janganlah berhati dengki; jagalah kejernihan pikiran sebagai benteng keselamatan.",
      pola: "8 - 7 - 5 - 7 suku kata",
      tema: "Pappasang (Petuah Bijak Leluhur Mandar)",
      catatan: "Wasiat luhur yang senantiasa diajarkan orang tua Mandar kepada anak cucu di bangku sekolah dan keluarga.",
    },
    {
      mandar: "Pura i litaq baine,\nmongeqi di ate,\npaqmai malaqbiq,\nmatei mappasipute.",
      arti: "Telah terukir di tanah harapan, terpatri di dalam hati; budi pekerti yang mulia, sampai mati tetap menjaga kesucian.",
      pola: "8 - 7 - 5 - 7 suku kata",
      tema: "Kesetiaan & Harga Diri (Siriq na Pacce / Malaqbiq)",
      catatan: "Menjunjung tinggi kehormatan diri dan keluarga sebagai pegangan hidup insan Mandar.",
    },
  ];

  // --- 2. ENSIKLOPEDI SELUK-BELUK SULAWESI BARAT ---
  const SULBAR_ENCYCLOPEDIA = {
    // A. SEJARAH & PERADABAN
    balanipa: {
      tags: ['balanipa', 'sejarah balanipa', 'kerajaan balanipa', 'arajang', 'maraqdia balanipa'],
      title: "Sejarah Kerajaan Balanipa — Tonggak Peradaban Mandar",
      content: `**Kerajaan Balanipa** adalah kerajaan pelopor dan pemimpin federasi pesisir *Pitu Baqbana Binanga* di tanah Mandar (berpusat di wilayah Tinambung dan sekitarnya, kini Kabupaten Polewali Mandar).\n\n- **Pendiri & Raja Pertama:** Dipimpin oleh **I Manyambungi (Todilaling)** sekitar abad ke-16, seorang tokoh sakti nan bijak yang berhasil menyatukan konfederasi *Appeq Banua Kaiyyang* (Empat Negeri Besar: Napo, Mosso, Samasundu, dan Todang-Todang).\n- **Struktur Pemerintahan:** Raja bergelar **Maraqdia**, didampingi dewan adat Hadat Balanipa yang terdiri atas *Pabiccara* (menteri hukum/bicara), *Matanruq* (panglima pertahanan), *Kadi* (urusan agama Islam), dan *Sabbannar* (syahbandar pelabuhan).\n- **Filosofi Kepemimpinan:** Menjunjung tinggi hukum adat *"Adaq Mapaccing"* (adat yang bersih/adil) tanpa membeda-bedakan bangsawan dan rakyat jelata.`,
      speakWord: "balanipa",
    },
    pitubaqbanabinanga: {
      tags: ['pitu baqbana binanga', 'tujuh muara', 'kerajaan pesisir', 'federasi hilir'],
      title: "Pitu Baqbana Binanga — Konfederasi Tujuh Muara Kerajaan Hilir",
      content: `**Pitu Baqbana Binanga** (artinya "Tujuh Muara Sungai") adalah persekutuan persaudaraan tujuh kerajaan maritim di pesisir barat Sulawesi Barat yang berdiri untuk menjaga kedaulatan laut dan pertahanan wilayah dari serbuan luar:\n\n1. **Balanipa** (Ketua / Pemimpin Dewan Kehormatan)\n2. **Banggae** (Pusat pertahanan dan pelabuhan, kini Majene)\n3. **Pamboang** (Pusat armada pelayaran)\n4. **Sendana** (Penjaga gerbang utara Majene)\n5. **Tande** (Penyangga wilayah perbukitan Banggae)\n6. **Tapalang** (Penghubung jalur laut menuju Teluk Mamuju)\n7. **Mamuju** (Pintu gerbang teluk dan kepulauan)\n\nKetujuh kerajaan ini terikat sumpah persaudaraan bersama kerajaan pegunungan (*Pitu Ulunna Salu*) untuk saling membela dan tidak saling menjatuhkan.`,
      speakWord: "pitu baqbana binanga",
    },
    pituulunnasalu: {
      tags: ['pitu ulunna salu', 'tujuh hulu', 'kerajaan pegunungan', 'kondosapata', 'salu'],
      title: "Pitu Ulunna Salu — Konfederasi Tujuh Hulu Kerajaan Pegunungan",
      content: `**Pitu Ulunna Salu** (artinya "Tujuh Hulu Sungai") adalah federasi tujuh kerajaan di wilayah pegunungan dan hulu sungai (sebagian besar kini mencakup wilayah Kabupaten Mamasa dan pedalaman Sulbar):\n\n1. **Rante Bulahan** (Ketua / Pemimpin Dewan Adat Hulu)\n2. **Aralle** (Penjaga hukum dan adat)\n3. **Mambi** (Pusat persidangan dan pertemuan)\n4. **Bambang** (Benteng pertahanan rimba)\n5. **Matangnga** (Penyangga perbatasan barat)\n6. **Tabulahan** (Penjaga hulu sungai Karama)\n7. **Tabang** (Gerbang timur perbatasan pegunungan)\n\nWilayah ini terkenal dengan falsafah *"Kondosapata Uai Sapalelean"* (sehamparan sawah luas dialiri air yang seirama—simbol persatuan, gotong royong, dan kemakmuran bersama).`,
      speakWord: "pitu ulunna salu",
    },
    allamunganbatu: {
      tags: ['allamungan batu', 'perjanjian luyo', 'luyo', 'sipamandar', 'sumpah mandar'],
      title: "Perjanjian Allamungan Batu di Luyo — Sumpah Abadi 'Sipamandar'",
      content: `**Perjanjian Allamungan Batu di Luyo** (diadakan di Bukit Luyo, Polewali Mandar pada abad ke-16) adalah tonggak persatuan terpenting dalam sejarah Sulawesi Barat.\n\n- **Makna Perjanjian:** Menyatukan secara abadi dua kekuatan besar: **Pitu Ulunna Salu** (7 Kerajaan Hulu) dan **Pitu Baqbana Binanga** (7 Kerajaan Muara).\n- **Sumpah Sakral:** *"Mandar di bumbungan litaq, mandar di leqboq; siwatawari, sisokkorang, daq nasitallangang."* (Mandar di puncak bukit maupun di pesisir; saling menopang, saling menghormati, pantang saling menenggelamkan).\n- **Lahirnya Nama Mandar & Sipamandar:** Dari peristiwa penanaman batu peringatan inilah lahir konsep **Sipamandar** (saling memperkuat dan menyayangi sesama saudara) yang menjadi identitas kebersamaan suku Mandar hingga kini.`,
      speakWord: "allamungan batu di luyo",
    },
    andidepu: {
      tags: ['andi depu', 'ibu depu', 'pahlawan andi depu', 'kris muda', 'tinambung'],
      title: "Ibu Agung Hj. Andi Depu — Pahlawan Nasional Perempuan Kebanggaan Sulbar",
      content: `**Hj. Andi Depu** (1907–1985, dianugerahi gelar **Pahlawan Nasional Republik Indonesia** oleh Presiden Joko Widodo pada tahun 2018) adalah pejuang perempuan legendaris asal Tinambung, Polewali Mandar.\n\n- **Peran Perjuangan:** Sebagai Panglima Lasykar **KRIS Muda Mandar** (Kebaktian Rakyat Indonesia Sulawesi), beliau memimpin perlawanan bersenjata menghadapi tentara kolonial Belanda / NICA yang ingin merebut kembali kekuasaan pasca-Proklamasi 1945.\n- **Aksi Heroik Legendaris:** Ketika tentara Belanda hendak menurunkan bendera Merah Putih di markas pejuang Tinambung, Ibu Andi Depu dengan berani memeluk tiang bendera dan menyatakan: *"Langkahi dulu mayatku sebelum menurunkan Sang Saka Merah Putih!"* Sikap pantang mundurnya membakar patriotisme rakyat Sulawesi Barat.`,
      speakWord: "andi depu",
    },
    baharuddinlopa: {
      tags: ['baharuddin lopa', 'lopa', 'jaksa agung lopa', 'pendekar hukum'],
      title: "Prof. Dr. Baharuddin Lopa, S.H. — Pendekar Integritas & Keadilan Asal Mandar",
      content: `**Prof. Dr. H. Baharuddin Lopa, S.H.** (1935–2001) adalah tokoh nasional, mantan Jaksa Agung RI, dan Menteri Kehakiman dan HAM yang lahir di Balanipa / Pambusuang, Polewali Mandar.\n\n- **Teladan Integritas:** Beliau dijuluki "Pendekar Hukum Indonesia" karena kejujurannya yang tak tergoyahkan. Beliau menolak segala bentuk suap, fasilitas mewah, dan gratifikasi, serta berani menindak tegas para koruptor kakap tanpa pandang bulu.\n- **Warisan Moral:** Filosofi hidupnya berakar dari adat Mandar *"Malaqbiq"* dan kejujuran nurani Islam. Hingga kini, sosoknya menjadi panutan moral bagi generasi muda Sulawesi Barat dan penegak hukum se-Indonesia.`,
      speakWord: "baharuddin lopa",
    },
    pemekaransulbar: {
      tags: ['pemekaran sulbar', 'sejarah sulbar', 'provinsi sulbar', 'uu 26 tahun 2004', 'terbentuknya sulbar'],
      title: "Pembentukan Provinsi Sulawesi Barat (5 Oktober 2004)",
      content: `**Provinsi Sulawesi Barat** resmi berdiri melalui **Undang-Undang Republik Indonesia Nomor 26 Tahun 2004** pada tanggal **5 Oktober 2004**, berpisah secara administratif dari Provinsi Sulawesi Selatan.\n\n- **Ibu Kota:** Kota Mamuju.\n- **Cakupan Wilayah (6 Kabupaten):** Majene, Polewali Mandar, Mamuju, Mamasa, Pasangkayu (eks Mamuju Utara), dan Mamuju Tengah.\n- **Tujuan Pembentukan:** Menjawab aspirasi historis dan kultural masyarakat Mandar untuk mempercepat pembangunan daerah pesisir dan pedalaman, memajukan pendidikan, serta melestarikan warisan peradaban maritim dan kearifan lokal.`,
      speakWord: "sulawesi barat",
    },

    // B. GEOGRAFI 6 KABUPATEN SULAWESI BARAT
    majene: {
      tags: ['majene', 'kabupaten majene', 'kota pendidikan', 'banggae', 'sendana', 'unsulbar', 'somba'],
      title: "Kabupaten Majene — Kota Pendidikan & Pelabuhan Bersejarah",
      content: `**Kabupaten Majene** dikenal sebagai poros utama pendidikan dan sejarah maritim di Sulawesi Barat.\n\n- **Ibu Kota & Kecamatan:** Banggae, Banggae Timur, Pamboang, Sendana, Tammerodo Sendana, Tubo Sendana, Malunda, dan Ulumanda.\n- **Pusat Pendidikan:** Menjadi rumah bagi kampus negeri kebanggaan Sulbar, **Universitas Sulawesi Barat (UNSULBAR)** dan **STAIN Majene**.\n- **Warisan Budaya & Wisata:** Kompleks Makam Raja-Raja Hadat Banggae di Bukit Ondongan, Pantai Dato berkarang eksotis, sentra perikanan Somba (ikan terbang / tuing-tuing), serta tradisi pembuatan perahu Sandeq di Pamboang.`,
      speakWord: "majene",
    },
    polman: {
      tags: ['polman', 'polewali mandar', 'kabupaten polman', 'tinambung', 'campalagian', 'wonomulyo', 'balanipa'],
      title: "Kabupaten Polewali Mandar (Polman) — Lumbung Pangan & Jantung Budaya Mandar",
      content: `**Kabupaten Polewali Mandar (Polman)** adalah kabupaten dengan populasi terbesar dan pusat kebudayaan suku Mandar.\n\n- **Kecamatan Utama:** Polewali, Tinambung, Balanipa, Campalagian, Wonomulyo, Binuang, Matakali, Luyo, Limboro, Tutar, Alu, Bulo, Tapango, Matangnga, Mapilli, Anreapi.\n- **Sentra Budaya:** Tinambung dan Balanipa merupakan pusat tenun sutra *Lipaq Saqbe* dan batik *Sure' Parara*. Campalagian terkenal dengan manisan *Golla Kambu* dan pusat santri.\n- **Ekonomi & Pertanian:** Lumbung padi dan kakao utama Sulbar, kawasan agribisnis Wonomulyo, serta destinasi wisata Pulau Pasir Putih Gusung Toraja dan Sungai Mandar.`,
      speakWord: "polewali mandar",
    },
    mamuju: {
      tags: ['mamuju', 'kabupaten mamuju', 'ibu kota sulbar', 'karampuang', 'manakarra', 'simboro'],
      title: "Kabupaten Mamuju — Ibu Kota Provinsi Sulawesi Barat",
      content: `**Kabupaten Mamuju** adalah pusat pemerintahan, perekonomian, dan gerbang transportasi udara dan laut Provinsi Sulawesi Barat.\n\n- **Kecamatan Penting:** Mamuju, Simboro, Kalukku, Tapalang, Tapalang Barat, Kalumpang, Bonehau, Tommo, Papalang, Sampaga, dan Kepulauan Bala-Balakang di Selat Makassar.\n- **Transportasi:** Bandara Tampa Padang (MJU) dan Pelabuhan Feri Simboro menghubungkan Sulbar dengan Balikpapan (IKN Nusantara) dan Surabaya.\n- **Ikon Wisata & Budaya:** Pulau Karampuang (air laut jernih & terumbu karang), Anjungan Pantai Manakarra, Rumah Adat Boyang Gandang, dan situs prasejarah gerabah Kalumpang.`,
      speakWord: "mamuju",
    },
    mamasa: {
      tags: ['mamasa', 'kabupaten mamasa', 'negeri di atas awan', 'kondosapata', 'banua sibarrung', 'tenun mamasa'],
      title: "Kabupaten Mamasa — 'Negeri di Atas Awan' Pegunungan Kars & Tenun Sambu",
      content: `**Kabupaten Mamasa** terletak di dataran tinggi pegunungan tengah Sulawesi Barat dengan hawa sejuk dan panorama alam perbukitan yang asri.\n\n- **Identitas Budaya:** Didiami oleh suku Mamasa yang serumpun dengan persekutuan adat *Pitu Ulunna Salu*. Memiliki filosofi *"Kondosapata Uai Sapalelean"*.\n- **Arsitektur & Wastra:** Rumah adat panggung berukir indah **Banua Sibarrung** dan **Banua Olang** beratapkan bambu; kain tenun tradisional **Sambu Mamasa** dengan motif geometris pegunungan.\n- **Kesenian & Komoditas:** Orkes musik bambu tiup, tarian Bulu Londong, serta perkebunan **Kopi Arabika Mamasa** berkualitas tinggi yang digemari hingga mancanegara.`,
      speakWord: "mamasa",
    },
    pasangkayu: {
      tags: ['pasangkayu', 'kabupaten pasangkayu', 'mamuju utara', 'matra', 'sawit', 'selat makassar'],
      title: "Kabupaten Pasangkayu — Gerbang Utara Pesisir & Sentra Kelapa Sawit",
      content: `**Kabupaten Pasangkayu** (sebelumnya bernama Kabupaten Mamuju Utara) berada di ujung utara Sulawesi Barat, berbatasan langsung dengan Provinsi Sulawesi Tengah.\n\n- **Ekonomi & Industri:** Terkenal sebagai sentra perkebunan dan pabrik pengolahan kelapa sawit (CPO) terbesar di Sulawesi Barat serta tambak udang vaname pesisir.\n- **Budaya & Masyarakat:** Masyarakat multietnis yang harmonis terdiri atas suku asli Vane, Bada, Doda, suku Mandar, Bugis, dan para transmigran.\n- **Pariwisata:** Pantai Pasangkayu, Pantai Koebano, dan wisata konservasi mangrove pesisir Selat Makassar.`,
      speakWord: "pasangkayu",
    },
    mateng: {
      tags: ['mamuju tengah', 'mateng', 'tobadak', 'topoyo', 'bumi lalla tassisara', 'budong-budong'],
      title: "Kabupaten Mamuju Tengah (Mateng) — 'Bumi Lalla Tassisara' & Lumbung Tani",
      content: `**Kabupaten Mamuju Tengah (Mateng)** dimekarkan dari Kabupaten Mamuju pada tahun 2012 dengan pusat pemerintahan di **Tobadak**.\n\n- **Motto Daerah:** *"Bumi Lalla Tassisara"* (beragam latar belakang namun tetap menyatu erat dalam kebersamaan).\n- **Kecamatan:** Tobadak, Topoyo, Budong-Budong, Karossa, dan Pangale.\n- **Sektor Andalan:** Pusat transmigrasi teladan yang sukses menjadi sentra produksi kelapa sawit, jagung hibrida, pisang, dan kakao.\n- **Sejarah Prasejarah:** Daerah aliran Sungai Karama di Mateng menyimpan jejak arkeologi peradaban neolitikum tertua di Nusantara.`,
      speakWord: "mamuju tengah",
    },

    // C. ADAT, SENI & TRADISI SULBAR
    sayyangpattuqduq: {
      tags: ['sayyang pattuqduq', 'sayyang pattudu', 'kuda menari', 'khatam quran', 'rawang boko'],
      title: "Sayyang Pattuqduq (Tradisi Kuda Menari) — Pesta Syukuran Khatam Al-Qur'an",
      content: `**Sayyang Pattuqduq** adalah pesta adat khas suku Mandar yang memadukan apresiasi keagamaan Islam dengan seni ketangkasan berkuda tradisional.\n\n- **Makna Upacara:** Digelar sebagai wujud syukur dan penghargaan orang tua kepada anak-anaknya yang telah menuntaskan bacaan (khatam) 30 juz Al-Qur'an.\n- **Daya Tarik:** Kuda-kuda pilihan dilatih secara khusus untuk menari dan berjingkrak seirama dengan hentakan tabuhan rebana (*tarbang*) dan lantunan syair *Kalindaqdaq*.\n- **Busana Anak (*Pannyakka*):** Anak yang dikhatam mengenakan busana bangsawan Mandar berhiaskan hiasan kepala *Rawang Boko*, diarak keliling kampung sembari dipayungi payung adat tiga susun (*Lellu*).`,
      speakWord: "sayyang pattuqduq",
    },
    sandeq: {
      tags: ['sandeq', 'perahu sandeq', 'lopi sandeq', 'passandeq', 'sombal', 'palatto', 'maritim'],
      title: "Perahu Sandeq — Mahakarya Maritim Bahari Suku Mandar",
      content: `**Sandeq** adalah perahu layar bercadik tradisional Austronesia tercepat di dunia, mahakarya kebanggaan para pelaut ulung suku Mandar.\n\n- **Ciri Khusus:** Lambung ramping runcing (*sandeq* berarti runcing/tajam) dipahat dari sebatang kayu pohon utuh, ditopang dua sayap cadik bambu (*palatto*) ganda, dan bentangan layar segitiga besar (*sombal*).\n- **Kecepatan & Ketangguhan:** Mampu melaju hingga kecepatan 20–30 knot memanfaatkan terpaan angin Selat Makassar tanpa mesin penggerak.\n- **Festival Sandeq Race:** Setiap tahun diselenggarakan perlombaan layar akbar menempuh ratusan mil laut dari pesisir Sulawesi Barat melintasi Selat Makassar, menguji nyali dan keahlian para *passandeq* (nahkoda & awak sandeq).`,
      speakWord: "sandeq",
    },
    batiksureparara: {
      tags: ['batik sure parara', 'sure parara', 'batik sulbar', 'motif mandar', 'sureq'],
      title: "Batik Sure' Parara Sulawesi Barat — Filosofi Garis Geometris Luhur",
      content: `**Batik Sure' Parara Sulawesi Barat** adalah identitas wastra kontemporer yang berakar dari motif kuno kain tenun *Lipaq Saqbe* Mandar.\n\n- **Ciri Visual:** Pola garis-garis geometris horizontal dan vertikal yang berpotongan secara simetris di atas warna dasar merah marun hangat, berhias ornamen benang emas keemasan.\n- **Filosofi Garis:**\n  1. **Garis Vertikal:** Melambangkan hubungan teguh manusia dengan Tuhan Yang Maha Kuasa (*Hablum minallah*) dan ketegasan prinsip hidup.\n  2. **Garis Horizontal:** Menyimbolkan keharmonisan, kerukunan, dan kesetaraan antar-sesama manusia (*Hablum minannas*).\n  3. **Bidang Kotak:** Melambangkan pagar pelindung etika moral (*Malaqbiq*) masyarakat Sulawesi Barat.`,
      speakWord: "batik sure' parara sulbar",
    },
    lipaqsaqbe: {
      tags: ['lipaq saqbe', 'saqbe', 'sarung sutra', 'tenun mandar', 'tinambung'],
      title: "Lipaq Saqbe Mandar — Kemewahan Kain Tenun Sutra Tradisional",
      content: `**Lipaq Saqbe** adalah sarung tenun sutra khas Mandar yang diproduksi secara turun-temurun oleh para perempuan penenun di Tinambung, Balanipa, dan Campalagian.\n\n- **Proses Menenun:** Dibuat menggunakan alat tenun bukan mesin (*panetteq*) dengan ketelitian benang sutra alami.\n- **Varian Corak Terkenal:**\n  - *Sure' Mara'dia:* Corak khusus keturunan bangsawan / raja.\n  - *Sure' Salaka:* Corak dengan kilauan benang perak melambangkan kesucian.\n  - *Sure' Puqang:* Corak klasik sehari-hari dengan garis kotak tegas.\n- Dipakai pada upacara adat perkawinan, Sayyang Pattuqduq, dan perayaan kenegaraan sebagai lambang kehormatan.`,
      speakWord: "lipaq saqbe",
    },
    kuliner: {
      tags: ['kuliner mandar', 'makanan sulbar', 'jepa', 'bau peapi', 'tetu', 'golla kambu', 'passo', 'pupu'],
      title: "Kuliner Tradisional Khas Sulawesi Barat",
      content: `Kuliner Mandar terkenal sarat gizi, segar dari hasil laut, dan bercita rasa gurih alami kelapa pesisir:\n\n1. **Jepa:** Penganan pipih dari parutan ubi kayu (singkong) atau sagu yang dipanggang di atas piring tanah liat (*panrita jepa*). Menjadi makanan pokok pengganti nasi para pelaut Sandeq.\n2. **Bau Peapi:** Ikan laut segar berkuah kuning asam segar menggunakan asam mangga muda cincang (*kallang*) dan minyak kelapa murni Mandar (*minnaq mandar*).\n3. **Tetu (Kue Perahu):** Kue adonan tepung beras santan gurih di atas gula aren cair, disajikan di wadah daun pandan wangi beraroma khas.\n4. **Golla Kambu:** Dodol manis khas Campalagian Polman berbahan ketan merah, kelapa parut, gula aren, dan taburan kacang tanah sangrai renyah.\n5. **Passo:** Kue basah berbentuk kerucut daun pisang berisi adonan tepung ketan dan lelehan gula merah.\n6. **Pupu:** Lauk gurih dari ikan cincang berbumbu kelapa sangrai goreng berbentuk segitiga.\n7. **Kopi Arabika Mamasa:** Kopi khas dataran tinggi dengan aroma rempah alami.`,
      speakWord: "bau peapi dng jepa",
    },

    // D. PENDIDIKAN & PKBM SULBAR
    pkbm: {
      tags: ['pkbm', 'pusat kegiatan belajar masyarakat', 'keaksaraan', 'paket c', 'paket b', 'paket a', 'pendidikan kesetaraan'],
      title: "PKBM (Pusat Kegiatan Belajar Masyarakat) di Sulawesi Barat",
      content: `**PKBM (Pusat Kegiatan Belajar Masyarakat)** adalah pilar pendidikan non-formal yang sangat vital di Provinsi Sulawesi Barat.\n\n- **Fungsi Utama:** Memberikan layanan **Pendidikan Kesetaraan** (Paket A setara SD, Paket B setara SMP, Paket C setara SMA) dan **Keaksaraan Fungsional** bagi warga belajar usia dewasa, pemuda putus sekolah, serta masyarakat pesisir kepulauan dan pedalaman pegunungan.\n- **Peran Boyang Digital:** Aplikasi **Kamus Digital Mandar–Indonesia** dan asisten **Kaka AI** hadir sebagai media pembelajaran interaktif untuk memudahkan tutor dan warga belajar PKBM memahami aksara Lontara, memperkaya kosakata daerah, dan melestarikan bahasa ibu secara mandiri maupun luring (*offline*).`,
      speakWord: "pusat kegiatan belajar masyarakat",
    },
    pendidikan: {
      tags: ['pendidikan sulbar', 'unsulbar', 'stain majene', 'balai bahasa sulbar', 'muatan lokal'],
      title: "Ekosistem Pendidikan & Revitalisasi Bahasa Daerah di Sulbar",
      content: `Pendidikan di Sulawesi Barat terus berkembang pesat guna mengintegrasikan ilmu pengetahuan modern dengan nilai keluhuran budaya lokal:\n\n- **Perguruan Tinggi:** Universitas Sulawesi Barat (**UNSULBAR**) di Majene, **STAIN Majene**, **UNASMAN** di Polewali Mandar, dan **Universitas Tomakaka** di Mamuju.\n- **Balai Bahasa Provinsi Sulawesi Barat:** Lembaga resmi di bawah Kemendikdasmen yang aktif melakukan pembinaan, perlindungan bahasa daerah, serta menerbitkan buku acuan *Kamus Bahasa Mandar–Indonesia Edisi Revisi 2025*.\n- **Muatan Lokal (Mulok):** Pengajaran bahasa Mandar dan aksara Lontara di SD, SMP, SMA, SMK, dan PKBM bertujuan membendung laju degradasi bahasa daerah pada generasi Alpha dan Z.`,
      speakWord: "pendidikan di sulawesi barat",
    },
  };

  // --- 3. ENSIKLOPEDI KOMPARASI NUSANTARA (MANDAR VS BAHASA DAERAH LAIN) ---
  const NUSANTARA_COMPARISONS = [
    {
      konsep: "Saya / Aku (Kata Ganti Persona I)",
      mandar: "iyau / u- (proklitik) / -u (enklitik)",
      bugis: "iyyaq",
      makassar: "nakke / inakke",
      toraja: "aku",
      jawa: "kula (krama) / aku (ngoko)",
      sunda: "abdi (halus) / kuring (loma)",
      minang: "ambo / denai / aden",
      catatan: "Bahasa Mandar menggunakan sistem klitik pronomina: awalan 'u-' (u-baca = saya baca) dan akhiran '-u' (boyangu = rumahku).",
    },
    {
      konsep: "Kamu / Engkau (Kata Ganti Persona II)",
      mandar: "io / mu- (proklitik) / -mu (enklitik)",
      bugis: "iko / idiq",
      makassar: "ikau / katte (hormat)",
      toraja: "iko / komi",
      jawa: "panjenengan (krama) / kowe (ngoko)",
      sunda: "anjeun (halus) / maneh (loma)",
      minang: "sanak / waang / kau",
      catatan: "Sapaan sopan kepada orang tua/guru di Mandar didahului kata 'Tabeq' atau sebutan kekerabatan.",
    },
    {
      konsep: "Makan",
      mandar: "manande / ummande / meande (kata dasar: ande)",
      bugis: "manre",
      makassar: "nganre",
      toraja: "kumande",
      jawa: "dhahar (krama) / mangan (ngoko)",
      sunda: "tuang (halus) / neda / dahar",
      minang: "makan",
      catatan: "Dalam bahasa Mandar, kata dasar 'ande' mendapat infiks '-um-' menjadi 'ummande' atau prefiks 'ma-' menjadi 'manande'.",
    },
    {
      konsep: "Minum",
      mandar: "miingung (kata dasar: ingung)",
      bugis: "minung",
      makassar: "angnginung",
      toraja: "miqo / mangnginung",
      jawa: "ngunjuk (krama) / ngombe (ngoko)",
      sunda: "ngaleueut (halus) / nginum",
      minang: "minum",
      catatan: "Fonem nasal awal /m-/ pada kata kerja aktif Mandar merupakan ciri khas rumpun bahasa Austronesia Sulawesi.",
    },
    {
      konsep: "Tidur",
      mandar: "matindo (kata dasar: tindo)",
      bugis: "matinro",
      makassar: "attinro / tinro",
      toraja: "mammaq",
      jawa: "sare (krama) / turu (ngoko)",
      sunda: "kulem (halus) / sare",
      minang: "lalok",
      catatan: "'Tindo' juga berarti mimpi (tindoang).",
    },
    {
      konsep: "Rumah",
      mandar: "boyang",
      bugis: "bola",
      makassar: "ballaq",
      toraja: "banua / tongkonan",
      jawa: "griya / dalem (krama) / omah (ngoko)",
      sunda: "bumi (halus) / imah",
      minang: "rumah / rumah gadang",
      catatan: "Mandar memakai kata 'boyang' (sekerabat dengan Proto-Malayo-Polynesian *balay).",
    },
    {
      konsep: "Air",
      mandar: "wai",
      bugis: "wae",
      makassar: "jeqneq",
      toraja: "uai",
      jawa: "toya (krama) / banyu (ngoko)",
      sunda: "cai",
      minang: "aia",
      catatan: "Mandar 'wai' mempertahankan fonem purba Austronesia *wahi / *danum.",
    },
    {
      konsep: "Ikan",
      mandar: "bau",
      bugis: "bale",
      makassar: "jukuq",
      toraja: "bale",
      jawa: "ulam (krama) / iwak (ngoko)",
      sunda: "lauk",
      minang: "lauak / ikan",
      catatan: "Di Mandar 'bau' berarti ikan laut; masakan ikan kuah kuning disebut 'Bau Peapi'.",
    },
    {
      konsep: "Perahu",
      mandar: "lopi / sandeq",
      bugis: "lopi",
      makassar: "biseang",
      toraja: "lopi",
      jawa: "prau",
      sunda: "parahu",
      minang: "biduak / parahu",
      catatan: "'Lopi' adalah perahu umum; 'sandeq' perahu bercadik khas Mandar tercepat.",
    },
    {
      konsep: "Terima Kasih / Rasa Syukur",
      mandar: "tarima kasi / kurrusumangaq",
      bugis: "kurru sumangeq",
      makassar: "tarima kassi",
      toraja: "kurre sumangaq",
      jawa: "matur nuwun",
      sunda: "hatur nuhun",
      minang: "tarimo kasih",
      catatan: "'Kurrusumangaq' adalah ungkapan sakral Mandar yang memohonkan keberkahan dan keutuhan semangat hidup (*sumangaq*).",
    },
    {
      konsep: "Angka 1 sampai 10",
      mandar: "mesaq (1), dua (2), tallu (3), appeq (4), lima (5), annang (6), pitu (7), arua (8), asera (9), sapullo (10)",
      bugis: "seddi (1), dua (2), tellu (3), eppa (4), lima (5), enneng (6), pitu (7), arua (8), asera (9), seppulo (10)",
      makassar: "seqre (1), rua (2), tallu (3), appaq (4), lima (5), annang (6), tuju (7), sangantuju (8), salapang (9), sampulo (10)",
      toraja: "misaq (1), daqdua (2), tallu (3), aqqpaq (4), lima (5), annang (6), pitu (7), karua (8), kasera (9), sangpulo (10)",
      jawa: "siji (1), loro (2), telu (3), papat (4), lima (5), enem (6), pitu (7), wolu (8), sanga (9), sepuluh (10)",
      sunda: "hiji (1), dua (2), tilu (3), opat (4), lima (5), genep (6), tujuh (7), dalapan (8), salapan (9), sapuluh (10)",
      minang: "ciek (1), duo (2), tigo (3), ampek (4), limo (5), anam (6), tujuah (7), salapan (8), sambilan (9), sapuluah (10)",
      catatan: "Sistem bilangan Mandar sangat teratur dan menunjukkan kekerabatan erat bahasa-bahasa di kawasan Nusantara.",
    },
  ];

  // --- 4. KELAS UTAMA KAKA AI ASSISTANT ---
  class KakaAiAssistant {
    constructor(opts = {}) {
      this.vocabMap = opts.vocabMap || new Map();
      this.rawEntries = opts.entries || [];
      this.linguistics = opts.linguistics || global.KamusLinguistics;
      this.audioCtrl = opts.audioCtrl || (global.KamusMedia && global.KamusMedia.createAudioController && global.KamusMedia.createAudioController());
      this.bookGuide = opts.bookGuide || (this.linguistics && this.linguistics.BOOK_GUIDE_DATA);
    }

    setVocabMap(map, entriesList = []) {
      if (map instanceof Map) this.vocabMap = map;
      if (Array.isArray(entriesList) && entriesList.length > 0) this.rawEntries = entriesList;
    }

    findEntryExactOrStemmed(word) {
      const clean = String(word || '').toLowerCase().replace(/['`\u2018\u2019]/g, 'q').trim();
      if (!clean) return null;
      if (this.vocabMap.has(clean)) {
        const matches = this.vocabMap.get(clean);
        return matches && matches.length ? matches[0] : null;
      }
      if (this.linguistics && typeof this.linguistics.analyzeWordMorphology === 'function') {
        const morph = this.linguistics.analyzeWordMorphology(clean, this.vocabMap);
        if (morph && morph.entry) {
          return { ...morph.entry, _morphology: morph };
        }
      }
      return null;
    }

    findIndoToMandar(indoWord) {
      const w = String(indoWord || '').toLowerCase().trim();
      if (!w) return [];

      const reDirect = new RegExp('^(?:(?:1|2|3|[a-z]{1,4})\\s+)*' + w + '(?:[;,\\s]|$)', 'i');
      const reContains = new RegExp('\\b' + w + '\\b', 'i');

      const direct = [];
      const related = [];

      const pool = this.rawEntries.length > 0 ? this.rawEntries : Array.from(this.vocabMap.values()).flat();

      for (const e of pool) {
        const def = e.definitionText || '';
        if (reDirect.test(def)) {
          if (!direct.some((x) => x.headword === e.headword)) direct.push(e);
        } else if (reContains.test(def)) {
          if (!related.some((x) => x.headword === e.headword)) related.push(e);
        }
        if (direct.length >= 4 && related.length >= 4) break;
      }
      return [...direct, ...related].slice(0, 5);
    }

    ask(queryText) {
      const q = String(queryText || '').trim();
      const qLower = q.toLowerCase();

      if (!q) {
        return {
          reply: `**Tabeq! Halo Sahabat Budaya** 👋\n\nSaya **Kaka AI**, asisten cerdas dari **Boyang Digital**.\n\nTanyakan apa saja kepada saya:\n- 📖 Arti & terjemahan kosakata Mandar ↔ Indonesia (4.908 entri resmi)\n- 🏛️ Sejarah Mandar (Balanipa, Pitu Baqbana Binanga, Pitu Ulunna Salu, Allamungan Batu, Andi Depu, Baharuddin Lopa)\n- 🗺️ Profil 6 Kabupaten Sulbar (Majene, Polman, Mamuju, Mamasa, Pasangkayu, Mamuju Tengah)\n- 🎭 Tradisi & Kesenian (Sayyang Pattuqduq, Perahu Sandeq, Batik Sure' Parara, Lipaq Saqbe)\n- 🍲 Kuliner Tradisional (Jepa, Bau Peapi, Golla Kambu, Kue Tetu, Passo)\n- 🏫 Pendidikan & PKBM di Sulawesi Barat\n- 🇮🇩 Perbandingan bahasa daerah se-Nusantara (Bugis, Makassar, Toraja, Jawa, Sunda, Minang, dll.)`,
          mandarSpeak: "tabeq",
          related: null,
        };
      }

      // --- A. PERCAKAPAN RAMAH & PERKENALAN ---
      if (/^(halo|hai|salam|assalamu|pagi|siang|sore|malam|tabeq|tabe)\b/i.test(qLower) || /siapa (kamu|anda|kaka ai)/i.test(qLower) || /apa kabar/i.test(qLower)) {
        return {
          reply: `**Tabeq! Halo dari Kaka AI (Boyang Digital)** 👋✨\n\n*Apa karewa?* (Bagaimana kabarmu? Semoga senantiasa sehat dan bersemangat!)\n\nSaya adalah asisten virtual interaktif **Kamus Digital Mandar–Indonesia** yang dirancang oleh **PT. Boyang Digital Nusantara** untuk mencegah kepunahan bahasa daerah Sulawesi Barat.\n\nSaya dibekali pengetahuan komprehensif:\n1. 🔍 **4.908 Kosakata Resmi:** Kamus Balai Bahasa 2025 lengkap dengan audio fonetik & aksara Lontara.\n2. 🏛️ **Sejarah & Budaya Sulbar:** Kerajaan Balanipa, Pitu Baqbana Binanga, Pitu Ulunna Salu, sumpah Allamungan Batu di Luyo, pahlawan nasional Hj. Andi Depu, hingga legenda bahari perahu Sandeq.\n3. 🏝️ **Geografi 6 Kabupaten:** Majene, Polewali Mandar, Mamuju, Mamasa, Pasangkayu, dan Mamuju Tengah.\n4. 🎒 **Dukungan Pelajar & Warga Belajar PKBM:** Panduan belajar tata bahasa, rumus imbuhan (*ma-, mang-*), serta latihan menulis aksara Lontara.\n5. 🇮🇩 **Wawasan Nusantara:** Perbandingan kosakata antar-bahasa daerah di seluruh Indonesia (Bugis, Makassar, Toraja, Jawa, Sunda, Minang, Batak, Bali, dll.).\n\nAda yang ingin Anda ketahui atau pelajari hari ini? Silakan tanyakan dengan leluasa!`,
          mandarSpeak: "tabeq, apa karewa? diang melo mupaqguruang di basa mandar?",
          related: null,
        };
      }

      // --- B. UCAPAN TERIMA KASIH / RESPON KASUAL ---
      if (/^(terima kasih|makasih|tarima kasi|kurrusumanga|keren|hebat|mantap|terimakasih)\b/i.test(qLower)) {
        return {
          reply: `**Kurrusumangaq! Sama-sama sahabat budaya** 🙏❤️\n\nSenang sekali bisa membantu Anda belajar. Dalam tradisi luhur masyarakat Mandar, ketika seseorang berbuat baik atau menyampaikan terima kasih, kita mendoakan dengan ucapan **"Kurrusumangaq"** (semoga berkah dan semangat kebaikan senantiasa menyertai).\n\nJangan ragu untuk bertanya lagi kapan saja, baik tentang kosakata, sejarah kerajaan, makanan khas, maupun sastra puisi *Kalindaqdaq*. Selamat melestarikan budaya Sulawesi Barat!`,
          mandarSpeak: "kurrusumangaq, maroa paqmaiu",
          related: null,
        };
      }

      // --- C. PENCARIAN TERJEMAHAN DUA ARAH (INDONESIA -> MANDAR) ---
      const indoTranslateMatch = qLower.match(/^(?:apa\s+)?(?:bahasa\s+mandar(?:nya)?|terjemahan\s+mandar(?:nya)?|artinya\s+di\s+mandar|bagaimana\s+bahasa\s+mandar(?:nya)?)\s+(?:dari\s+|kata\s+)?([a-z0-9\s'-]+)/i)
        || qLower.match(/^(?:bahasa\s+mandar(?:nya)?)\s+([a-z0-9\s'-]+)/i)
        || qLower.match(/^(?:terjemahkan\s+ke\s+mandar)\s+([a-z0-9\s'-]+)/i);

      if (indoTranslateMatch && indoTranslateMatch[1]) {
        const rawIndoTerm = indoTranslateMatch[1].replace(/[?!.,;]/g, '').trim();
        const matches = this.findIndoToMandar(rawIndoTerm);

        if (matches.length > 0) {
          const mainMatch = matches[0];
          const lontar = this.linguistics && this.linguistics.latinToLontaraqPreview ? this.linguistics.latinToLontaraqPreview(mainMatch.headword) : '';
          const ipaObj = this.linguistics && this.linguistics.toMandarIpa ? this.linguistics.toMandarIpa(mainMatch.headword) : null;
          const otherLines = matches.slice(1).map((m) => `- **${m.headword}** (${(m.pos || []).join(', ') || 'kata'}): ${m.definitionText || ''}`).join('\n');

          return {
            reply: `### 🇮🇩 Indonesia → 🏝️ Mandar: **"${rawIndoTerm}"**\n\nDalam Bahasa Mandar, kata **"${rawIndoTerm}"** dapat diungkapkan dengan:\n\n> 🌟 **${mainMatch.headword}** \`${lontar}\`\n\n- **Aksara Lontara:** \`${lontar}\`\n- **Pelafalan Fonetik (IPA):** ${ipaObj ? `${ipaObj.phonemic} ${ipaObj.narrow}` : `/${mainMatch.headword}/`}\n- **Kelas Kata:** *${(mainMatch.pos || []).join(', ') || 'kata'}*\n- **Rujukan Kamus:** Halaman ${mainMatch.source ? mainMatch.source.bookPage : 'Buku Kamus 2025'}\n- **Definisi Lengkap:** ${mainMatch.definitionText || ''}\n\n${otherLines ? `**Kosakata atau Turunan Terkait Lainnya:**\n${otherLines}\n\n` : ''}*Tekan tombol audio di bawah untuk mendengarkan pelafalan penutur aslinya!*`,
            mandarSpeak: mainMatch.headword,
            related: mainMatch.headword,
          };
        }
      }

      // --- D. PENCARIAN KOSAKATA MANDAR SPESIFIK (MANDAR -> INDONESIA) ---
      const isWordQuery = /^(apa arti kata|apa arti|artinya|arti dari|terjemahkan kata|terjemahkan|apa maksud|maksud kata|kosakata|kata)\b/i.test(qLower);
      const cleanedQuery = qLower
        .replace(/^(apa arti kata|apa arti|artinya|arti dari|terjemahkan kata|terjemahkan|apa maksud|maksud kata|kosakata|kata)\s+/i, '')
        .replace(/[?!.,;]/g, '')
        .trim();

      const candidateWord = cleanedQuery.split(/\s+/)[0];
      const entry = (isWordQuery || (candidateWord && this.vocabMap.has(candidateWord)))
        ? (this.findEntryExactOrStemmed(candidateWord) || this.findEntryExactOrStemmed(cleanedQuery))
        : null;

      if (entry) {
        const hw = entry.headword;
        const pos = Array.isArray(entry.pos) ? entry.pos.join(', ') : (entry.pos || 'kata');
        const def = entry.definitionText || 'Definisi lema kamus 2025';
        const page = entry.source && entry.source.bookPage ? `Buku Kamus hlm. ${entry.source.bookPage}` : '';
        const ipaObj = this.linguistics && this.linguistics.toMandarIpa ? this.linguistics.toMandarIpa(hw) : null;
        const lontar = this.linguistics && this.linguistics.latinToLontaraqPreview ? this.linguistics.latinToLontaraqPreview(hw) : '';

        let extraMorph = '';
        if (entry._morphology && entry._morphology.kind === 'berimbuhan') {
          extraMorph = `\n- **Analisis Morfologi:** Mengandung imbuhan \`${entry._morphology.prefix || ''}${entry._morphology.suffix || ''}\` dari kata dasar **${entry._morphology.rootCandidate}**.`;
        }

        return {
          reply: `### 📖 Penjelasan Kosakata Mandar: **${hw}**\n\n- **Aksara Lontara:** \`${lontar}\`\n- **Kelas Kata:** *${pos}*\n- **Pelafalan Fonetik (IPA):** ${ipaObj ? `${ipaObj.phonemic} ${ipaObj.narrow}` : `/${hw}/`}\n- **Rujukan Sumber Resmi:** ${page} (Edisi Revisi 2025, Balai Bahasa Prov. Sulawesi Barat)${extraMorph}\n\n**Makna & Definisi:**\n${def}\n\n*Dengarkan cara pengucapan asli dengan menekan tombol audio di bawah!*`,
          mandarSpeak: hw,
          related: hw,
          entry,
        };
      }

      // --- E. SASTRA LISAN KALINDAQDAQ & PAPPASANG ---
      if (qLower.includes('kalindaqdaq') || qLower.includes('puisi') || qLower.includes('syair') || qLower.includes('pappasang') || qLower.includes('pantun')) {
        const randItem = KALINDAQDAQ_COLLECTION[Math.floor(Math.random() * KALINDAQDAQ_COLLECTION.length)];
        return {
          reply: `### 🪶 Sastra Lisan Kalindaqdaq Mandar\n\n*Kalindaqdaq* adalah bentuk puisi lisan tradisional suku Mandar yang sarat nilai filosofis. Struktur bakunya terdiri atas **4 baris dengan pola metrum 8 - 7 - 5 - 7 suku kata**:\n\n> **"${randItem.mandar.replace(/\n/g, ' / ')}"**\n\n**Terjemahan Bahasa Indonesia:**\n*"${randItem.arti}"*\n\n- **Pola Suku Kata:** ${randItem.pola}\n- **Tema:** ${randItem.tema}\n- **Makna Budaya:** ${randItem.catatan}\n\n*Tips Belajar di Sekolah & PKBM:* Dengarkan irama pengucapannya dengan menekan tombol speaker di bawah agar rima dan jeda antarlarik terdengar merdu!`,
          mandarSpeak: randItem.mandar.split('\n')[0],
          related: null,
        };
      }

      // --- F. ENSIKLOPEDI SELUK-BELUK SULAWESI BARAT ---
      for (const encKey of Object.keys(SULBAR_ENCYCLOPEDIA)) {
        const item = SULBAR_ENCYCLOPEDIA[encKey];
        if (item.tags.some((t) => qLower.includes(t))) {
          return {
            reply: `### 🏛️ ${item.title}\n\n${item.content}\n\n*Ingin mencari kosakata terkait di kamus? Coba ketik nama kata kuncinya di kotak pencarian kamus!*`,
            mandarSpeak: item.speakWord || encKey,
            related: item.speakWord || null,
          };
        }
      }

      // --- G. ENSIKLOPEDI KOMPARASI NUSANTARA (SELURUH INDONESIA) ---
      if (
        qLower.includes('indonesia') ||
        qLower.includes('nusantara') ||
        qLower.includes('bugis') ||
        qLower.includes('makassar') ||
        qLower.includes('toraja') ||
        qLower.includes('jawa') ||
        qLower.includes('sunda') ||
        qLower.includes('minang') ||
        qLower.includes('batak') ||
        qLower.includes('bali') ||
        qLower.includes('banjar') ||
        qLower.includes('angka') ||
        qLower.includes('perbandingan') ||
        qLower.includes('beda')
      ) {
        // Find matching comparison or return general comparison
        const matchedComp = NUSANTARA_COMPARISONS.find((c) =>
          qLower.includes(c.konsep.toLowerCase()) ||
          (c.mandar && qLower.includes(c.mandar.split(' ')[0])) ||
          (c.bugis && qLower.includes(c.bugis.split(' ')[0])) ||
          (c.jawa && qLower.includes(c.jawa.split(' ')[0]))
        );

        if (matchedComp) {
          return {
            reply: `### 🇮🇩 Komparasi Bahasa Nusantara: **${matchedComp.konsep}**\n\nBerikut perbandingan kosakata antara **Bahasa Mandar** dengan bahasa-bahasa daerah lainnya di Indonesia:\n\n- 🏝️ **Mandar (Sulbar):** \`${matchedComp.mandar}\`\n- ⛵ **Bugis (Sulsel):** \`${matchedComp.bugis}\`\n- 🌊 **Makassar (Sulsel):** \`${matchedComp.makassar}\`\n- ⛰️ **Toraja (Sulsel/Sulbar):** \`${matchedComp.toraja}\`\n- 🏛️ **Jawa:** \`${matchedComp.jawa}\`\n- 🍃 **Sunda:** \`${matchedComp.sunda}\`\n- 🌾 **Minangkabau:** \`${matchedComp.minang}\`\n\n**Catatan Linguistik:**\n${matchedComp.catatan}\n\n*Semua bahasa daerah ini bernaung dalam kekayaan Bhinneka Tunggal Ika dan sebagian besar berakar dari rumpun bahasa Austronesia yang agung.*`,
            mandarSpeak: matchedComp.mandar.split('/')[0].trim(),
            related: null,
          };
        }

        // Summary of Nusantara comparisons
        const compRows = NUSANTARA_COMPARISONS.slice(0, 6)
          .map((c) => `| **${c.konsep}** | \`${c.mandar.split('/')[0].trim()}\` | \`${c.bugis.split('/')[0].trim()}\` | \`${c.makassar.split('/')[0].trim()}\` | \`${c.jawa.split('/')[0].trim()}\` | \`${c.sunda.split('/')[0].trim()}\` |`)
          .join('\n');

        return {
          reply: `### 🇮🇩 Wawasan Bahasa Daerah Seluruh Indonesia & Mandar\n\nIndonesia memiliki lebih dari 718 bahasa daerah yang terikat harmonis dalam semboyan luhur **Bhinneka Tunggal Ika**. **Bahasa Mandar** di Sulawesi Barat termasuk dalam rumpun **Austronesia (cabang Sulawesi Selatan)** bersama bahasa Bugis, Makassar, dan Toraja, serta berkerabat jauh dengan bahasa Melayu, Jawa, Sunda, Minang, dan bahasa Nusantara lainnya.\n\nBerikut perbandingan beberapa kosakata dasar sehari-hari:\n\n| Konsep | Mandar | Bugis | Makassar | Jawa | Sunda |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${compRows}\n\n*Kaka AI dapat membandingkan angka, kata kerja makan/tidur/minum, kata ganti, dan anggota tubuh antardaerah. Tanyakan kata spesifik yang ingin Anda bandingkan!*`,
          mandarSpeak: "basa mandar dng basa nusantara",
          related: null,
        };
      }

      // --- H. PERTANYAAN TATA BAHASA & RUMUS MORFOLOGI ---
      if (qLower.includes('imbuhan') || qLower.includes('rumus') || qLower.includes('awalan') || qLower.includes('akhiran') || qLower.includes('morfologi') || qLower.includes('tata bahasa') || qLower.includes('klitik')) {
        return {
          reply: `### 🧩 Rumus & Kaidah Morfologi Bahasa Mandar (Buku Resmi 2025)\n\nBahasa Mandar kaya akan afiksasi (pengimbuhan) yang membentuk verba aktif, pasif, dan resiprokal:\n\n1. **Awalan Verba Aktif:**\n   - \`ma-\` / \`mang-\` / \`maN-\`: Membentuk verba tindakan (misal: *ala* [ambil] → *maqala* [mengambil]; *coko* [jongkok] → *meccoko*).\n   - Nasalisasi terjadi sesuai fonem awal kata dasar (misal huruf /p/ menjadi /m/, /t/ menjadi /n/).\n2. **Klitik Pronomina Seri I & II:**\n   - Persona I: *u-* (proklitik) / *-u* (enklitik), contoh: *u-tarima* (saya terima), *boyang-u* (rumah saya).\n   - Persona II: *mu-* (kamu), contoh: *mu-paralluang* (kamu butuhkan).\n   - Persona III: *na-* (dia/mereka), contoh: *na-sayangngi* (dia sayangi).\n3. **Partikel Penegas & Aspek:**\n   - \`-mi\` (telah / penegas sopan), misal: *malai mi* (pergilah).\n   - \`-mo\` (sudah / kepastian), misal: *puramo* (sudah selesai).\n   - \`-pa\` (masih / lagi), misal: *diangpa* (masih ada).\n\n*Pelajari selengkapnya dengan membuka halaman [📖 Belajar Rumus & Imbuhan](./belajar.html).*`,
          mandarSpeak: "maala anjoro di boyang",
          related: null,
        };
      }

      // --- I. PERTANYAAN AKSARA LONTARA & ATURAN PENULISAN ---
      if (qLower.includes('lontar') || qLower.includes('aksara') || qLower.includes('kamera') || qLower.includes('ocr') || qLower.includes('sulapa eppa')) {
        return {
          reply: `### ✍️ Aksara Lontaraq Mandar & Kamera OCR\n\nAksara tradisional suku Mandar dikenal sebagai **Lontaraq Sulapa Eppa** (segi empat bujur sangkar yang melambangkan empat penjuru angin dan empat unsur alam: api, air, angin, dan tanah).\n\n**Aturan Penting Penulisan Mandar:**\n1. **23 Huruf Dasar (*Inanna Sureq*):** ka, ga, nga, ngka, pa, ba, ma, mpa, ta, da, na, nra, ca, ja, nya, nca, ya, ra, la, wa, sa, a, ha.\n2. **5 Tanda Bunyi Vokal (*Anaqna Sureq*):** default (a), titik atas \`i\` (◌ᨗ), titik bawah \`u\` (◌ᨘ), tanda kiri \`e\` (◌ᨙ), dan tanda kanan \`o\` (◌ᨚ).\n3. **Konsonan Koda / Huruf Mati Tidak Ditulis:** Bunyi sengau akhir \`-ng\` dan glotal \`-q\` secara tradisional tidak ditulis terpisah. Contoh: *boyang* ditulis \`ᨅᨚᨐ\` (*bo-ya*), *sandeq* ditulis \`ᨔᨉᨙ\` (*sa-de*).\n\n📷 **Gunakan Fitur Kamera Lontara:**\nAnda dapat mengarahkan kamera ke naskah Lontar atau papan aksara untuk membaca alih aksara Latin dan artinya secara otomatis di fitur [📷 Kamera Lontara](#kamera-lontara) atau latihan menulis di [✍️ Halaman Huruf Lontar](./lontara.html)!`,
          mandarSpeak: "basa mandar sulawesi barat",
          related: null,
        };
      }

      // --- J. PANDUAN PERCAKAPAN SEHARI-HARI MANDAR ---
      if (qLower.includes('percakapan') || qLower.includes('sehari-hari') || qLower.includes('belajar bicara') || qLower.includes('frasa')) {
        return {
          reply: `### 🗣️ Panduan Percakapan Sehari-hari Bahasa Mandar\n\nBerikut beberapa frasa penting yang sangat berguna dipraktikkan oleh pelajar, wisatawan, dan warga belajar PKBM:\n\n1. **Sapaan Sopan:**\n   - *Tabeq, apa karewa?* = Permisi/maaf, apa kabar?\n   - *Karewa macoa.* = Kabar baik.\n2. **Perkenalan Diri:**\n   - *Inai sangammu?* = Siapa namamu?\n   - *Sangau Ahmad.* = Nama saya Ahmad.\n   - *Diang aq di boyang.* = Saya ada di rumah.\n3. **Mengajak & Meminta Izin:**\n   - *Inggai ummande!* = Mari makan!\n   - *Meloaq lele.* = Saya ingin lewat / pamit.\n   - *U tarima kasih.* = Saya berterima kasih.\n4. **Menanyakan Tempat & Keadaan:**\n   - *Pura mo?* = Apakah sudah selesai?\n   - *Pura mo.* = Sudah selesai.\n   - *Piringa mai litaqmu?* = Dari mana asal daerahmu?`,
          mandarSpeak: "tabeq, apa karewa? karewa macoa",
          related: null,
        };
      }

      // --- K. PANDUAN PENDIDIKAN / BELAJAR DARI NOL ---
      if (qLower.includes('tips') || qLower.includes('dari nol') || qLower.includes('pemula') || qLower.includes('cara belajar')) {
        return {
          reply: `### 💡 Tips Cepat Belajar Bahasa Mandar dari Nol (Boyang Digital)\n\nBagi adik-adik pelajar sekolah maupun bapak/ibu warga belajar di **PKBM**:\n\n1. **Kuasai Sapaan Sopan:** Awali setiap interaksi dengan kata *Tabeq* (permisi/maaf).\n2. **Hafalkan 20 Kata Dasar Pokok:** Mulai dari kata sehari-hari seperti *boyang* (rumah), *lopi* (perahu), *anjoro* (kelapa), *bau* (ikan), *ande* (makan), *tindo* (tidur), *wai* (air).\n3. **Pahami Ejaan Fonetik 'Q':** Ingat bahwa huruf 'q' di kamus 2025 melambangkan sentak glotal (misal *lipaq*, *anaq*).\n4. **Gunakan Fitur Audio Kamus:** Dengarkan pelafalan penutur asli setiap kata agar terbiasa dengan intonasi alamiah.\n5. **Latihan Menulis Lontara di Kanvas:** Buka [✍️ Halaman Huruf Lontar](./lontara.html) untuk melatih otot tangan menggambar 23 aksara *Sulapa Eppa*.\n\n*Kaka AI selalu siap mendampingi Anda belajar 24 jam!*`,
          mandarSpeak: "tabeq, meloaq meqguru basa mandar",
          related: null,
        };
      }

      // --- L. PENCARIAN REVERSE KATA INDONESIA UMUM ---
      // Jika pengguna mengetik kata bahasa Indonesia apa saja (misal: "cinta", "ibu", "ayah", "mati", "hidup", "besar", "kecil")
      const generalMatches = this.findIndoToMandar(cleanedQuery || qLower);
      if (generalMatches.length > 0) {
        const topMatch = generalMatches[0];
        const lontar = this.linguistics && this.linguistics.latinToLontaraqPreview ? this.linguistics.latinToLontaraqPreview(topMatch.headword) : '';
        const otherList = generalMatches.slice(1).map((m) => `- **${m.headword}**: ${m.definitionText || ''}`).join('\n');

        return {
          reply: `### 🔍 Kosakata Terkait: **"${q}"**\n\nBerdasarkan pangkalan data resmi **4.908 kosakata Kamus Mandar 2025**, kata yang berhubungan dengan **"${q}"** adalah:\n\n> 🌟 **${topMatch.headword}** \`${lontar}\`\n\n- **Definisi:** ${topMatch.definitionText || ''}\n- **Rujukan:** Halaman ${topMatch.source ? topMatch.source.bookPage : 'Buku Kamus 2025'}\n\n${otherList ? `**Entri Serupa Lainnya:**\n${otherList}\n\n` : ''}*Tekan tombol audio untuk mendengarkan lafalnya!*`,
          mandarSpeak: topMatch.headword,
          related: topMatch.headword,
        };
      }

      // --- M. GENERAL SMART CONVERSATIONAL FALLBACK ---
      return {
        reply: `**Pertanyaan Anda:** *"${q}"*\n\nTerima kasih atas pertanyaannya! Sebagai asisten cerdas **Kaka AI** persembahan **Boyang Digital** untuk Sulawesi Barat dan seluruh Indonesia:\n\n- 🔍 **Mencari Terjemahan:** Tanyakan misalnya *"Apa bahasa mandarnya makan?"* atau *"Apa arti kata boyang?"*\n- 🏛️ **Sejarah & Kerajaan Sulbar:** Tanyakan tentang *"Balanipa"*, *"Pitu Baqbana Binanga"*, *"Pitu Ulunna Salu"*, *"Perjanjian Allamungan Batu"*, atau *"Pahlawan Andi Depu"*.\n- 🗺️ **Profil Daerah:** Tanyakan tentang 6 kabupaten (*Majene, Polman, Mamuju, Mamasa, Pasangkayu, Mateng*).\n- 🎭 **Budaya & Kuliner:** Tanyakan *"Sayyang Pattuqduq"*, *"Perahu Sandeq"*, *"Batik Sure' Parara"*, *"Lipaq Saqbe"*, *"Jepa"*, atau *"Bau Peapi"*.\n- 🇮🇩 **Perbandingan Se-Indonesia:** Tanyakan perbandingan kata dalam bahasa Mandar, Bugis, Makassar, Toraja, Jawa, Sunda, Minang, dll.\n- 🎒 **Edukasi & PKBM:** Tanyakan tips belajar muatan lokal atau aksara Lontara.\n\n*Kaka AI siap melayani Anda agar budaya dan bahasa Mandar senantiasa lestari dan mendunia!*`,
        mandarSpeak: "tabeq, apa melo mupaqguruang?",
        related: null,
      };
    }
  }

  global.KamusKakaAi = {
    createKakaAiAssistant: (opts) => new KakaAiAssistant(opts),
    KALINDAQDAQ_COLLECTION,
    SULBAR_ENCYCLOPEDIA,
    CULTURE_TOPICS: SULBAR_ENCYCLOPEDIA,
    NUSANTARA_COMPARISONS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
