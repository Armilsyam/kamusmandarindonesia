/**
 * Kamus Digital Mandar–Indonesia — Asisten Cerdas Kaka AI (Boyang Digital)
 * Menjawab pertanyaan seputar kosakata 4.908 entri, tata bahasa/imbuhan,
 * sastra Kalindaqdaq & Pappasang, penulisan Aksara Lontar, serta panduan belajar
 * bagi pelajar di Sulawesi Barat, warga belajar PKBM, dan komunitas budaya.
 */
(function (global) {
  'use strict';

  const KALINDAQDAQ_COLLECTION = [
    {
      mandar: "Kupalolongang duang lopi,\nsambaq u lopiang,\nmau di lau,\ndi timur namoala.",
      arti: "Kuhanyutkan dua perahu, satu perahu layar tumpuanku, biar berlayar ke barat maupun ke timur tetap berhasil.",
      pola: "8 - 7 - 5 - 7 suku kata",
      tema: "Keteguhan Maritim & Semangat Merantau Suku Mandar",
      catatan: "Simbol ketangguhan pelaut Mandar dalam mengarungi samudra kehidupan dengan keyakinan penuh.",
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
  ];

  const CULTURE_TOPICS = {
    sandeq: {
      keywords: ['sandeq', 'lopi', 'perahu', 'maritim', 'pelaut', 'sombal', 'palatto'],
      title: "Perahu Sandeq — Mahakarya Bahari Mandar Sulawesi Barat",
      penjelasan: "Sandeq adalah perahu layar bercadik tradisional tercepat di kawasan Austronesia, kebanggaan maritim suku Mandar. Memiliki lambung ramping runcing (sandeq berarti runcing) dengan cadik (palatto) berbahan bambu dan layar segitiga (sombal). Mampu melaju hingga 20–30 knot memanfaatkan hembusan angin laut tanpa mesin.",
      kosakataTerkait: ['lopi (perahu, hlm. 259)', 'sandeq (runcing/perahu runcing, hlm. 391)', 'sombal (layar perahu)', 'palatto (cadik bambu)'],
    },
    batik: {
      keywords: ['batik', 'sure', 'sureq', 'parara', 'lipaq', 'saqbe', 'sarung', 'sutra', 'tenun'],
      title: "Batik Sure' Parara Sulawesi Barat & Tenun Lipaq Saqbe",
      penjelasan: "Batik Sure' Parara dan sarung sutra Lipaq Saqbe adalah mahakarya tekstil kebanggaan Sulawesi Barat. Motif Sure' Parara tersusun atas garis geometris horizontal dan vertikal bersilang simetris. Garis vertikal melambangkan hubungan dengan Sang Pencipta dan keteguhan iman, sedangkan garis horizontal melambangkan keharmonisan sosial sesama manusia.",
      kosakataTerkait: ["sureq / sure' (corak garis, hlm. 431)", 'saqbe (sutra, hlm. 387)', 'lipaq (sarung, hlm. 252)', 'curaq (corak warna, hlm. 111)'],
    },
    boyang: {
      keywords: ['boyang', 'rumah', 'arsitektur', 'adaq'],
      title: "Arsitektur Boyang — Rumah Tradisional Suku Mandar",
      penjelasan: "Boyang adalah rumah panggung kayu khas suku Mandar. Dibagi atas Boyang Adaq (kediaman bangsawan/pemimpin adat dengan susunan bumbungan bersusun tamping) dan Boyang Beasa (kediaman warga biasa). Struktur panggungnya adaptif terhadap gempa dan banjir pesisir serta memiliki filosofi ruang Samboyang, Tangnga Boyang, dan Bui Boyang.",
      kosakataTerkait: ['boyang (rumah, hlm. 84)', 'boyang adaq (rumah adat bangsawan)', 'tambaq (pagar pelindung, hlm. 446)'],
    },
    kuliner: {
      keywords: ['jepa', 'bau', 'peapi', 'anjoro', 'golla', 'makanan', 'kuliner'],
      title: "Kuliner Khas Mandar — Jepa, Bau Peapi & Anjoro",
      penjelasan: "Kuliner Mandar terkenal sarat gizi dan bersumber dari laut dan pohon kelapa. Jepa adalah makanan pokok berbahan parutan singkong atau sagu yang dipanggang di atas piring tanah liat (panrita jepa). Bau Peapi adalah masakan ikan kuah kuning berempah asam mangga (kallang) dan minyak kelapa mandar, sedangkan anjoro (kelapa) menjadi sari cita rasa gurih masakan pesisir.",
      kosakataTerkait: ['jepa (penganan singkong panggang, hlm. 180)', 'bau (ikan, hlm. 61)', 'anjoro (kelapa, hlm. 21)', 'golla (gula merah aren)'],
    },
    etika: {
      keywords: ['tabeq', 'tabe', 'sopan', 'santun', 'etika', 'adab', 'malaqbiq'],
      title: "Etika Malaqbiq & Pengucapan 'Tabeq' di Tanah Mandar",
      penjelasan: "Malaqbiq adalah filosofi keluhuran budi pekerti, tutur kata yang santun, dan perilaku terhormat masyarakat Sulawesi Barat. Ucapan 'Tabeq' diucapkan saat meminta izin, lewat di depan orang tua/guru, menyela pembicaraan, atau memulai sapaan hormat. Pembelajar bahasa Mandar di sekolah dan PKBM diajarkan mendahulukan kata 'tabeq' sebagai tanda kesopanan sejati.",
      kosakataTerkait: ['tabeq (permisi/maaf sopan)', 'malaqbiq (mulia/beradab)', 'siriq (harga diri/kehormatan)'],
    },
  };

  class KakaAiAssistant {
    constructor(opts = {}) {
      this.vocabMap = opts.vocabMap || new Map();
      this.linguistics = opts.linguistics || global.KamusLinguistics;
      this.audioCtrl = opts.audioCtrl || (global.KamusMedia && global.KamusMedia.createAudioController && global.KamusMedia.createAudioController());
      this.bookGuide = opts.bookGuide || (this.linguistics && this.linguistics.BOOK_GUIDE_DATA);
    }

    setVocabMap(map) {
      if (map instanceof Map) this.vocabMap = map;
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

    ask(queryText) {
      const q = String(queryText || '').trim();
      const qLower = q.toLowerCase();

      if (!q) {
        return {
          reply: "Halo! Saya **Kaka AI**, asisten cerdas dari **Boyang Digital**. Tanyakan apa saja seputar 4.908 kosakata kamus Mandar, cara penulisan aksara Lontar, tata bahasa, atau sastra Kalindaqdaq!",
          mandarSpeak: "tabeq",
          related: null,
        };
      }

      // 1. Sapaan & Identitas Boyang Digital
      if (/^(halo|hai|salam|assalamu|pagi|siang|sore|malam|tabeq|tabe)\b/i.test(qLower) || /siapa (kamu|anda|kaka ai)/i.test(qLower)) {
        return {
          reply: `**Tabeq! Halo dari Kaka AI (Boyang Digital)** 👋\n\nSaya adalah asisten virtual interaktif dalam ekosistem **Kamus Digital Mandar–Indonesia** yang dikembangkan oleh **PT. Boyang Digital Nusantara**.\n\nTugas saya adalah membantu adik-adik pelajar di Sulawesi Barat, bapak/ibu tutor serta warga belajar **PKBM (Pusat Kegiatan Belajar Masyarakat)**, mahasiswa, dan komunitas pemerhati budaya untuk:\n\n1. 🔍 **Mencari & Membedah Kosakata:** Menerjemahkan 4.908 entri kosakata dari buku cetak resmi Balai Bahasa 2025.\n2. 🧩 **Menjelaskan Tata Bahasa & Morfologi:** Mengurai awalan (*ma'-, mang-, mar-*), akhiran, dan partikel penegas (*-mi, -mo, -pa*).\n3. ✍️ **Alih Aksara Lontar (Sulapa Eppa):** Memandu penulisan huruf tradisional Mandar dan kaidah koda kata.\n4. 🪶 **Sastra & Budaya:** Mengulas puisi sastra lisan *Kalindaqdaq*, wasiat bijak *Pappasang*, perahu *Sandeq*, hingga *Batik Sure' Parara Sulawesi Barat*.\n\nSilakan ketik pertanyaan Anda atau pilih salah satu rekomendasi pertanyaan di bawah!`,
          mandarSpeak: "tabeq, apa melo mupaqguruang di basa mandar?",
          related: null,
        };
      }

      // 2. Puisi Kalindaqdaq & Pappasang
      if (qLower.includes('kalindaqdaq') || qLower.includes('puisi') || qLower.includes('syair') || qLower.includes('pappasang') || qLower.includes('pantun')) {
        const randItem = KALINDAQDAQ_COLLECTION[Math.floor(Math.random() * KALINDAQDAQ_COLLECTION.length)];
        return {
          reply: `### 🪶 Sastra Lisan Kalindaqdaq Mandar\n\n*Kalindaqdaq* adalah bentuk puisi lisan tradisional suku Mandar yang sarat nilai filosofis. Struktur bakunya terdiri atas **4 baris dengan pola suku kata 8 - 7 - 5 - 7**:\n\n> **"${randItem.mandar.replace(/\n/g, ' / ')}"**\n\n**Terjemahan Bahasa Indonesia:**\n*"${randItem.arti}"*\n\n- **Pola Metrum:** ${randItem.pola}\n- **Tema:** ${randItem.tema}\n- **Makna Budaya:** ${randItem.catatan}\n\n*Tips Belajar di Sekolah & PKBM:* Dengarkan irama pengucapannya dengan menekan tombol speaker di bawah agar rima dan jeda antarlarik terdengar merdu!`,
          mandarSpeak: randItem.mandar.split('\n')[0],
          related: null,
        };
      }

      // 3. Pencarian Kosakata / Arti Kata Spesifik
      const isWordQuery = /^(apa arti kata|apa arti|artinya|arti dari|terjemahkan kata|terjemahkan|apa maksud|maksud kata|kosakata|kata)\b/i.test(qLower);
      const cleanedQuery = qLower
        .replace(/^(apa arti kata|apa arti|artinya|arti dari|terjemahkan kata|terjemahkan|apa maksud|maksud kata|kosakata|kata)\s+/i, '')
        .replace(/[?!.,;]/g, '')
        .trim();

      const candidateWord = cleanedQuery.split(/\s+/)[0];
      const entry = (isWordQuery || this.vocabMap.has(candidateWord))
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
          reply: `### 📖 Penjelasan Kosakata: **${hw}**\n\n- **Aksara Lontara:** \`${lontar}\`\n- **Kelas Kata:** *${pos}*\n- **Pelafalan Fonetik (IPA):** ${ipaObj ? `${ipaObj.phonemic} ${ipaObj.narrow}` : `/${hw}/`}\n- **Rujukan Sumber Resmi:** ${page} (Edisi Revisi 2025, Balai Bahasa Prov. Sulawesi Barat)${extraMorph}\n\n**Makna & Definisi:**\n${def}\n\n*Dengarkan cara pengucapan asli dengan menekan tombol audio di bawah!*`,
          mandarSpeak: hw,
          related: hw,
          entry,
        };
      }

      // 4. Topik Budaya & Warisan (Sandeq, Batik Sure' Parara, Boyang, dsb.)
      for (const topicKey of Object.keys(CULTURE_TOPICS)) {
        const topic = CULTURE_TOPICS[topicKey];
        if (topic.keywords.some((kw) => qLower.includes(kw))) {
          const vocabLines = topic.kosakataTerkait.map((k) => `- \`${k}\``).join('\n');
          return {
            reply: `### 🏝️ ${topic.title}\n\n${topic.penjelasan}\n\n**Kosakata Terkait di Kamus Mandar 2025:**\n${vocabLines}\n\n*Ingin mencari lema di atas secara lengkap? Ketik nama katanya di kotak pencarian kamus!*`,
            mandarSpeak: topic.keywords[0],
            related: topic.keywords[0],
          };
        }
      }

      // 4. Pertanyaan Tata Bahasa & Rumus Imbuhan
      if (qLower.includes('imbuhan') || qLower.includes('rumus') || qLower.includes('awalan') || qLower.includes('akhiran') || qLower.includes('morfologi') || qLower.includes('tata bahasa')) {
        return {
          reply: `### 🧩 Rumus & Kaidah Morfologi Bahasa Mandar (Buku 2025)\n\nBahasa Mandar kaya akan afiksasi (pengimbuhan) yang membentuk verba aktif, pasif, dan resiprokal:\n\n1. **Awalan Verba Aktif:**\n   - \`ma-\` / \`mang-\` / \`maN-\`: Membentuk verba tindakan (misal: *ala* [ambil] → *maqala* [mengambil]; *coko* [jongkok] → *meccoko*).\n   - Nasalisasi terjadi sesuai fonem awal kata dasar (misal huruf /p/ menjadi /m/, /t/ menjadi /n/).\n2. **Klitik Pronomina Seri I & II:**\n   - Persona I: *u-* (proklitik) / *-u* (enklitik), contoh: *u-tarima* (saya terima).\n   - Persona II: *mu-* (kamu), contoh: *mu-paralluang* (kamu butuhkan).\n   - Persona III: *na-* (dia/mereka), contoh: *na-sayangngi* (dia sayangi).\n3. **Partikel Penegas & Aspek:**\n   - \`-mi\` (telah / ajakan sopan), misal: *malai mi* (pergilah).\n   - \`-mo\` (sudah / kepastian), misal: *puramo* (sudah selesai).\n   - \`-pa\` (masih / lagi), misal: *diangpa* (masih ada).\n\n*Pelajari selengkapnya dengan membuka halaman [📖 Belajar Rumus & Imbuhan](./belajar.html).*`,
          mandarSpeak: "maala anjoro di boyang",
          related: null,
        };
      }

      // 5. Pertanyaan tentang Aksara Lontar / Kamera Lontara
      if (qLower.includes('lontar') || qLower.includes('aksara') || qLower.includes('kamera') || qLower.includes('ocr') || qLower.includes('sulapa eppa')) {
        return {
          reply: `### ✍️ Aksara Lontaraq Mandar & Kamera OCR\n\nAksara tradisional suku Mandar dikenal sebagai **Lontaraq Sulapa Eppa** (segi empat bujur sangkar yang melambangkan empat penjuru angin dan empat unsur alam: api, air, angin, dan tanah).\n\n**Aturan Penting Penulisan Mandar:**\n1. **23 Huruf Dasar (*Inanna Sureq*):** ka, ga, nga, ngka, pa, ba, ma, mpa, ta, da, na, nra, ca, ja, nya, nca, ya, ra, la, wa, sa, a, ha.\n2. **5 Tanda Bunyi Vokal (*Anaqna Sureq*):** default (a), titik atas \`i\` (◌ᨗ), titik bawah \`u\` (◌ᨘ), tanda kiri \`e\` (◌ᨙ), dan tanda kanan \`o\` (◌ᨚ).\n3. **Konsonan Koda / Huruf Mati Tidak Ditulis:** Bunyi sengau akhir \`-ng\` dan glotal \`-q\` secara tradisional tidak ditulis terpisah. Contoh: *boyang* ditulis \`ᨅᨚᨐ\` (*bo-ya*), *sandeq* ditulis \`ᨔᨉᨙ\` (*sa-de*).\n\n📷 **Gunakan Fitur Kamera Lontara:**\nAnda dapat mengarahkan kamera ke naskah Lontar atau papan aksara untuk membaca alih aksara Latin dan artinya secara otomatis di fitur [📷 Kamera Lontara](#kamera-lontara) atau latihan menulis di [✍️ Halaman Huruf Lontar](./lontara.html)!`,
          mandarSpeak: "basa mandar sulawesi barat",
          related: null,
        };
      }

      // 7. General Smart Fallback (Edukasi Pelajar & PKBM)
      return {
        reply: `**Pertanyaan Anda:** *"${q}"*\n\nTerima kasih atas pertanyaannya! Sebagai asisten digital untuk komunitas pembelajar bahasa Mandar di Sulawesi Barat:\n\n- Jika Anda mencari **arti kata**, silakan ketik lema kata dasarnya (misal: *boyang, sandeq, lopi, lipaq, anjoro, manuq*).\n- Jika ingin mengetahui **tata bahasa**, coba tanyakan *"Jelaskan awalan ma-"* atau *"Bagaimana aturan huruf Lontar?"*.\n- Anda juga dapat menanyakan tentang sastra lisan *"Kalindaqdaq"*, *"Perahu Sandeq"*, atau *"Batik Sure' Parara Sulawesi Barat"*.\n\n*Tim Boyang Digital siap membantu menyukseskan literasi bahasa daerah di sekolah dan PKBM se-Sulawesi Barat!*`,
        mandarSpeak: "tabeq",
        related: null,
      };
    }
  }

  global.KamusKakaAi = {
    createKakaAiAssistant: (opts) => new KakaAiAssistant(opts),
    KALINDAQDAQ_COLLECTION,
    CULTURE_TOPICS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
