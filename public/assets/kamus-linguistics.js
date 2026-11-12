(function (global) {
  'use strict';

  const POS_FULL_NAMES = {
    n: 'Nomina (Kata Benda)',
    v: 'Verba (Kata Kerja)',
    a: 'Adjektiva (Kata Sifat)',
    adv: 'Adverbia (Kata Keterangan)',
    p: 'Partikel (Kata Tugas)',
    num: 'Numeralia (Kata Bilangan)',
    pron: 'Pronomina (Kata Ganti)',
    i: 'Interjeksi (Kata Seru)',
    ki: 'Kiasan / Figuratif',
    ukp: 'Ungkapan / Idiom',
    pb: 'Peribahasa',
    k: 'Ragam Khusus / Kasar',
    klitik: 'Klitik',
    frasa: 'Frasa',
  };

  const PROSE_ABBR_EXPANSIONS = [
    [/\bdng\b/g, 'dengan'],
    [/\bdp\b/g, 'daripada'],
    [/\bdr\b/g, 'dari'],
    [/\bkpd\b/g, 'kepada'],
    [/\bkrn\b/g, 'karena'],
    [/\bmsl\b/g, 'misalnya'],
    [/\bpd\b/g, 'pada'],
    [/\bsbg\b/g, 'sebagai'],
    [/\bspt\b/g, 'seperti'],
    [/\bthd\b/g, 'terhadap'],
    [/\btt\b/g, 'tentang'],
    [/\byg\b/g, 'yang'],
    [/\bdsb\b/g, 'dan sebagainya'],
    [/\bdll\b/g, 'dan lain-lain'],
    [/\btsb\b/g, 'tersebut'],
    [/\bdst\b/g, 'dan seterusnya'],
  ];

  const DIALECT_NAMES = [
    'Balanipa',
    'Banggae',
    'Pamboang',
    'Sendana',
    'Campalagian',
    'Majene',
    'Polewali',
    'Tinambung',
    'Mamuju',
    'Malunda',
  ];

  const PREFIX_RULES = [
    { prefix: 'meq', meaning: 'mem-/ber- (alomorf me- sebelum vokal / g)', baseRule: 'me-/mi-' },
    { prefix: 'miq', meaning: 'mem-/ber- (varian mi- sebelum vokal / g)', baseRule: 'me-/mi-' },
    { prefix: 'maq', meaning: 'me-/ber- (alomorf ma- sebelum vokal / b / g)', baseRule: 'ma-' },
    { prefix: 'peq', meaning: 'pen-/perintah (alomorf pe- sebelum vokal / g)', baseRule: 'pe-/pi-' },
    { prefix: 'sia', meaning: 'saling / ber-...-an (kombinasi si- + a-)', baseRule: 'si-/sia-' },
    { prefix: 'me', meaning: 'memakai / melakukan tindakan aktif', baseRule: 'me-/mi-' },
    { prefix: 'mi', meaning: 'memakai / melakukan tindakan aktif (varian mi-)', baseRule: 'me-/mi-' },
    { prefix: 'ma', meaning: 'me- aktif / ber- / pembentuk adjektiva', baseRule: 'ma-' },
    { prefix: 'pe', meaning: 'gemar melakukan / pelaku / kelipatan bilangan / perintah', baseRule: 'pe-/pi-' },
    { prefix: 'pi', meaning: 'varian pe- (kelipatan / pelaku)', baseRule: 'pe-/pi-' },
    { prefix: 'pa', meaning: 'perintah / kausatif ("buat supaya ...")', baseRule: 'pa-' },
    { prefix: 'di', meaning: 'pasif ("di-...") bila melekat pada kata kerja', baseRule: 'di-' },
    { prefix: 'na', meaning: 'pelaku persona ke-3 ("dia/ia me-...") atau pasif', baseRule: 'na-' },
    { prefix: 'ti', meaning: 'tidak sengaja / keadaan ("ter-...")', baseRule: 'ti-' },
    { prefix: 'si', meaning: 'saling / ber-...-an', baseRule: 'si-/sia-' },
    { prefix: 'ke', meaning: 'mempunyai ... (kepemilikan)', baseRule: 'ke-' },
    { prefix: 'ka', meaning: 'kebiasaan / gemar berulang (ka- + reduplikasi)', baseRule: 'ka-' },
    { prefix: 'um', meaning: 'aktif / dalam keadaan (terbatas)', baseRule: 'um-' },
  ];

  const CLITIC_AND_SUFFIX_RULES = [
    { suffix: 'nasang', role: 'penanda jamak ("semua")' },
    { suffix: 'bandi', role: 'partikel penegas ("juga / masih")' },
    { suffix: 'toqo', role: 'partikel penegas ("juga")' },
    { suffix: 'tuqu', role: 'partikel penegas ("memang / sungguh")' },
    { suffix: 'bopai', role: 'partikel ("nanti ... lagi")' },
    { suffix: 'duai', role: 'partikel ("masih ... dia")' },
    { suffix: 'mieq', role: 'persona ke-2 jamak ("kamu semua")' },
    { suffix: 'moqo', role: 'klitik inversi persona ke-2 ("-lah kamu")' },
    { suffix: 'ang', role: 'sufiks lokatif/benefaktif ("tempat / -kan")' },
    { suffix: 'pai', role: 'partikel waktu ("nanti / dahulu")' },
    { suffix: 'boi', role: 'partikel ("lagi dia")' },
    { suffix: 'toi', role: 'partikel ("juga dia")' },
    { suffix: 'dua', role: 'partikel ("masih")' },
    { suffix: 'maq', role: 'klitik inversi persona 1 + mo ("saya sudah")' },
    { suffix: 'mi', role: 'partikel aspek ("sudah / -lah")' },
    { suffix: 'mo', role: 'partikel aspek ("sudah / telah")' },
    { suffix: 'di', role: 'partikel tanya ("-kah")' },
    { suffix: 'pa', role: 'partikel ("masih / nanti / biarlah")' },
    { suffix: 'na', role: 'posesif persona ke-3 ("-nya / mereka")' },
    { suffix: 'mu', role: 'posesif persona ke-2 ("-mu")' },
    { suffix: 'ta', role: 'posesif persona 1 jamak / 2 hormat ("kami / Anda")' },
    { suffix: 'aq', role: 'klitik inversi persona 1 tunggal ("saya")' },
    { suffix: 'o', role: 'klitik inversi persona 2 tunggal ("kamu")' },
    { suffix: 'i', role: 'sufiks transitif/lokatif atau klitik persona 3 ("dia / itu")' },
    { suffix: 'u', role: 'posesif persona 1 tunggal ("-ku")' },
  ];

  const BOOK_GUIDE_DATA = {
    phonemes: {
      vowels: [
        { symbol: '/a/', letter: 'a', example: 'anning', meaning: 'kening', ipa: '/a/' },
        { symbol: '/i/', letter: 'i', example: 'itaq', meaning: 'kita', ipa: '/i/' },
        { symbol: '/u/', letter: 'u', example: 'uma', meaning: 'kebun', ipa: '/u/' },
        { symbol: '/e/', letter: 'e', example: 'eme', meaning: 'rendam', ipa: '/e/' },
        { symbol: '/o/', letter: 'o', example: 'ondong', meaning: 'lompat', ipa: '/o/' },
      ],
      consonants: [
        { letter: 'b', front: 'bau (ikan)', mid: 'lamba (pergi)', end: '—', ipa: '/b/' },
        { letter: 'c', front: 'caniq (madu)', mid: 'bocok (kelambu)', end: '—', ipa: '/tʃ/' },
        { letter: 'd', front: 'dalleq (rezeki)', mid: 'adaq (adat)', end: '—', ipa: '/d/' },
        { letter: 'g', front: 'golla (gula)', mid: 'masigi (masjid)', end: '—', ipa: '/ɡ/' },
        { letter: 'h', front: 'haraq (harap)', mid: 'Ahaq (Ahad)', end: '—', ipa: '/h/' },
        { letter: 'j', front: 'jari (jadi)', mid: 'jeqjeq (gagap)', end: '—', ipa: '/dʒ/' },
        { letter: 'k', front: 'kanneq (nenek)', mid: 'bakuq (bakul)', end: '—', ipa: '/k/' },
        { letter: 'l', front: 'laliq (lalat)', mid: 'ala (ambil)', end: 'sombal (layar)', ipa: '/l/' },
        { letter: 'm', front: 'muaq (kalau)', mid: 'namoq (nyamuk)', end: '—', ipa: '/m/' },
        { letter: 'n', front: 'nana (nanah)', mid: 'indaq (injak)', end: 'tongan (betul)', ipa: '/n/' },
        { letter: 'p', front: 'pare (padi)', mid: 'appeq (empat)', end: '—', ipa: '/p/' },
        { letter: 'r', front: 'raiq (jahit)', mid: 'areq (perut)', end: 'taqgar (karat)', ipa: '/r/' },
        { letter: 's', front: 'seqde (samping)', mid: 'asu (anjing)', end: 'mammis (manis)', ipa: '/s/' },
        { letter: 't', front: 'tau (orang)', mid: 'ate (hati)', end: '—', ipa: '/t/' },
        { letter: 'ng', front: 'nganga (mulut)', mid: 'dongiq (pipit)', end: 'losong (bohong)', ipa: '/ŋ/' },
        { letter: 'ny', front: 'nyamang (nyaman)', mid: 'manyang (tuak)', end: '—', ipa: '/ɲ/' },
        { letter: 'w', front: 'wai (air)', mid: 'bowo (lengan)', end: '—', ipa: '/w/' },
        { letter: 'y', front: '—', mid: 'ayu (kayu)', end: '—', ipa: '/j/' },
        { letter: 'q', front: '—', mid: 'laqbi (lebih)', end: 'rakkeq (takut)', ipa: '/ʔ/' },
      ],
      allophones: [
        { phoneme: '/b/', condition: 'Diapit dua vokal (V-b-V)', sound: '[w]', example: '/abang/ → [awang] ("dedak")' },
        { phoneme: '/d/', condition: 'Diapit dua vokal (V-d-V)', sound: '[ð] (bunyi Arab ذ)', example: '/tedong/ → [tedzong] ("kerbau")' },
        { phoneme: '/g/', condition: 'Diapit dua vokal (V-g-V)', sound: '[ɣ] (bunyi Arab غ)', example: '/suruga/ → [surugha] ("surga")' },
        { phoneme: '/j/', condition: 'Diapit dua vokal (V-j-V)', sound: '[j] (/y/)', example: '/bija/ → [biya] ("keturunan")' },
      ],
      nasalAssimilations: [
        ['-ng + b-', '-mb-', 'diang bomo → diambomo', 'ada lagi'],
        ['-ng + p-', '-pp-', 'sangnging pabotor → sangngippawotor', 'semuanya penjudi'],
        ['-ng + d-', '-nd-', 'andiang doiq → andiandoiq', 'tidak ada uang'],
        ['-ng + t-', '-tt-', 'diang toqo → diattoqo', 'ada juga'],
        ['-ng + c-', '-cc-', 'diang cinnana → diaccinnana', 'ada keinginannya'],
        ['-ng + k-', '-kk-', 'buyang kenuq → buyakkenuq', 'kertas robek'],
        ['-ng + j-', '-nj-', 'boyang jappoq → boyanjappoq', 'rumah lapuk'],
        ['-ng + s-', '-ss-', 'sangnging sugiq → sangngissugiq', 'semuanya kaya'],
        ['-ng + h-', '-hh-', 'diang harapang → diahharapang', 'ada harapan'],
        ['-ng + m-', '-mm-', 'diang mo → diammo', 'sudah ada'],
        ['-ng + n-', '-nn-', 'diang naita → diannaita', 'ada ia lihat'],
        ['-ng + ny-', '-nyny-', 'diang nyamang → dianynyamang', 'ada kenikmatan'],
        ['-ng + l-', '-ll-', 'sumbang lao i → sumballao i', 'tumbang ke situ'],
        ['-ng + r-', '-rr-', 'sangnging ropu i → sangngirropu i', 'semua musnah'],
        ['-ng + w-', '-ww-', 'diang wai na → diawwainna', 'ada airnya'],
        ['-ng + y-', '-yy-', 'diang yamiq → diayyamiq', 'ada kami'],
      ],
    },
    canonicalForms: [
      { syllables: '1 Suku Kata', general: '(K)V(K)', examples: 'V: a ("ah"), KV: da ("jangan"), KVK: bung ("ubun-ubun"), soh' },
      { syllables: '2 Suku Kata', general: '(K)V(K)(K)V(K)', examples: 'VV: ia, KVV: tau, VKV: api, KVKV: mala/pole, VKKV: alli, KVKKVK: bukkus' },
      { syllables: '3 Suku Kata', general: '(K)V(K)(K)V(K)(K)V(K)', examples: 'VKVV: arua, VKVKV: urawa, VKVKKV: amessá, KVKVKVK: malimang, KVKKVKVK: sambayang' },
      { syllables: '4 Suku Kata', general: 'KVKV(K)(K)V(K)V(K)', examples: 'KVKVKVKV: malasuyi, KVKVKKVKVK: kaluppiniq, KVKVKVKKVK: kaluwambang, KVKVKKVKV: kalindoro' },
    ],
    affixes: [
      { name: 'Prefiks me- / mi-', category: 'Prefiks', pdfPage: 22, bookPage: 'xxi–xxiii', meaning: 'Bila kata dasar nomina berarti "memakai/ber-"; bila verba membentuk kerja transitif.', allomorphs: 'meq-/miq- (sebelum a,i,u,e,o,g); mec-, meh-, mek-, mel-, mem-, men-, mep-, mer-, mes-, met-, meng-, meny-', examples: 'mebayu (berbaju), mettuleq (bertanya), meqoro (duduk), mekkaeqdeq/mekkeqdeq (berdiri)' },
      { name: 'Prefiks ma-', category: 'Prefiks', pdfPage: 24, bookPage: 'xxiii–xxv', meaning: 'Verba aktif transitif ("me-"); adjektiva tanpa alomorf (malotong, mapute); nomina ("ber-").', allomorphs: 'maq- (sebelum a,i,u,e,o,b,g); mac-, mah-, mak-, mal-, mam-, man-, map-, mar-, mas-, mat-, mang-, many-', examples: 'massaka (menangkap), maqita (melihat), malotong (hitam), mamboyang (berkeluarga)' },
      { name: 'Prefiks pe- / pi-', category: 'Prefiks', pdfPage: 27, bookPage: 'xxvi–xxvii', meaning: 'Pada bilangan bermakna "kali" (pendaqdua); pada verba bermakna "gemar/pe-" atau perintah halus. Dapat bergabung dengan -i / -ang.', allomorphs: 'peq-, pec-, pek-, pel-, pem-, pen-, pep-, per-, pet-, pes-, peng-', examples: 'pendaqdua (dua kali), pellamba (pejalan), peqoro moqo! (duduklah kamu!), pendaiqi (menaiki)' },
      { name: 'Prefiks pa-', category: 'Prefiks', pdfPage: 28, bookPage: 'xxvii–xxviii', meaning: 'Menyatakan perintah / kausatif ("buat supaya ..."), serta pembentuk nomina pelaku/alat/hasil.', allomorphs: 'pah-, pal-, pam-, pap-, par-, pas-, pang-', examples: 'padundu aq! (minumkan saya!), paloppaq i wai! (panaskan air!), pammase (berkah), pappasang (amanat)' },
      { name: 'Konfiks a- ... -ang', category: 'Prefiks + Sufiks', pdfPage: 29, bookPage: 'xxviii', meaning: 'Prefiks a- tidak berdiri sendiri; wajib bergabung dengan -ang membentuk nomina abstrak.', allomorphs: 'Kombinasi dengan pe-/me- dan -i', examples: 'ameloang (kemauan), amongeang (penyakit), anarangang (kepandaian)' },
      { name: 'Prefiks ke-', category: 'Prefiks', pdfPage: 30, bookPage: 'xxix', meaning: 'Bermakna kepemilikan ("mempunyai ...").', allomorphs: '—', examples: 'kebara-barang (mempunyai kekayaan), keanaq (mempunyai anak)' },
      { name: 'Prefiks ka- (+ ulang)', category: 'Prefiks', pdfPage: 30, bookPage: 'xxix', meaning: 'Bergabung dengan kata kerja berulang, bermakna "suka / gemar melakukan ...".', allomorphs: '—', examples: 'kaala-ala (panjang tangan), kapau-pau (suka bicara/mengadu), katimbe-timbe' },
      { name: 'Prefiks na-', category: 'Prefiks / Pelaku', pdfPage: 30, bookPage: 'xxix', meaning: 'Menunjukkan pelaku orang ke-3 ("dia me-...") sekaligus bermakna pasif pada konteks tertentu.', allomorphs: '—', examples: 'dota i natuttuq (lebih baik ia dipukul), naperoaq mangino (ia mengajak bermain)' },
      { name: 'Prefiks di-', category: 'Prefiks', pdfPage: 31, bookPage: 'xxx', meaning: 'Membentuk verba pasif ("di-...") bila melekat pada kata kerja. (Berbeda dengan kata depan "di" yang ditulis terpisah!).', allomorphs: '—', examples: 'didundu (diminum), diande (dimakan), ditarukkung (dipenjara)' },
      { name: 'Prefiks ti-', category: 'Prefiks', pdfPage: 31, bookPage: 'xxx', meaning: 'Bermakna ketidaksengajaan atau keadaan ("ter-...").', allomorphs: '—', examples: 'titedo (tersandung), tibangngang (terheran-heran), tiappas' },
      { name: 'Prefiks si- / sia-', category: 'Prefiks', pdfPage: 31, bookPage: 'xxx–xxxi', meaning: 'Bermakna resiprokal ("saling me-" / "ber-...-an"). Kombinasi sia- berarti banyak pelaku "ber-...-an".', allomorphs: 'si-, sia-', examples: 'sitimbe (saling lempar), sikottaq (saling mencintai), siaondong (berlompatan), siasangiq (bertangis-tangisan)' },
      { name: 'Prefiks um-', category: 'Prefiks', pdfPage: 32, bookPage: 'xxxi', meaning: 'Terbatas pada sejumlah kata; bermakna aktif ("me-", "ber-", atau "dalam keadaan").', allomorphs: '—', examples: 'ummewa (melawan), ummondong (melompat), ummorong (berenang)' },
      { name: 'Sisipan -um-, -al-, -ar-', category: 'Infiks', pdfPage: 32, bookPage: 'xxxi–xxxii', meaning: 'Kurang produktif; kata bersisipan tidak dapat lagi digabung afiks lain. -um- berarti melakukan pekerjaan dasar.', allomorphs: '-um-, -al-, -ar-', examples: 'tumekeq (memanjat), lumamba (pergi), tumetteq (bertenun), kalekeq (gelitik), karepus (buruk)' },
      { name: 'Akhiran -ang, -i, -mu, -u', category: 'Sufiks', pdfPage: 34, bookPage: 'xxxiii', meaning: '-ang (tempat / benefaktif "-kan"); -i (lokatif/berulang); -mu & -u (posesif kepemilikan).', allomorphs: '—', examples: 'dunduang (tempat minum), alangang (ambilkan), tuttuqi (pukuli), kaderau (kursiku), lopimmu (perahumu)' },
      { name: 'Partikel / Kata Tugas', category: 'Partikel Klitik', pdfPage: 34, bookPage: 'xxxiii–xxxiv', meaning: 'Membantu menjelaskan aspek waktu, penegasan, atau pertanyaan pada kata sebelumnya.', allomorphs: '-mi, -mo, -di, -pa, -pai, -boi, -bopa, -toi, -toqo, -tuqu, -bandi, -nasang, -dua, -duai', examples: 'meloqmi (ia sudah mau), diangmo (sudah ada), apadi (apakah), madondong pai (nanti besok)' },
    ],
    pronouns: [
      { person: 'Persona 1 Tunggal (Saya/Aku)', seri1: 'iyau', pelaku: 'u-', pemilik: '-u', inversi: '-aq / -maq' },
      { person: 'Persona 1 Jamak (Kami/Kita)', seri1: 'iyamiq / itaq', pelaku: '—', pemilik: '-taq / -ta / -mang', inversi: '-mang / -i' },
      { person: 'Persona 2 Tunggal (Kamu/Anda)', seri1: 'iqo / itaq', pelaku: 'mu- / ta-', pemilik: '-mu / -ta', inversi: '-o / moqo / -i tau' },
      { person: 'Persona 2 Jamak (Kamu semua)', seri1: 'iqo nasang / itaq nasang', pelaku: 'mu-... mieq', pemilik: '-mu mieq (-meq)', inversi: '-nasang oqo / -nasang moqo / -nasang mi tau' },
      { person: 'Persona 3 Tunggal (Ia/Dia)', seri1: 'iya', pelaku: 'na-', pemilik: '-na', inversi: '-i / -di' },
      { person: 'Persona 3 Jamak (Mereka)', seri1: 'iseqiya', pelaku: 'na-... iseqiya', pemilik: '-na iseqiya', inversi: '-i iseqiya / -di iseqiya' },
    ],
    symbols: [
      { symbol: '==  atau  --', desc: 'Pengganti kata pokok (lema utama) di dalam contoh pemakaian kamus.' },
      { symbol: '~', desc: 'Pengganti sublema / kata bawahan pada contoh pemakaian.' },
      { symbol: '_', desc: '1. Penunjuk kata tugas (partikel) pada kata pokok; 2. Penunjuk afiks (imbuhan); 3. Penghubung.' },
      { symbol: '( q ) / q', desc: 'Melambangkan fonem konsonan hambat glotal /ʔ/ serta penanda posisi penghentian bunyi.' },
      { symbol: '(…)', desc: 'Menunjukkan unsur fakultatif, fonem pelancar, pengganti fonem final, atau label keterangan.' },
      { symbol: '/……/', desc: 'Lambang fonem / transkripsi fonemik.' },
      { symbol: ':', desc: 'Pengantar rangkaian atau perincian.' },
      { symbol: '( ˉ )', desc: 'Penanda vokal panjang.' },
      { symbol: '±', desc: 'Kira-kira / kurang lebih.' },
    ],
    loanwordRules: [
      { rule: 'Konsonan hambat di akhir kata cenderung menjadi /q/', example: 'rapat → rapaq, camat → camaq, politik → politiq, sujud → suyuq' },
      { rule: 'Nasal /n/ pada akhir kata menjadi /ng/', example: 'bidan → bidang, telepon → talipong, presiden → parasideng, jembatan → jambatang' },
      { rule: 'Konsonan /s, w, y, l, r/ tetap; /h/ cenderung hilang', example: 'pegawai → pegawe, dokter → dottor, kapal → kappal, khatam → tammaq, harap → haraq' },
      { rule: 'Vokal pada umumnya tidak mengalami perubahan', example: 'radio → radio, sepeda → sapeda, polisi → pulisi, film → peleng' },
    ],
    lontaraqTable: [
      { glyph: 'ᨀ', latin: 'ka' }, { glyph: 'ᨁ', latin: 'ga' }, { glyph: 'ᨂ', latin: 'nga' }, { glyph: 'ᨃ', latin: 'ngka' },
      { glyph: 'ᨄ', latin: 'pa' }, { glyph: 'ᨅ', latin: 'ba' }, { glyph: 'ᨆ', latin: 'ma' }, { glyph: 'ᨇ', latin: 'mpa' },
      { glyph: 'ᨈ', latin: 'ta' }, { glyph: 'ᨉ', latin: 'da' }, { glyph: 'ᨊ', latin: 'na' }, { glyph: 'ᨋ', latin: 'nra' },
      { glyph: 'ᨌ', latin: 'ca' }, { glyph: 'ᨍ', latin: 'ja' }, { glyph: 'ᨎ', latin: 'nya' }, { glyph: 'ᨏ', latin: 'nca' },
      { glyph: 'ᨐ', latin: 'ya' }, { glyph: 'ᨑ', latin: 'ra' }, { glyph: 'ᨒ', latin: 'la' }, { glyph: 'ᨓ', latin: 'wa' },
      { glyph: 'ᨔ', latin: 'sa' }, { glyph: 'ᨕ', latin: 'a' }, { glyph: 'ᨖ', latin: 'ha' },
    ],
    lontaraqVowels: [
      { vowel: 'a', mark: '', sample: 'ᨀ', label: 'Vokal bawaan (a)', position: 'Tanpa tanda diakritik (ka)' },
      { vowel: 'i', mark: '\u1A17', sample: 'ᨀ\u1A17', label: 'Tettiq di yaseq (i)', position: 'Titik di atas huruf (ki)' },
      { vowel: 'u', mark: '\u1A18', sample: 'ᨀ\u1A18', label: 'Tettiq di naung (u)', position: 'Titik di bawah huruf (ku)' },
      { vowel: 'e', mark: '\u1A19', sample: 'ᨀ\u1A19', label: 'Anaq sureq ri olo (e)', position: 'Tanda di depan / kiri huruf (ke)' },
      { vowel: 'o', mark: '\u1A1A', sample: 'ᨀ\u1A1A', label: 'Anaq sureq ri boko (o)', position: 'Tanda di belakang / kanan huruf (ko)' },
    ],
  };

  /**
   * Analyze canonical K/V syllable pattern following PDF section 2.1 (hlm. xviii-xxi).
   */
  function analyzeCanonicalPattern(word) {
    const clean = String(word || '')
      .toLowerCase()
      .split(',')[0]
      .replace(/[^a-z']/g, '')
      .replace(/'/g, 'q');
    if (!clean) return { pattern: '', syllables: 0 };

    let pattern = '';
    let i = 0;
    let vowels = 0;
    while (i < clean.length) {
      const two = clean.slice(i, i + 2);
      if (two === 'ng' || two === 'ny') {
        pattern += 'K';
        i += 2;
        continue;
      }
      const ch = clean[i];
      if ('aiueo'.includes(ch)) {
        pattern += 'V';
        vowels++;
      } else {
        pattern += 'K';
      }
      i++;
    }
    return { clean, pattern, syllables: vowels };
  }

  /**
   * Generate IPA transcription for Mandar word following PDF section 1.1-1.4 rules
   * (24 phonemes, glottal /q/ -> ʔ, geminates, intervocalic /b d g j/ allophones, penultimate stress).
   */
  function toMandarIpa(word) {
    const clean = String(word || '')
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/['`\u2018\u2019]/g, 'q');
    if (!clean) return { phonemic: '', narrow: '' };

    const mapSegment = (tok) => {
      const tokens = [];
      let i = 0;
      while (i < tok.length) {
        const two = tok.slice(i, i + 2);
        if (two === 'ng') {
          tokens.push({ ipa: 'ŋ', isVowel: false, raw: 'ng' });
          i += 2;
        } else if (two === 'ny') {
          tokens.push({ ipa: 'ɲ', isVowel: false, raw: 'ny' });
          i += 2;
        } else {
          const ch = tok[i];
          const map = {
            a: 'a', i: 'i', u: 'u', e: 'e', o: 'o',
            b: 'b', c: 'tʃ', d: 'd', g: 'ɡ', h: 'h',
            j: 'dʒ', k: 'k', l: 'l', m: 'm', n: 'n',
            p: 'p', r: 'r', s: 's', t: 't', w: 'w',
            y: 'j', q: 'ʔ', '-': '.',
          };
          const ipa = map[ch] ?? ch;
          tokens.push({ ipa, isVowel: 'aiueo'.includes(ch), raw: ch });
          i++;
        }
      }

      // Collapse identical adjacent consonants into geminate length (ː)
      const phonemicArr = [];
      const narrowArr = [];
      for (let idx = 0; idx < tokens.length; idx++) {
        const cur = tokens[idx];
        const prev = tokens[idx - 1];
        const next = tokens[idx + 1];

        if (!cur.isVowel && cur.raw !== '-' && next && next.raw === cur.raw) {
          phonemicArr.push(cur.ipa + 'ː');
          narrowArr.push(cur.ipa + 'ː');
          idx++;
          continue;
        }

        phonemicArr.push(cur.ipa);

        // Intervocalic voiced-stop allophones from PDF 1.3.1
        if (prev?.isVowel && next?.isVowel) {
          if (cur.raw === 'b') { narrowArr.push('w'); continue; }
          if (cur.raw === 'd') { narrowArr.push('ð'); continue; }
          if (cur.raw === 'g') { narrowArr.push('ɣ'); continue; }
          if (cur.raw === 'j') { narrowArr.push('j'); continue; }
        }
        narrowArr.push(cur.ipa);
      }

      const phonemic = phonemicArr.join('').replace(/\.+/g, '.');
      const narrow = narrowArr.join('').replace(/\.+/g, '.');
      return { phonemic, narrow };
    };

    const parts = clean.split(/\s+/).filter(Boolean).map(mapSegment);
    const phonemicStr = parts.map((p) => p.phonemic).join(' ');
    const narrowStr = parts.map((p) => p.narrow).join(' ');

    return {
      phonemic: `/${phonemicStr}/`,
      narrow: narrowStr !== phonemicStr ? `[${narrowStr}]` : '',
      stressRule:
        analyzeCanonicalPattern(clean).syllables >= 2
          ? 'Tekanan jatuh pada suku kedua dari belakang'
          : 'Bersuku kata tunggal',
    };
  }

  /**
   * Expand book prose abbreviations (dng, yg, dr, kpd, ...) cleanly for learners.
   */
  function expandBookAbbreviations(text) {
    let out = String(text || '');
    for (const [re, full] of PROSE_ABBR_EXPANSIONS) {
      out = out.replace(re, full);
    }
    return out;
  }

  /**
   * Detect probable prefix, reduplication, or suffix/clitic morphology of a Mandar word.
   */
  function analyzeWordMorphology(word, vocabMap) {
    const clean = String(word || '').split(',')[0].trim().toLowerCase();
    if (!clean) return null;

    if (clean.startsWith('-')) {
      return {
        kind: 'afiks',
        parts: [{ role: 'partikel/klitik', token: clean }],
        note: 'Bentuk terikat (imbuhan / klitik)',
        rootCandidate: clean.slice(1),
      };
    }

    if (clean.includes('-')) {
      const halves = clean.split('-').filter(Boolean);
      const rootGuess = halves[halves.length - 1] || clean;
      return {
        kind: 'reduplikasi',
        parts: halves.map((h) => ({ role: 'pengulangan', token: h })),
        note: 'Kata ulang (reduplikasi)',
        rootCandidate: rootGuess,
      };
    }

    // Check geminated me/ma/pe allomorphs first (e.g. meccoko -> mec + coko)
    for (const basePref of ['me', 'mi', 'ma', 'pe', 'pi']) {
      const m = new RegExp(`^${basePref}([cklmnprst])\\1([a-z]{2,})$`).exec(clean);
      if (m) {
        const rootGuess = `${m[1]}${m[2]}`;
        if (!vocabMap || vocabMap.has(rootGuess)) {
          return {
            kind: 'berimbuhan',
            prefix: `${basePref}${m[1]}-`,
            baseRule: `${basePref}-`,
            meaning: `Alomorf ${basePref}- sebelum konsonan /${m[1]}/`,
            rootCandidate: rootGuess,
          };
        }
      }
    }

    for (const rule of PREFIX_RULES) {
      if (clean.startsWith(rule.prefix) && clean.length > rule.prefix.length + 2) {
        const stem = clean.slice(rule.prefix.length);
        // Accept immediately if root exists in dictionary or rule is unambiguous (meq/maq/peq/di/na/ti/sia)
        const unambiguous = ['meq', 'miq', 'maq', 'peq', 'sia', 'di', 'ti'].includes(rule.prefix);
        if ((vocabMap && vocabMap.has(stem)) || unambiguous) {
          return {
            kind: 'berimbuhan',
            prefix: `${rule.prefix}-`,
            baseRule: rule.baseRule,
            meaning: rule.meaning,
            rootCandidate: stem,
          };
        }
      }
    }

    for (const suf of CLITIC_AND_SUFFIX_RULES) {
      if (clean.endsWith(suf.suffix) && clean.length > suf.suffix.length + 2) {
        const stem = clean.slice(0, -suf.suffix.length);
        if (vocabMap && vocabMap.has(stem)) {
          return {
            kind: 'berimbuhan',
            suffix: `-${suf.suffix}`,
            meaning: suf.role,
            rootCandidate: stem,
          };
        }
      }
    }

    return { kind: 'dasar', rootCandidate: clean, note: 'Kata dasar / morfem bebas' };
  }

  /**
   * Parse Mandar <-> Indonesian usage examples cleanly from an entry's formatted segments.
   */
  function extractStructuredExamples(entry) {
    const segs = entry?.segments || [];
    let idx = 0;
    if (segs[0] && segs[0].role === 'bold') idx++;
    if (segs[idx] && segs[idx].role === 'homonym') idx++;

    const headBase = (entry.headword || '').split(',')[0].trim();
    const parentBase = (entry.parentHeadword || headBase).split(',')[0].trim();
    const expandPlaceholders = (txt) =>
      String(txt || '')
        .replace(/--/g, parentBase)
        .replace(/~/g, headBase)
        .trim();

    const examples = [];
    for (let i = idx; i < segs.length; i++) {
      const seg = segs[i];
      if (seg.role === 'bold' && !/^\d+$/.test(seg.text.trim())) {
        const mandar = expandPlaceholders(seg.text);
        const nextSeg = segs[i + 1];
        const indonesia = nextSeg && nextSeg.role === 'regular' ? nextSeg.text.trim() : '';
        if (mandar.length > 1) {
          examples.push({ mandar, indonesia });
        }
      }
    }
    return examples;
  }

  /**
   * Extract cross-references ("lihat ...") and usage notes (register/dialect/idiom)
   * grounded strictly in the entry's dictionary text.
   */
  function extractUsageAndReferences(entry) {
    const def = String(entry?.definitionText || '');
    const pos = entry?.pos || [];
    const crossRefs = [];
    const lihatMatch = /\b(?:lihat|lih\.?)\s+([a-zA-Z'-]+)/i.exec(def);
    if (lihatMatch) {
      crossRefs.push(lihatMatch[1].replace(/[.,;!?]+$/, ''));
    }

    const dialects = DIALECT_NAMES.filter((d) => new RegExp(`\\b${d}\\b`, 'i').test(def));
    const isIdiom = pos.includes('ukp') || pos.includes('pb') || pos.includes('ki') || /\b(kiasan|peribahasa)\b/i.test(def);
    const isCoarse = pos.includes('k') || /\bkasar\b/i.test(def);
    const isLoan = /\b(serapan|pinjaman)\b/i.test(def);

    const registerTags = [];
    if (isIdiom) registerTags.push('Ungkapan / Kiasan / Peribahasa');
    else if (isCoarse) registerTags.push('Ragam Kasar / Khusus');
    else if (pos.includes('i')) registerTags.push('Kata Seru / Percakapan');
    else registerTags.push('Ragam Baku Kamus (2025)');

    if (dialects.length > 0) {
      registerTags.push(`Konteks Wilayah: ${dialects.join(', ')}`);
    }
    if (isLoan) {
      registerTags.push('Kata Serapan');
    }

    return {
      crossRefs,
      dialects,
      isIdiom,
      registerTags,
    };
  }

  /**
   * Build complete grammar & inflection guidance box for an entry according to its POS.
   */
  function buildGrammarNotes(entry, vocabMap) {
    const pos = entry?.pos || [];
    const base = (entry?.headword || '').split(',')[0].trim();
    const morph = analyzeWordMorphology(base, vocabMap);
    const canonical = analyzeCanonicalPattern(base);
    const notes = [];

    const posLabels = pos.map((p) => POS_FULL_NAMES[p] || p);
    if (pos.includes('n')) {
      notes.push(`Pola kepemilikan (posesif): ${base}u (...ku), ${base}mu (...mu), ${base}na (...nya), ${base}ta (...kita/Anda).`);
    }
    if (pos.includes('v')) {
      notes.push(`Pola pelaku & pasif: u${base} (kupelajari/kulakukan), mu${base} (kau-), na${base} (ia-), di${base} (bentuk pasif).`);
    }
    if (pos.includes('a')) {
      notes.push('Sifat dalam Mandar lazim diawali ma- tanpa perubahan alomorf dan memakai reduplikasi/partikel penegas (-mi, -mo, sannaq).');
    }
    if (pos.includes('pron')) {
      notes.push('Bahasa Mandar membedakan Pronomina Seri I (bebas), Seri II (pelaku u-/mu-/na- & pemilik -u/-mu/-na), serta Seri III (inversi -aq/-o/-i).');
    }

    return {
      posLabels,
      canonical,
      morph,
      inflectionNotes: notes,
    };
  }

  /**
   * Tokenize and analyze a Mandar sentence or phrase word-by-word against the dictionary.
   */
  function analyzeMandarSentence(sentence, lookupFn, vocabMap) {
    const tokens = String(sentence || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return tokens.map((rawToken) => {
      const stripped = rawToken.replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu, '');
      const cleanLower = stripped.toLowerCase().replace(/['`\u2018\u2019]/g, 'q');
      const ipa = toMandarIpa(cleanLower);

      let exact = lookupFn ? lookupFn(cleanLower) : [];
      let morph = analyzeWordMorphology(cleanLower, vocabMap);
      let rootMatches = [];

      if ((!exact || exact.length === 0) && morph?.rootCandidate && morph.rootCandidate !== cleanLower && lookupFn) {
        rootMatches = lookupFn(morph.rootCandidate);
      }

      const chosen = (exact && exact[0]) || (rootMatches && rootMatches[0]) || null;
      return {
        raw: rawToken,
        clean: cleanLower,
        ipa: ipa.phonemic,
        morph,
        matchedDirect: Boolean(exact && exact.length > 0),
        entry: chosen,
      };
    });
  }

  /**
   * Basic Lontaraq Sulapa Eppa Unicode transliteration preview (educational visual helper).
   */
  const LONTARA_BASE_MAP = new Map(BOOK_GUIDE_DATA.lontaraqTable.map((x) => [x.latin, x.glyph]));
  const LONTARA_GLYPH_TO_LATIN = new Map(BOOK_GUIDE_DATA.lontaraqTable.map((x) => [x.glyph, x.latin]));
  const LONTARA_MARK_TO_VOWEL = { '\u1A17': 'i', '\u1A18': 'u', '\u1A19': 'e', '\u1A1A': 'o' };

  function latinToLontaraqPreview(text) {
    const clean = String(text || '').toLowerCase().replace(/['`\u2018\u2019q]/g, '');
    const out = [];
    let i = 0;
    while (i < clean.length) {
      if (/\s/.test(clean[i])) {
        out.push(' ');
        i++;
        continue;
      }
      if (/[.,;!?]/.test(clean[i])) {
        out.push('᨞');
        i++;
        continue;
      }
      if (!/[a-z]/.test(clean[i])) {
        i++;
        continue;
      }
      let cons = '';
      for (const cand of ['ngk', 'mp', 'nr', 'nc', 'ng', 'ny']) {
        if (clean.startsWith(cand, i)) {
          cons = cand;
          i += cand.length;
          break;
        }
      }
      if (!cons) {
        if ('bcdfghjklmnpqrstvwxyz'.includes(clean[i])) {
          cons = clean[i++];
        }
      }
      let vowel = 'a';
      const nextCh = clean[i] || '';
      if (nextCh && 'aiueo'.includes(nextCh)) {
        vowel = clean[i++];
      } else if (cons) {
        // Coda consonant without following vowel is unwritten in traditional Lontaraq
        continue;
      }
      const glyph = LONTARA_BASE_MAP.get(`${cons}a`) || LONTARA_BASE_MAP.get('a') || '';
      const diacritic = { a: '', i: '\u1A17', u: '\u1A18', e: '\u1A19', o: '\u1A1A' }[vowel] || '';
      if (glyph) out.push(glyph + diacritic);
    }
    return out.join('').trim() || 'ᨕ';
  }

  /**
   * Read Unicode Lontaraq script back into Latin syllable form.
   */
  function lontaraqToLatinPreview(lontarText) {
    const chars = Array.from(String(lontarText || ''));
    const out = [];
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch === '᨞') {
        out.push(',');
        continue;
      }
      if (/\s/.test(ch)) {
        out.push(' ');
        continue;
      }
      const base = LONTARA_GLYPH_TO_LATIN.get(ch);
      if (base) {
        const next = chars[i + 1];
        const vowel = next && LONTARA_MARK_TO_VOWEL[next];
        if (vowel) {
          out.push(base.slice(0, -1) + vowel);
          i++;
        } else {
          out.push(base);
        }
      } else if (!LONTARA_MARK_TO_VOWEL[ch]) {
        out.push(ch);
      }
    }
    return out.join('').replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();
  }

  global.KamusLinguistics = {
    POS_FULL_NAMES,
    BOOK_GUIDE_DATA,
    analyzeCanonicalPattern,
    toMandarIpa,
    expandBookAbbreviations,
    analyzeWordMorphology,
    extractStructuredExamples,
    extractUsageAndReferences,
    buildGrammarNotes,
    analyzeMandarSentence,
    latinToLontaraqPreview,
    lontaraqToLatinPreview,
  };
})(typeof window !== 'undefined' ? window : globalThis);
