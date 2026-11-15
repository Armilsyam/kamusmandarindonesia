/**
 * Kamus Digital Mandar–Indonesia — Sosial Media Edukatif (Boyang Digital)
 * Ruang interaksi sosial-edukasi untuk pelajar di Sulawesi Barat,
 * warga belajar & tutor PKBM (Pusat Kegiatan Belajar Masyarakat),
 * budayawan, dan komunitas diaspora suku Mandar.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'boyang_mandar_community_posts_v1';

  const SEED_POSTS = [
    {
      id: 'post-1',
      author: 'Nurul Aulia',
      role: 'Siswi SMKN 1 Majene (Kelas XI)',
      badge: '🎒 Pelajar Sulbar',
      category: 'pelajar',
      time: '2 jam yang lalu',
      mandarText: 'Meloaq meqguru apa bedana boyang beasa dng boyang adaq di Mandar?',
      artiText: 'Saya ingin belajar apa perbedaan rumah biasa dengan rumah adat di suku Mandar?',
      note: 'Tadi di kelas muatan lokal guru kami menjelaskan tentang arsitektur Boyang Adaq yang beratap tamping susun tiga untuk bangsawan/maraqdia. Ternyata arsitektur kayu leluhur Sulbar sangat jenius dan tahan guncangan gempa!',
      likes: 34,
      liked: false,
      comments: [
        { author: 'Pak Dahlan (Tutor PKBM)', text: 'Betul ananda Nurul! Boyang Adaq memiliki tiang bulat dan ornamen bunga Mandar, sedangkan Boyang Beasa tiangnya persegi.' },
        { author: 'Rizal (Pegiat Budaya)', text: 'Coba cari kata "boyang" di kamus, ada rujukan halaman 84 dengan ilustrasi panggungnya!' },
      ],
    },
    {
      id: 'post-2',
      author: 'Pak Dahlan, S.Pd.',
      role: 'Tutor PKBM Sipamandar (Polewali Mandar)',
      badge: '📖 Tutor PKBM',
      category: 'pkbm',
      time: '5 jam yang lalu',
      mandarText: 'Warga belajar Paket B antusias mappaqguru 23 inanna sureq Lontaraq Sulapa Eppa.',
      artiText: 'Warga belajar Paket B antusias belajar 23 huruf dasar aksara Lontara Sulapa Eppa.',
      note: 'Aplikasi Kamus Digital Mandar dari Boyang Digital ini sangat bermanfaat di kelas keaksaraan fungsional desa kami. Fitur Kamera Lontara dan audio lafal sangat memotivasi warga belajar yang tadinya kesulitan membaca huruf tradisional.',
      likes: 58,
      liked: false,
      comments: [
        { author: 'Ibu Nurhayati (Warga Belajar)', text: 'Alhamdulillah sekarang saya sudah bisa menulis nama anak pakai aksara Lontar!' },
        { author: 'Boyang Digital Admin', text: 'Semangat terus bapak/ibu warga belajar PKBM! Kami siapkan modul cetak luring untuk mendukung pembelajaran di desa.' },
      ],
    },
    {
      id: 'post-3',
      author: 'Daeng Malolo',
      role: 'Penggiat Sanggar Maritim Sandeq (Mamuju)',
      badge: '🏛️ Budayawan Sulbar',
      category: 'komunitas',
      time: '1 hari yang lalu',
      mandarText: 'Kupalolongang duang lopi, sambaq u lopiang, mau di lau, di timur namoala.',
      artiText: 'Kuhanyutkan dua perahu, satu perahu tumpuanku, biar berlayar ke barat maupun ke timur tetap berhasil.',
      note: 'Puisi Kalindaqdaq pembakar semangat pelaut Mandar dalam mengarungi samudra lepas dengan perahu Sandeq. Mari adik-adik pelajar di Sulbar rawat sastra lisan ini agar tidak lekang oleh zaman!',
      likes: 82,
      liked: false,
      comments: [
        { author: 'Armil Syam (Boyang Digital)', text: 'Salute Daeng! Puisi ini juga kita integrasikan ke kecerdasan Kaka AI agar generasi Gen-Z bisa belajar polanya (8-7-5-7 suku kata).' },
      ],
    },
    {
      id: 'post-4',
      author: 'Siti Rahma',
      role: 'Pengrajin Tenun Lipaq Saqbe Tinambung',
      badge: '🎨 Pengrajin Wastra',
      category: 'komunitas',
      time: '2 hari yang lalu',
      mandarText: "Batik Sure' Parara Sulawesi Barat simetris garisna, lambang keteguhan iman dng paqmai malaqbiq.",
      artiText: "Batik Sure' Parara Sulawesi Barat simetris garisnya, lambang keteguhan iman dan budi pekerti yang mulia.",
      note: "Corak garis Sure' Parara adalah warisan leluhur Mandar yang sangat kami jaga di Tinambung. Senang sekali motif ini diabadikan secara resmi di aplikasi kamus digital ini!",
      likes: 67,
      liked: false,
      comments: [
        { author: 'Fauziah (Siswi SMAN 2 Majene)', text: 'Motifnya cantik sekali kak, bangga memakai batik dan sarung tenun khas Sulbar!' },
      ],
    },
  ];

  const MANDAR_REELS = [
    {
      id: 'reel-1',
      title: "Etika Mengucap 'Tabeq'",
      subtitle: 'Tata Krama Luhur Suku Mandar',
      badge: '🗣️ Nilai Malaqbiq',
      mandarAudio: 'tabeq, meloaq lele',
      desc: "Kata 'Tabeq' wajib diucapkan saat lewat di depan orang tua, meminta izin, atau mengawali pembicaraan sopan sebagai cermin budaya Malaqbiq.",
      bgGradient: 'linear-gradient(135deg, #7f1d2b 0%, #3a0d14 100%)',
    },
    {
      id: 'reel-2',
      title: 'Perahu Sandeq Tercepat',
      subtitle: 'Mahakarya Maritim Bahari Sulbar',
      badge: '⛵ Warisan Bahari',
      mandarAudio: 'lopi sandeq mandar',
      desc: 'Mampu melaju hingga 30 knot hanya dengan layar segitiga (sombal) dan cadik bambu ganda (palatto) menaklukkan Selat Makassar.',
      bgGradient: 'linear-gradient(135deg, #0d3b66 0%, #05192d 100%)',
    },
    {
      id: 'reel-3',
      title: "Batik Sure' Parara",
      subtitle: 'Filosofi Garis Geometris',
      badge: '🎨 Wastra Sulawesi Barat',
      mandarAudio: "batik sure' parara sulbar",
      desc: 'Garis vertikal melambangkan hubungan dengan Tuhan; garis mendatar mencerminkan keharmonisan sosial masyarakat Sulawesi Barat.',
      bgGradient: 'linear-gradient(135deg, #8a5a00 0%, #3d2700 100%)',
    },
    {
      id: 'reel-4',
      title: 'Rahasia Huruf Glotal Q',
      subtitle: 'Ejaan Baku Kamus PDF 2025',
      badge: '📖 Kaidah Ejaan',
      mandarAudio: 'anaq, lipaq, boyang',
      desc: 'Huruf "q" di akhir kata melambangkan bunyi sentak glotal /ʔ/, membedakan "basa" (bahasa) dan "basaq" (basah).',
      bgGradient: 'linear-gradient(135deg, #2b4c3f 0%, #0d1e17 100%)',
    },
  ];

  class CommunityPlatform {
    constructor() {
      this.posts = this.loadPosts();
    }

    loadPosts() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        }
      } catch (err) {
        // Fallback to seeds on storage error
      }
      return JSON.parse(JSON.stringify(SEED_POSTS));
    }

    savePosts() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
        }
      } catch (err) {
        // Storage full or private mode
      }
    }

    getPosts(category = 'semua') {
      if (!category || category === 'semua') return this.posts;
      return this.posts.filter((p) => p.category === category);
    }

    getReels() {
      return MANDAR_REELS;
    }

    addPost(postData) {
      const newPost = {
        id: `post-${Date.now()}`,
        author: postData.author || 'Pelajar Mandar',
        role: postData.role || 'Warga Belajar Sulawesi Barat',
        badge: postData.badge || '🎒 Komunitas Edukasi',
        category: postData.category || 'pelajar',
        time: 'Baru saja',
        mandarText: postData.mandarText || '',
        artiText: postData.artiText || '',
        note: postData.note || '',
        likes: 1,
        liked: true,
        comments: [],
      };
      this.posts.unshift(newPost);
      this.savePosts();
      return newPost;
    }

    toggleLike(postId) {
      const p = this.posts.find((x) => x.id === postId);
      if (!p) return null;
      if (p.liked) {
        p.likes = Math.max(0, p.likes - 1);
        p.liked = false;
      } else {
        p.likes += 1;
        p.liked = true;
      }
      this.savePosts();
      return { likes: p.likes, liked: p.liked };
    }

    addComment(postId, commentData) {
      const p = this.posts.find((x) => x.id === postId);
      if (!p) return null;
      const c = {
        author: commentData.author || 'Sahabat Budaya',
        text: commentData.text || '',
      };
      if (!Array.isArray(p.comments)) p.comments = [];
      p.comments.push(c);
      this.savePosts();
      return c;
    }
  }

  global.KamusKomunitas = {
    createCommunityPlatform: () => new CommunityPlatform(),
    SEED_POSTS,
    MANDAR_REELS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
