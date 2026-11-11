(function (global) {
  'use strict';

  const SOUND_STORAGE_KEY = 'kamus_mandar_sound_enabled';

  function createAudioController() {
    let ctx = null;
    let soundEnabled = true;

    try {
      if (typeof global.window !== 'undefined' && global.localStorage) {
        const saved = global.localStorage.getItem(SOUND_STORAGE_KEY);
        if (saved === 'false') soundEnabled = false;
      }
    } catch {
      // Ignore storage access errors in restricted modes
    }

    function ensureContext() {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function playTone(freq, startOffset, duration, gainPeak = 0.045, type = 'triangle') {
      if (!soundEnabled) return;
      const ac = ensureContext();
      if (!ac) return;
      const now = ac.currentTime + startOffset;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    function playUiSound(kind = 'tap') {
      if (!soundEnabled) return;
      if (kind === 'copy') {
        playTone(783.99, 0, 0.14, 0.04, 'sine'); // G5
        playTone(987.77, 0.08, 0.2, 0.04, 'triangle'); // B5
        return;
      }
      if (kind === 'speak') {
        playTone(392.0, 0, 0.13, 0.035, 'triangle'); // G4 kecapi pluck
        playTone(587.33, 0.06, 0.16, 0.03, 'sine'); // D5 harmonic
        return;
      }
      // Subtle pentatonic Mandar pluck on navigation/filter
      playTone(440.0, 0, 0.11, 0.025, 'triangle');
    }

    function playSyllableCadence(spokenText) {
      if (!soundEnabled) return;
      const vowels = spokenText.match(/[aiueo]/gi) || ['a'];
      const scale = [293.66, 329.63, 392.0, 440.0, 523.25]; // D E G A C
      vowels.slice(0, 6).forEach((_, idx) => {
        playTone(scale[idx % scale.length], idx * 0.12, 0.14, 0.04, 'triangle');
      });
    }

    function setSoundEnabled(next) {
      soundEnabled = Boolean(next);
      try {
        if (typeof global.window !== 'undefined' && global.localStorage) {
          global.localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
        }
      } catch {
        // Ignore storage failure
      }
      if (soundEnabled) playUiSound('tap');
      return soundEnabled;
    }

    function isSoundEnabled() {
      return soundEnabled;
    }

    function pickIndonesianVoice(voices) {
      return (
        voices.find((v) => /^id[-_]?id$/i.test(v.lang)) ||
        voices.find((v) => /indones/i.test(`${v.name} ${v.lang}`)) ||
        voices.find((v) => /^ms[-_]?my$/i.test(v.lang)) ||
        null
      );
    }

    /**
     * Convert Mandar orthography into natural Indonesian TTS pronunciation
     * (q = glottal stop hamzah / ', expanding -- and ~ placeholders cleanly).
     */
    function toMandarPhonetic(text, { headword = '', parentHeadword = '' } = {}) {
      const cleanBase = String(headword || '').split(',')[0].replace(/\d+$/, '').trim();
      const cleanParent = String(parentHeadword || cleanBase).split(',')[0].replace(/\d+$/, '').trim();

      let expanded = String(text || '')
        .replace(/--/g, cleanParent || cleanBase || '')
        .replace(/~/g, cleanBase || cleanParent || '')
        .replace(/['`\u2018\u2019]/g, "'")
        .replace(/[ \t]+/g, ' ')
        .trim();

      // Convert /q/ glottal stop to apostrophe stop so Indonesian TTS doesn't say letter "kyu"
      const phoneticDisplay = expanded.replace(/q/gi, "'");
      const ttsSafe = expanded
        .replace(/\bq(?=[aeiou])/gi, "'")
        .replace(/q/gi, "'")
        .replace(/\b(a|i|u|e|o)\b/gi, '$1')
        .replace(/,/g, ', ');

      return {
        expanded,
        phoneticDisplay,
        ttsText: ttsSafe,
      };
    }

    function speakText(rawText, options = {}) {
      const { slow = false, onStatus } = options;
      const { ttsText, phoneticDisplay } = toMandarPhonetic(rawText, options);
      if (!ttsText) return;

      playUiSound('speak');

      if (!global.speechSynthesis || typeof global.SpeechSynthesisUtterance !== 'function') {
        playSyllableCadence(ttsText);
        if (onStatus) onStatus(`Lafal perkiraan: "${phoneticDisplay}" (browser tanpa TTS suara)`);
        return;
      }

      try {
        global.speechSynthesis.cancel();
        const utter = new global.SpeechSynthesisUtterance(ttsText);
        const voices = global.speechSynthesis.getVoices ? global.speechSynthesis.getVoices() : [];
        const idVoice = pickIndonesianVoice(voices);
        if (idVoice) utter.voice = idVoice;
        utter.lang = idVoice?.lang || 'id-ID';
        utter.rate = slow ? 0.68 : 0.88;
        utter.pitch = 1.0;

        if (onStatus) {
          onStatus(`Memutar pengucapan (${slow ? 'pelan' : 'normal'}): "${phoneticDisplay}"`);
        }
        utter.onerror = () => {
          playSyllableCadence(ttsText);
          if (onStatus) onStatus(`Panduan lafal: "${phoneticDisplay}"`);
        };
        global.speechSynthesis.speak(utter);
      } catch {
        playSyllableCadence(ttsText);
        if (onStatus) onStatus(`Panduan lafal: "${phoneticDisplay}"`);
      }
    }

    function extractFirstExampleMandar(entry) {
      const segs = entry?.segments || [];
      let idx = 0;
      if (segs[0] && segs[0].role === 'bold') idx++;
      if (segs[idx] && segs[idx].role === 'homonym') idx++;
      for (let i = idx; i < segs.length; i++) {
        if (segs[i].role === 'bold') {
          const text = segs[i].text.trim();
          if (text && !/^\d+$/.test(text)) {
            return text;
          }
        }
      }
      return null;
    }

    return {
      isSoundEnabled,
      setSoundEnabled,
      playUiSound,
      toMandarPhonetic,
      speakText,
      extractFirstExampleMandar,
    };
  }

  /**
   * 3 custom AI-generated hero artworks saved in public/assets/illustrations/.
   */
  const HERO_IMAGE_MAP = {
    lopi: {
      src: './assets/illustrations/lopi-sandeq.jpg',
      title: 'Lopi / Perahu Sandeq Mandar',
      caption: 'Perahu layar bercadik runcing khas pelaut Mandar (hlm. 259 & 391)',
    },
    sandeq: {
      src: './assets/illustrations/lopi-sandeq.jpg',
      title: 'Perahu Sandeq Mandar',
      caption: 'Perahu sandek tradisional Sulawesi Barat (hlm. 391)',
    },
    anjoro: {
      src: './assets/illustrations/anjoro.jpg',
      title: 'Anjoro (Kelapa)',
      caption: 'Buah kelapa muda, kelapa sabut, dan belahan kelapa segar (hlm. 21)',
    },
    sureq: {
      src: './assets/illustrations/batik-sure-para-sulbar.jpg',
      title: "Motif Sure' Para (Sureq)",
      caption: 'Corak garis kotak simetris tenun Lipaq Saqbe Sulawesi Barat (hlm. 431)',
    },
    curaq: {
      src: './assets/illustrations/batik-sure-para-sulbar.jpg',
      title: "Curaq / Sure' (Corak)",
      caption: 'Corak warna tradisional pada sarung dan perahu Mandar (hlm. 111 & 431)',
    },
    'disure-sureq': {
      src: './assets/illustrations/batik-sure-para-sulbar.jpg',
      title: 'Disure-sureq (Dicorak)',
      caption: 'Dihiasi motif garis & warna tradisional Mandar (hlm. 431)',
    },
  };

  /**
   * Detailed handcrafted SVG illustrations for verified concrete Mandar words.
   */
  const BESPOKE_WORD_SVGS = {
    boyang: {
      title: 'Boyang (Rumah Panggung Mandar)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Rumah Panggung Boyang Mandar">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="178" rx="125" ry="12" fill="#E6DEC9"/>
        <rect x="74" y="130" width="12" height="46" fill="#6D4728"/>
        <rect x="128" y="130" width="12" height="46" fill="#6D4728"/>
        <rect x="182" y="130" width="12" height="46" fill="#6D4728"/>
        <rect x="236" y="130" width="12" height="46" fill="#6D4728"/>
        <rect x="64" y="82" width="194" height="50" rx="3" fill="#B97A45" stroke="#53351D" stroke-width="2.5"/>
        <line x1="64" y1="98" x2="258" y2="98" stroke="#8C562B" stroke-width="1.5"/>
        <line x1="64" y1="114" x2="258" y2="114" stroke="#8C562B" stroke-width="1.5"/>
        <rect x="92" y="96" width="24" height="24" fill="#3D2614" stroke="#F4DFB6" stroke-width="2"/>
        <rect x="206" y="96" width="24" height="24" fill="#3D2614" stroke="#F4DFB6" stroke-width="2"/>
        <rect x="148" y="92" width="26" height="40" fill="#5A371C" stroke="#E5B974" stroke-width="2"/>
        <polygon points="46,84 161,22 276,84" fill="#6E2424" stroke="#3F1515" stroke-width="2.5"/>
        <polygon points="122,52 161,28 200,52" fill="#D4A64A" stroke="#53351D" stroke-width="2"/>
        <path d="M138,132 L120,178 M168,132 L150,178 M126,144 L156,144 M121,156 L151,156 M116,168 L146,168" stroke="#53351D" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
    },
    lipaq: {
      title: 'Lipaq Saqbe (Sarung Sutra Mandar)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Sarung Sutra Lipaq Saqbe Mandar">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="175" rx="110" ry="12" fill="#E6DEC9"/>
        <path d="M98,42 L222,42 L242,164 C205,172 115,172 78,164 Z" fill="#8E1F2F" stroke="#3D1219" stroke-width="2.5"/>
        <rect x="115" y="42" width="16" height="126" fill="#D9A738" opacity="0.85"/>
        <rect x="152" y="42" width="18" height="128" fill="#176C57" opacity="0.9"/>
        <rect x="190" y="42" width="14" height="126" fill="#1F3B73" opacity="0.88"/>
        <path d="M91,78 L229,78 M87,108 L233,108 M83,138 L237,138" stroke="#F0C75E" stroke-width="4" opacity="0.9"/>
        <path d="M90,85 L230,85 M86,115 L234,115 M82,145 L238,145" stroke="#182026" stroke-width="2" opacity="0.65"/>
        <ellipse cx="160" cy="42" rx="62" ry="10" fill="#5D131E" stroke="#3D1219" stroke-width="2"/>
      </svg>`,
    },
    saqbe: {
      title: 'Saqbe (Kain Sutra Tenun Mandar)',
      svg: null, // Reuses lipaq SVG below
    },
    jepa: {
      title: 'Jepa (Penganan Tradisional Mandar)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Makanan Tradisional Jepa Mandar">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="146" rx="108" ry="30" fill="#A67B46" stroke="#5E4120" stroke-width="2.5"/>
        <path d="M74,142 C100,118 215,116 246,144 C210,164 106,164 74,142 Z" fill="#3D7D44" stroke="#234F28" stroke-width="2"/>
        <ellipse cx="160" cy="130" rx="68" ry="19" fill="#E8C988" stroke="#8F6932" stroke-width="2"/>
        <ellipse cx="158" cy="116" rx="66" ry="18" fill="#F2D89B" stroke="#8F6932" stroke-width="2"/>
        <ellipse cx="156" cy="102" rx="64" ry="17" fill="#F7E3AE" stroke="#8F6932" stroke-width="2"/>
        <circle cx="135" cy="99" r="3" fill="#B57B3A"/><circle cx="162" cy="104" r="3.5" fill="#B57B3A"/><circle cx="184" cy="98" r="2.5" fill="#B57B3A"/><circle cx="148" cy="107" r="2.5" fill="#B57B3A"/>
      </svg>`,
    },
    bau: {
      title: 'Bau (Ikan Laut Mandar)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Ikan Laut Bau Mandar">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <path d="M40,162 Q90,148 140,162 T240,162 T290,158" fill="none" stroke="#84C5CE" stroke-width="4" stroke-linecap="round"/>
        <path d="M76,104 C120,66 196,68 232,104 C196,138 120,140 76,104 Z" fill="#467C9B" stroke="#1E3F54" stroke-width="2.5"/>
        <path d="M78,104 C122,96 192,98 228,104 C194,134 122,136 78,104 Z" fill="#CFE3EA"/>
        <polygon points="232,104 268,78 256,104 268,130" fill="#356682" stroke="#1E3F54" stroke-width="2"/>
        <path d="M138,76 L160,52 L176,75" fill="#5D96B5" stroke="#1E3F54" stroke-width="2"/>
        <path d="M148,110 L176,140 L192,118" fill="#82B7CE" stroke="#1E3F54" stroke-width="2"/>
        <circle cx="104" cy="96" r="5" fill="#FFFFFF" stroke="#1E3F54" stroke-width="2"/><circle cx="103" cy="96" r="2.2" fill="#1E3F54"/>
        <path d="M118,86 Q126,104 118,120" fill="none" stroke="#1E3F54" stroke-width="2"/>
      </svg>`,
    },
    loka: {
      title: 'Loka (Pisang)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Pisang Loka">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="170" rx="100" ry="12" fill="#E6DEC9"/>
        <path d="M74,150 C115,120 198,118 250,146 C195,168 112,166 74,150 Z" fill="#3D7D44" stroke="#224C26" stroke-width="2"/>
        <path d="M142,42 L176,42 L170,60 L146,60 Z" fill="#6E7C31" stroke="#3E471A" stroke-width="2"/>
        <path d="M146,60 C100,82 94,132 132,156 C118,122 126,86 156,64 Z" fill="#F2C83B" stroke="#7A5E14" stroke-width="2.2"/>
        <path d="M156,60 C128,92 132,142 164,160 C156,128 158,92 166,64 Z" fill="#F8D652" stroke="#7A5E14" stroke-width="2.2"/>
        <path d="M166,60 C154,96 168,144 196,154 C188,124 182,88 172,62 Z" fill="#EBBC2E" stroke="#7A5E14" stroke-width="2.2"/>
      </svg>`,
    },
    manuq: {
      title: 'Manuq (Ayam)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Ayam Manuq">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="162" cy="174" rx="84" ry="10" fill="#E6DEC9"/>
        <path d="M144,142 L138,172 M176,142 L182,172 M130,172 L144,172 M176,172 L192,172" stroke="#C8872B" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M196,94 C228,62 252,72 248,112 C234,98 220,98 206,112 Z" fill="#1C3A33" stroke="#10221E" stroke-width="2"/>
        <ellipse cx="164" cy="116" rx="46" ry="34" fill="#9E3B24" stroke="#471A0F" stroke-width="2.5"/>
        <path d="M114,82 C110,60 128,50 144,64 C150,82 146,102 128,116 C114,108 112,96 114,82 Z" fill="#C9582B" stroke="#471A0F" stroke-width="2.2"/>
        <path d="M118,56 C122,42 132,44 134,54 C140,44 148,48 144,60 Z" fill="#D12D2D" stroke="#6E1616" stroke-width="1.8"/>
        <polygon points="114,72 96,77 113,82" fill="#E6A532" stroke="#785110" stroke-width="1.8"/>
        <circle cx="124" cy="70" r="3" fill="#1B1B1B"/>
      </svg>`,
    },
    tedong: {
      title: 'Tedong (Kerbau)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Kerbau Tedong">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="164" cy="172" rx="104" ry="11" fill="#E6DEC9"/>
        <rect x="116" y="132" width="12" height="38" rx="4" fill="#4B4847" stroke="#252323" stroke-width="2"/>
        <rect x="138" y="132" width="12" height="38" rx="4" fill="#3B3837" stroke="#252323" stroke-width="2"/>
        <rect x="194" y="132" width="12" height="38" rx="4" fill="#4B4847" stroke="#252323" stroke-width="2"/>
        <rect x="216" y="132" width="12" height="38" rx="4" fill="#3B3837" stroke="#252323" stroke-width="2"/>
        <ellipse cx="172" cy="108" rx="64" ry="36" fill="#595554" stroke="#252323" stroke-width="2.5"/>
        <path d="M96,78 C74,58 76,34 102,44 C92,54 96,68 106,74" fill="#DCD6C8" stroke="#4D4840" stroke-width="2"/>
        <path d="M120,76 C142,56 140,34 114,44 C124,54 120,68 110,74" fill="#DCD6C8" stroke="#4D4840" stroke-width="2"/>
        <ellipse cx="108" cy="96" rx="22" ry="24" fill="#4B4847" stroke="#252323" stroke-width="2.5"/>
        <circle cx="99" cy="88" r="2.8" fill="#151515"/><circle cx="117" cy="88" r="2.8" fill="#151515"/>
        <ellipse cx="108" cy="110" rx="13" ry="8" fill="#322E2E"/>
      </svg>`,
    },
    api: {
      title: 'Api (Api)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Api">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="168" rx="92" ry="12" fill="#E6DEC9"/>
        <rect x="108" y="148" width="104" height="14" rx="6" transform="rotate(-8 160 155)" fill="#6E4728" stroke="#3D2411" stroke-width="2"/>
        <rect x="108" y="148" width="104" height="14" rx="6" transform="rotate(8 160 155)" fill="#855632" stroke="#3D2411" stroke-width="2"/>
        <path d="M160,34 C194,76 206,112 188,142 C176,158 144,158 132,142 C112,114 128,74 160,34 Z" fill="#E85A1B" stroke="#9E2D09" stroke-width="2.5"/>
        <path d="M160,64 C180,92 184,118 172,138 C166,148 154,148 148,138 C136,118 142,92 160,64 Z" fill="#F8B42D"/>
        <path d="M160,96 C168,112 170,126 160,140 C150,126 152,112 160,96 Z" fill="#FFF3B0"/>
      </svg>`,
    },
    bulang: {
      title: 'Bulang (Bulan)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Bulan Bulang">
        <rect width="320" height="200" fill="#182C4A" rx="8"/>
        <path d="M172,44 C138,48 118,82 126,116 C134,148 168,162 198,148 C166,150 148,128 148,98 C148,72 158,54 172,44 Z" fill="#F8DC75" stroke="#FFF2B2" stroke-width="2"/>
        <circle cx="92" cy="64" r="3" fill="#FFF6C4"/><circle cx="222" cy="68" r="3.5" fill="#FFF6C4"/><circle cx="238" cy="118" r="2.5" fill="#FFF6C4"/><circle cx="80" cy="126" r="2.2" fill="#FFF6C4"/>
        <path d="M24,172 Q88,158 160,172 T296,170" fill="none" stroke="#4D7CAE" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    },
    bunga: {
      title: 'Bunga (Kembang)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Bunga">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <path d="M160,174 Q162,126 160,92" fill="none" stroke="#2F7241" stroke-width="5" stroke-linecap="round"/>
        <path d="M160,140 C130,136 118,118 134,112 C148,108 158,124 160,140 Z" fill="#46965A" stroke="#245430" stroke-width="2"/>
        <path d="M160,132 C190,128 202,110 186,104 C172,100 162,116 160,132 Z" fill="#46965A" stroke="#245430" stroke-width="2"/>
        <circle cx="160" cy="54" r="20" fill="#E35B6B" stroke="#8C2634" stroke-width="2"/>
        <circle cx="188" cy="74" r="20" fill="#E35B6B" stroke="#8C2634" stroke-width="2"/>
        <circle cx="178" cy="106" r="20" fill="#E35B6B" stroke="#8C2634" stroke-width="2"/>
        <circle cx="142" cy="106" r="20" fill="#E35B6B" stroke="#8C2634" stroke-width="2"/>
        <circle cx="132" cy="74" r="20" fill="#E35B6B" stroke="#8C2634" stroke-width="2"/>
        <circle cx="160" cy="82" r="14" fill="#F6C846" stroke="#9B7411" stroke-width="2"/>
      </svg>`,
    },
    kopi: {
      title: 'Kopi (Kopi)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Cangkir Kopi">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="154" rx="88" ry="18" fill="#E8E4DA" stroke="#7A7365" stroke-width="2.2"/>
        <path d="M106,84 L214,84 L200,144 C194,154 126,154 120,144 Z" fill="#FFFFFF" stroke="#5A5347" stroke-width="2.5"/>
        <path d="M210,94 C236,94 236,130 204,132" fill="none" stroke="#5A5347" stroke-width="5"/>
        <ellipse cx="160" cy="84" rx="54" ry="12" fill="#4D2C16" stroke="#5A5347" stroke-width="2.2"/>
        <path d="M142,64 Q134,48 146,34 M162,62 Q154,44 166,30 M180,64 Q172,48 184,36" fill="none" stroke="#B5ABA0" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
    },
    pindang: {
      title: 'Pindang (Piring)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Piring Pindang">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="154" rx="92" ry="12" fill="#E6DEC9"/>
        <ellipse cx="160" cy="108" rx="96" ry="52" fill="#FFFFFF" stroke="#4D6882" stroke-width="3"/>
        <ellipse cx="160" cy="108" rx="76" ry="40" fill="none" stroke="#2D6A9F" stroke-width="2" stroke-dasharray="6 4"/>
        <ellipse cx="160" cy="108" rx="56" ry="28" fill="#F2F6FA" stroke="#85A7C4" stroke-width="1.5"/>
      </svg>`,
    },
    barras: {
      title: 'Barras (Beras)',
      svg: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi Beras Barras">
        <rect width="320" height="200" fill="#FAF8F4"/>
        <ellipse cx="160" cy="166" rx="88" ry="10" fill="#E6DEC9"/>
        <path d="M92,102 C106,68 214,68 228,102 Z" fill="#F5F3EC" stroke="#8F8879" stroke-width="2"/>
        <path d="M84,102 L236,102 C226,154 196,164 160,164 C124,164 94,154 84,102 Z" fill="#8C5830" stroke="#4B2D16" stroke-width="2.5"/>
        <ellipse cx="136" cy="90" rx="5" ry="2.2" fill="#D9D4C5"/><ellipse cx="162" cy="84" rx="5" ry="2.2" fill="#D9D4C5"/><ellipse cx="184" cy="92" rx="5" ry="2.2" fill="#D9D4C5"/>
      </svg>`,
    },
  };
  BESPOKE_WORD_SVGS.saqbe.svg = BESPOKE_WORD_SVGS.lipaq.svg;

  /**
   * Category-level visual SVGs for concrete picturable nouns across the dictionary.
   */
  const CATEGORY_SVGS = {
    maritim: {
      label: 'Bahari & Perahu',
      svg: BESPOKE_WORD_SVGS.bau.svg,
    },
    bangunan: {
      label: 'Rumah & Bangunan',
      svg: BESPOKE_WORD_SVGS.boyang.svg,
    },
    sandang: {
      label: 'Sandang & Tenun',
      svg: BESPOKE_WORD_SVGS.lipaq.svg,
    },
    flora: {
      label: 'Flora & Tumbuhan',
      svg: BESPOKE_WORD_SVGS.bunga.svg,
    },
    fauna: {
      label: 'Fauna & Satwa',
      svg: BESPOKE_WORD_SVGS.manuq.svg,
    },
    pangan: {
      label: 'Pangan & Kuliner',
      svg: BESPOKE_WORD_SVGS.jepa.svg,
    },
    alam: {
      label: 'Alam & Benda Langit',
      svg: BESPOKE_WORD_SVGS.bulang.svg,
    },
    perkakas: {
      label: 'Alat & Wadah',
      svg: BESPOKE_WORD_SVGS.pindang.svg,
    },
  };

  const CATEGORY_RULES = [
    { key: 'maritim', re: /\b(perahu|kapal|sampan|layar|dayung|laut|pantai|ombak|ikan|udang|kepiting|cumi|penyu|jala|pancing|pelabuhan|sauh)\b/i },
    { key: 'sandang', re: /\b(sarung|sutra|tenun|kain|baju|celana|topi|songkok|kopiah|selendang|corak|pakaian|ikat kepala)\b/i },
    { key: 'bangunan', re: /\b(rumah|pintu|jendela|atap|tiang|tangga|dapur|kamar|lantai|dinding|pagar|masjid|balai|pondok)\b/i },
    { key: 'pangan', re: /\b(makanan|penganan|kue|nasi|beras|pisang|kelapa|kopi|gula|garam|sayur|daging|minyak|serabi|ketupat|telur|sup)\b/i },
    { key: 'fauna', re: /\b(ayam|burung|kerbau|kambing|sapi|kuda|anjing|kucing|bebek|itik|rusa|ular|lebah|kupu)\b/i },
    { key: 'flora', re: /\b(pohon|tumbuhan|tanaman|daun|bunga|kembang|buah|akar|batang|ranting|bambu|rotan|padi|jagung|hutan)\b/i },
    { key: 'alam', re: /\b(api|bulan|matahari|bintang|awan|hujan|angin|gunung|bukit|sungai|batu|tanah|pasir|petir)\b/i },
    { key: 'perkakas', re: /\b(piring|mangkuk|cerek|gelas|sendok|parang|pisau|keris|tombak|keranjang|tikar|tali|bakul|lesung|talam)\b/i },
  ];

  function isPicturableEntry(entry) {
    const pos = entry?.pos || [];
    const head = (entry?.headword || '').split(',')[0].trim().toLowerCase();
    if (HERO_IMAGE_MAP[head] || BESPOKE_WORD_SVGS[head]) return true;
    // Strictly avoid forcing pictures on purely grammatical/abstract particles, pronouns, clitics
    return pos.includes('n');
  }

  function getEntryIllustration(entry) {
    if (!entry) return null;
    const head = (entry.headword || '').split(',')[0].trim().toLowerCase();

    // Special check so sandeq [a] "runcing" doesn't show boat if another homonym isn't noun
    if (head === 'sandeq' && !(entry.pos || []).includes('n')) {
      return null;
    }

    if (HERO_IMAGE_MAP[head]) {
      return {
        kind: 'image',
        src: HERO_IMAGE_MAP[head].src,
        title: HERO_IMAGE_MAP[head].title,
        caption: HERO_IMAGE_MAP[head].caption,
        badge: 'Ilustrasi Khusus',
      };
    }

    if (BESPOKE_WORD_SVGS[head]) {
      return {
        kind: 'svg',
        svg: BESPOKE_WORD_SVGS[head].svg,
        title: BESPOKE_WORD_SVGS[head].title,
        caption: `Ilustrasi kata "${entry.headword}" (hlm. ${entry.source?.bookPage || '-'})`,
        badge: 'Ilustrasi Kosakata',
      };
    }

    if (!isPicturableEntry(entry)) {
      return null;
    }

    const def = String(entry.definitionText || '').toLowerCase();
    for (const rule of CATEGORY_RULES) {
      if (rule.re.test(def)) {
        const cat = CATEGORY_SVGS[rule.key];
        return {
          kind: 'svg',
          svg: cat.svg,
          title: `${entry.headword} — ${cat.label}`,
          caption: `Ilustrasi kategori ${cat.label} (nomina konkret)`,
          badge: cat.label,
        };
      }
    }

    return null;
  }

  /**
   * 3 traditional West Sulawesi Sure' Para / Lipaq Saqbe SVG textile pattern designs.
   */
  const SURE_PARA_VARIANTS = {
    klasik: {
      name: "Sure' Para Klasik (Merah Marun & Emas)",
      note: 'Garis vertikal dan horizontal bersilang simetris di atas dasar marun hangat berbingkai benang emas, melambangkan keteguhan adat dan keharmonisan sosial masyarakat Sulawesi Barat.',
      base: '#7F1D2B',
      stripeA: '#E0B243',
      stripeB: '#166552',
      stripeC: '#1E3A6D',
      accent: '#181A1F',
    },
    maradia: {
      name: "Sure' Mara'dia (Nila, Zamrud & Emas)",
      note: "Paduan warna biru nila, hijau zamrud, dan garis emas teratur yang secara historis diasosiasikan dengan busana bangsawan atau tokoh adat (Mara'dia) di wilayah Mandar.",
      base: '#19355E',
      stripeA: '#E8BD4B',
      stripeB: '#1E7A5F',
      stripeC: '#8E2334',
      accent: '#F6E7B8',
    },
    salaka: {
      name: "Sure' Salaka (Eboni, Perak & Marun)",
      note: 'Kontras tegas hitam eboni dan garis perak-krem berpadu merah tua, menonjolkan ketegasan geometris khas tenun tradisional Polewali Mandar & Majene.',
      base: '#202226',
      stripeA: '#E4DFD3',
      stripeB: '#9B2232',
      stripeC: '#C89B3C',
      accent: '#3F6E5D',
    },
  };

  function renderSureParaSvg(variantKey = 'klasik') {
    const v = SURE_PARA_VARIANTS[variantKey] || SURE_PARA_VARIANTS.klasik;
    return `<svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Desain pola vektor ${v.name}">
      <rect width="360" height="220" fill="${v.base}"/>
      <!-- Horizontal warp bands -->
      <rect x="0" y="24" width="360" height="14" fill="${v.stripeC}" opacity="0.88"/>
      <rect x="0" y="46" width="360" height="6" fill="${v.stripeA}" opacity="0.95"/>
      <rect x="0" y="64" width="360" height="18" fill="${v.stripeB}" opacity="0.85"/>
      <rect x="0" y="96" width="360" height="8" fill="${v.accent}" opacity="0.72"/>
      <rect x="0" y="114" width="360" height="18" fill="${v.stripeB}" opacity="0.85"/>
      <rect x="0" y="146" width="360" height="6" fill="${v.stripeA}" opacity="0.95"/>
      <rect x="0" y="164" width="360" height="14" fill="${v.stripeC}" opacity="0.88"/>
      <!-- Vertical weft bands -->
      <rect x="28" y="0" width="14" height="220" fill="${v.stripeC}" opacity="0.76"/>
      <rect x="52" y="0" width="6" height="220" fill="${v.stripeA}" opacity="0.9"/>
      <rect x="74" y="0" width="20" height="220" fill="${v.stripeB}" opacity="0.74"/>
      <rect x="112" y="0" width="8" height="220" fill="${v.accent}" opacity="0.65"/>
      <rect x="136" y="0" width="6" height="220" fill="${v.stripeA}" opacity="0.9"/>
      <rect x="168" y="0" width="24" height="220" fill="${v.stripeC}" opacity="0.76"/>
      <rect x="208" y="0" width="6" height="220" fill="${v.stripeA}" opacity="0.9"/>
      <rect x="232" y="0" width="20" height="220" fill="${v.stripeB}" opacity="0.74"/>
      <rect x="270" y="0" width="8" height="220" fill="${v.accent}" opacity="0.65"/>
      <rect x="294" y="0" width="6" height="220" fill="${v.stripeA}" opacity="0.9"/>
      <rect x="318" y="0" width="14" height="220" fill="${v.stripeC}" opacity="0.76"/>
      <!-- Gold decorative Mandar geometric diamonds at intersections -->
      <g fill="none" stroke="${v.stripeA}" stroke-width="1.6" opacity="0.92">
        <polygon points="55,49 61,43 67,49 61,55"/>
        <polygon points="139,49 145,43 151,49 145,55"/>
        <polygon points="211,49 217,43 223,49 217,55"/>
        <polygon points="297,49 303,43 309,49 303,55"/>
        <polygon points="55,149 61,143 67,149 61,155"/>
        <polygon points="139,149 145,143 151,149 145,155"/>
        <polygon points="211,149 217,143 223,149 217,155"/>
        <polygon points="297,149 303,143 309,149 303,155"/>
      </g>
      <rect x="6" y="6" width="348" height="208" fill="none" stroke="${v.stripeA}" stroke-width="2" stroke-dasharray="6 3"/>
    </svg>`;
  }

  /**
   * Curated visual showcase cards mapped to verified 2025 Mandar dictionary entries.
   */
  const FEATURED_GALLERY = [
    { headword: 'lopi', label: 'lopi', indo: 'perahu', page: 259 },
    { headword: 'boyang', label: 'boyang', indo: 'rumah', page: 84 },
    { headword: 'lipaq', label: 'lipaq / saqbe', indo: 'sarung sutra', page: 252 },
    { headword: 'anjoro', label: 'anjoro', indo: 'kelapa', page: 21 },
    { headword: 'jepa', label: 'jepa', indo: 'penganan khas Mandar', page: 180 },
    { headword: 'bau', label: 'bau', indo: 'ikan', page: 61 },
    { headword: 'loka', label: 'loka', indo: 'pisang', page: 255 },
    { headword: 'manuq', label: 'manuq', indo: 'ayam', page: 275 },
    { headword: 'tedong', label: 'tedong', indo: 'kerbau', page: 455 },
    { headword: 'kopi', label: 'kopi', indo: 'kopi', page: 213 },
  ];

  global.KamusMedia = {
    createAudioController,
    isPicturableEntry,
    getEntryIllustration,
    SURE_PARA_VARIANTS,
    renderSureParaSvg,
    FEATURED_GALLERY,
  };
})(typeof window !== 'undefined' ? window : globalThis);
