/* =========================
   Underseas Catch — Dual Audio Layer Edition
   ========================= */
(() => {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    menuToggle.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const FISH_DATA = window.FISH_DATA || [];
  
  // --- GLOBAL SETTINGS STATE ---
  const SETTINGS = {
    musicVol: 0.5, // Volume Lagu
    ambienceVol: 0.2, // Volume Laut (Dipisah)
    sfxVol: 0.8, // Volume Efek
    loopMode: 'playlist', // 'one' = satu lagu, 'playlist' = lanjut terus
    currentTrackIdx: 0, // Lagu yang sedang aktif
    showRays: true,
    showBubbles: true,
    showWaves: true,
    showTrails: false,
    showFish: true,
    enableBlur: false
  };
  // DOM Elements
  const playArea = document.getElementById("playArea");
  // Overlays & Modals
  
  // State
  let isCatching = false;
  const inventory = [];
  const fishesInWater = new Map(); // id -> actor

  // Helper
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* =========================================
     🔊 AUDIO MANAGER (Dual Layer + Volume Control)
     ========================================= */
const AudioMgr = {
    // LAYER 1: Ambience (Suara Laut)
    bgmAmbience: new Audio('assets/sounds/Underwater_Ambience.ogg'),
    
    // LAYER 2: Music Playlist
    // Pastikan nama file music2.mp3 dst sudah ada di folder
    playlist: [
      'assets/sounds/musics/music1.mp3',
      'assets/sounds/musics/music2.mp3',
      'assets/sounds/musics/music3.mp3',
      'assets/sounds/musics/music4.mp3'
    ],
    bgmMusic: new Audio(), // Kita kosongkan dulu src-nya
    sounds: {
      bubbles: [
        'assets/sounds/Bubbles1.ogg', 
        'assets/sounds/Bubbles2.ogg.mp3', 
        'assets/sounds/Bubbles3.ogg.mp3', 
        'assets/sounds/Bubbles4.ogg.mp3', 
        'assets/sounds/Bubbles5.ogg.mp3', 
        'assets/sounds/Bubbles6.ogg'
      ],
      splash: [
        'assets/sounds/bubble.ogg', 
        'assets/sounds/Water_splash1.ogg', 
        'assets/sounds/Water_splash2.ogg.mp3', 
        'assets/sounds/Water_Splash_Old.ogg'
      ],
      enterWater: [
        'assets/sounds/Entering_water1.ogg.mp3', 
        'assets/sounds/Entering_water2.ogg.mp3', 
        'assets/sounds/Entering_water3.ogg.mp3'
      ],
      exitWater: [
        'assets/sounds/Exiting_water1.ogg.mp3', 
        'assets/sounds/Exiting_water2.ogg.mp3', 
        'assets/sounds/Exiting_water3.ogg.mp3'
      ],
      dark: [
        'assets/sounds/Dark1.ogg', 
        'assets/sounds/Dark2.ogg', 
        'assets/sounds/Dark3.ogg', 
        'assets/sounds/Dark4.ogg'
      ],
      ui: [
        'assets/sounds/Water1.ogg', 
        'assets/sounds/Water2.ogg', 
        'assets/sounds/Driplets1.ogg', 
        'assets/sounds/Driplets2.ogg'
      ],
      magic: [
        'assets/sounds/Animal1.ogg', 
        'assets/sounds/Animal2.ogg'
      ],
      crackles: [
        'assets/sounds/Crackles1.ogg', 
        'assets/sounds/Crackles2.ogg'
      ],
      whale: [
        'assets/sounds/Bass_Whale1.ogg',
        'assets/sounds/Bass_Whale2.ogg'
      ]
    },

    sfx: {
      congrats: new Audio('assets/sounds/Random_levelup.ogg'), 
      earthCrack: new Audio('assets/sounds/Earth_Crack.ogg')   
    },

        init() {
  // 1. Setup Ambience
  this.bgmAmbience.loop = true;
  this.bgmAmbience.volume = SETTINGS.ambienceVol; // Pakai volume khusus
  this.bgmAmbience.preload = 'auto';
  
  // 2. Setup Music Awal
  this.bgmMusic.volume = SETTINGS.musicVol;
  this.loadTrack(SETTINGS.currentTrackIdx);
  
  // 3. Event Listener: Kalau lagu habis, ngapain?
  this.bgmMusic.addEventListener('ended', () => {
    if (SETTINGS.loopMode === 'one') {
      // Ulangi lagu yang sama
      this.bgmMusic.currentTime = 0;
      this.bgmMusic.play();
    } else {
      // Lanjut lagu berikutnya
      this.nextTrack();
    }
  });
},
loadTrack(index) {
    if (index >= this.playlist.length) index = 0; // Balik ke awal kalau habis
    SETTINGS.currentTrackIdx = index;
    
    this.bgmMusic.src = this.playlist[index];
    this.bgmMusic.load();
    
    // Update UI Dropdown (kalau setting lagi dibuka)
    const selector = document.getElementById("musicSelector");
    if (selector) selector.value = index;
  },
  
  nextTrack() {
    let nextIndex = SETTINGS.currentTrackIdx + 1;
    if (nextIndex >= this.playlist.length) nextIndex = 0;
    
    this.loadTrack(nextIndex);
    this.bgmMusic.play().catch(e => console.log("Auto-play next blocked"));
  },
    setMusicVolume(vol) {
    this.bgmMusic.volume = vol;
  },
  
  setAmbienceVolume(vol) {
    this.bgmAmbience.volume = vol;
  },

    playBGM() {
      // Cek apakah sudah main? Kalau belum, gas mainkan!
      if (this.bgmAmbience.paused) {
        const p1 = this.bgmAmbience.play();
        if (p1 !== undefined) {
            p1.catch(e => console.log("⏳ Ambience menunggu interaksi user..."));
        }
      }

      if (this.bgmMusic.paused) {
        const p2 = this.bgmMusic.play();
        if (p2 !== undefined) {
            p2.catch(e => console.log("⏳ Musik menunggu interaksi user..."));
        }
      }
    },


    playBGM() {
      // Mainkan segera!
      // Kita pakai Promise catch biar gak error kalau user belum interaksi
      const p1 = this.bgmAmbience.play();
      if (p1 !== undefined) {
        p1.catch(error => console.log("Menunggu interaksi user untuk Ambience..."));
      }
      
      const p2 = this.bgmMusic.play();
      if (p2 !== undefined) {
        p2.catch(error => console.log("Menunggu interaksi user untuk Musik..."));
      }
    },

    playRand(category, volume = 0.8) {
      const pool = this.sounds[category];
      if (!pool || pool.length === 0) return;
      
      const src = pool[Math.floor(Math.random() * pool.length)];
      const audio = new Audio(src);
      
      // UPDATE: Kalikan dengan Global SFX Volume
      audio.volume = volume * SETTINGS.sfxVol;
      
      audio.play().catch(e => console.warn("Audio play prevented:", src));
    },

    playSpecific(name) {
      if (this.sfx[name]) {
        this.sfx[name].currentTime = 0;
        // UPDATE: Gunakan Global SFX Volume
        this.sfx[name].volume = SETTINGS.sfxVol; 
        this.sfx[name].play().catch(e => {});
      }
    }
  };

  AudioMgr.init();

  // --- UBAH BAGIAN PALING BAWAH (Setelah AudioMgr.init() dipanggil) ---

  // 1. Langsung coba mainkan saat Script dimuat (tanpa nunggu apa-apa)
  // Ini usaha pertama kita menembus blokir browser
  AudioMgr.playBGM();

  // 2. Backup Plan: Kalau usaha pertama gagal (diblokir browser),
  // Kita pasang jebakan di 'click', 'scroll', 'touchstart', dan 'mousemove'
  // Begitu user gerak dikit aja, musik langsung nyala.
  function forceUnlock() {
    AudioMgr.playBGM();
    // Cek apakah musik beneran jalan? Kalau iya, hapus listener biar gak berat
    if (!AudioMgr.bgmMusic.paused) {
      ['click', 'touchstart', 'mousemove', 'scroll', 'keydown'].forEach(evt => 
        document.body.removeEventListener(evt, forceUnlock)
      );
    }
  }

  // Pasang jebakan di segala penjuru
  ['click', 'touchstart', 'mousemove', 'scroll', 'keydown'].forEach(evt => 
    document.body.addEventListener(evt, forceUnlock, { passive: true })
  );
  // --- UBAH BAGIAN PALING BAWAH (Setelah AudioMgr.init() dipanggil) ---

  // 1. Langsung coba mainkan saat Script dimuat (tanpa nunggu apa-apa)
  // Ini usaha pertama kita menembus blokir browser
  AudioMgr.playBGM();

  // 2. Backup Plan: Kalau usaha pertama gagal (diblokir browser),
  // Kita pasang jebakan di 'click', 'scroll', 'touchstart', dan 'mousemove'
  // Begitu user gerak dikit aja, musik langsung nyala.
  function forceUnlock() {
    AudioMgr.playBGM();
    // Cek apakah musik beneran jalan? Kalau iya, hapus listener biar gak berat
    if (!AudioMgr.bgmMusic.paused) {
      ['click', 'touchstart', 'mousemove', 'scroll', 'keydown'].forEach(evt => 
        document.body.removeEventListener(evt, forceUnlock)
      );
    }
  }

  // Pasang jebakan di segala penjuru
  ['click', 'touchstart', 'mousemove', 'scroll', 'keydown'].forEach(evt => 
    document.body.addEventListener(evt, forceUnlock, { passive: true })
  );


/* =========================================
   LOGIKA CUSTOM DROPDOWN (Baru)
   ========================================= */
const wrapper = document.querySelector('.custom-select-wrapper');
const trigger = document.querySelector('.custom-select-trigger');
const triggerText = document.getElementById('triggerText');
const options = document.querySelectorAll('.custom-option');
const hiddenInput = document.getElementById('musicSelector');

// 1. Toggle Buka/Tutup saat diklik
if (trigger) {
    trigger.addEventListener('click', (e) => {
        // Biar ga nembus klik ke bawahnya
        e.stopPropagation(); 
        wrapper.classList.toggle('open');
        AudioMgr.playRand('ui'); // Bunyi klik
    });
}

// 2. Saat Option dipilih
options.forEach(option => {
    option.addEventListener('click', function() {
        // Ambil data
        const val = this.getAttribute('data-value');
        const text = this.textContent;

        // Update Tampilan Tombol
        triggerText.textContent = text;
        
        // Update Input Tersembunyi (biar sistem lain tau)
        if(hiddenInput) hiddenInput.value = val;

        // Update Class Selected (Visual)
        options.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');

        // Tutup Dropdown
        wrapper.classList.remove('open');
        AudioMgr.playRand('ui');

        // --- PENTING: PANGGIL FUNGSI GANTI LAGU DI SINI ---
        // Panggil fungsi loadTrack dan playBGM dari AudioMgr
        const idx = parseInt(val);
        if(typeof AudioMgr !== 'undefined') {
             AudioMgr.loadTrack(idx);
             AudioMgr.playBGM();
        }
    });
});

// 3. Tutup dropdown kalau klik di luar area
document.addEventListener('click', (e) => {
    if (wrapper && !wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
    }
});


  /* ===== BUBBLES VISUAL SYSTEM ===== */
  const bubbleContainer = document.getElementById('bubbles');
  function spawnBubbleOne() {
    // Cek Setting
    if(!SETTINGS.showBubbles) return; 

    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 28 + 8;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}vw`;
    b.style.animationDuration = `${Math.random() * 6 + 6}s`;
    b.style.opacity = `${0.5 + Math.random() * 0.5}`;
    bubbleContainer.appendChild(b);
    
    if(Math.random() < 0.15) AudioMgr.playRand('bubbles', 0.2); 

    setTimeout(() => { if(b.parentNode) b.remove(); }, (parseFloat(b.style.animationDuration)+0.5)*1000);
  }

  function startBubbles() {
    for(let i=0; i<10; i++) setTimeout(spawnBubbleOne, i*200);
    setInterval(spawnBubbleOne, 420);
  }
  startBubbles();


  /* ===== SPAWN FISH ===== */
  /* ===== TRAIL EFFECT HELPER ===== */
  function spawnTrailParticle(x, y, size) {
    if (!SETTINGS.showBubbles) return; // Cek Setting
    const t = document.createElement("div");
    t.className = "fish-trail";
    const s = size * (0.1 + Math.random() * 0.2); 
    t.style.width = s + "px";
    t.style.height = s + "px";
    t.style.left = x + "px";
    t.style.top = y + "px";
    document.body.appendChild(t);
    setTimeout(() => { if(t.parentNode) t.remove(); }, 800);
  }

  function spawnNaturalWake(x, y, velocityX) {
    const s = document.createElement("div");
    s.className = "fish-stream";
    const length = 15 + Math.random() * 20;
    s.style.width = `${length}px`;
    s.style.left = x + "px";
    s.style.top = y + "px";

    if (velocityX > 0) {
       s.style.transformOrigin = "center right"; 
       s.style.left = (x - length) + "px"; 
    } else {
       s.style.transformOrigin = "center left";
    }

    document.body.appendChild(s);
    setTimeout(() => { if(s.parentNode) s.remove(); }, 800);
  }

  function spawnSparkle(x, y, color) {
    const s = document.createElement("div");
    s.className = "fish-sparkle";
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    s.style.left = (x + offsetX) + "px";
    s.style.top = (y + offsetY) + "px";
    const c = color || "#fff"; 
    s.style.backgroundColor = c;
    s.style.boxShadow = `0 0 5px ${c}, 0 0 10px ${c}`;
    document.body.appendChild(s);
    setTimeout(() => { if(s.parentNode) s.remove(); }, 600);
  }

  /* ===== BACKGROUND CURRENTS MANAGER ===== */
  const currentsLayer = document.getElementById('currentsLayer');
  
  function spawnCurrentLine() {
    if (!currentsLayer || !SETTINGS.showWaves) return; // Cek Setting
    const c = document.createElement('div');
    c.className = 'current-line';
    const width = 100 + Math.random() * 300; 
    c.style.width = `${width}px`;
    c.style.top = `${Math.random() * 100}vh`; 
    c.style.left = `-${width}px`; 
    const duration = 10 + Math.random() * 15; 
    c.style.animationDuration = `${duration}s`;
    currentsLayer.appendChild(c);
    setTimeout(() => { if(c.parentNode) c.remove(); }, duration * 1000);
  }
  setInterval(spawnCurrentLine, 2000);
  for(let i=0; i<5; i++) setTimeout(spawnCurrentLine, i * 500);


  /* ===== SPAWN FISH (Main Logic) ===== */
  function spawnFishActor(fishObj) {
    if(inventory.find(i => i.fishData.id === fishObj.id)) return;
  
    const actor = document.createElement("div");
    actor.className = "fish-actor";
    actor.dataset.id = fishObj.id;

    const size = rand(30, 60); 
    actor.style.fontSize = size + "px";
    
    if(fishObj.skin.endsWith(".png")){
      const img = document.createElement("img");
      img.src = fishObj.skin;
      img.alt = fishObj.fishName;
      img.style.width = size + "px";
      img.style.height = "auto";
      actor.appendChild(img);
    } else {
      actor.innerText = fishObj.skin || "🐟";
    }

    // Posisi
    const startSide = Math.random() < 0.5 ? "left" : "right";
    let posX = startSide === "left" ? -200 : window.innerWidth + 200;
    const headerOffset = 140; 
    const bottomOffset = 100;
    const availableHeight = window.innerHeight - headerOffset - bottomOffset;
    const basePosY = headerOffset + Math.random() * availableHeight;
    let posY = basePosY;
    
    const speed = 0.5 + Math.random() * 0.8; 
    let velocityX = startSide === "left" ? speed : -speed;

    let time = Math.random() * 100; 
    const waveAmp = 20 + Math.random() * 40; 
    const waveFreq = 0.005 + Math.random() * 0.015;

    actor.style.left = "0px"; 
    actor.style.top = "0px";
    let facing = velocityX > 0 ? "scaleX(-1)" : "scaleX(1)";
    actor.style.transform = `translate(${posX}px, ${posY}px) ${facing}`;

    // SFX spawn
    if (fishObj.type === 'Legendary' || fishObj.type === 'Epic') {
      if(Math.random() < 0.6) AudioMgr.playRand('dark', 0.5); 
    }

    playArea.appendChild(actor);
    fishesInWater.set(fishObj.id, actor);

    // --- ANIMATION LOOP ---
    let isActive = true;
    let trailTimer = 0;

    function swim() {
      if (!isActive || !fishesInWater.has(fishObj.id)) return;

      if (posX > 100 && posX < window.innerWidth - 100) {
        if (Math.random() < 0.005) velocityX *= -1; 
      }

      facing = velocityX > 0 ? "scaleX(-1)" : "scaleX(1)";
      posX += velocityX;
      time += 1;
      posY = basePosY + Math.sin(time * waveFreq) * waveAmp;

      actor.style.transform = `translate(${posX}px, ${posY}px) ${facing}`;

      // 1. Trail Logic (Bubble)
      trailTimer++;
      if (trailTimer > 12) { 
        if(SETTINGS.showTrails) { // Cek Setting
            const trailX = velocityX > 0 ? posX : posX + size;
            const trailY = posY + (size / 2); 
            spawnTrailParticle(trailX, trailY, size);
        }
        trailTimer = 0;
      }

      // 2. Trail Logic (Sparkle)
      if (SETTINGS.showTrails && Math.random() < 0.2) { // Cek Setting
        const tailX = velocityX > 0 ? posX : posX + size;
        const tailY = posY + (size / 2);
        spawnSparkle(tailX, tailY, fishObj.color);
      }

      // 3. Trail Logic (Natural Wake)
      if (SETTINGS.showTrails && Math.random() < 0.08) { // Cek Setting
         const tailX = velocityX > 0 ? posX : posX + size;
         const tailY = posY + (size / 2) + ((Math.random() - 0.5) * 8);
         spawnNaturalWake(tailX, tailY, velocityX);
      }

      // Cek Keluar Layar
      const isOutLeft = posX < -250;
      const isOutRight = posX > window.innerWidth + 250;

      if (isOutLeft || isOutRight) {
        isActive = false;
        actor.remove();
        fishesInWater.delete(fishObj.id);
      } else {
        requestAnimationFrame(swim);
      }
    }

    requestAnimationFrame(swim);

    actor.addEventListener("click", () => { isActive = false; handleCatch(fishObj, actor); });
    actor.addEventListener("touchstart", (e) => { 
        e.preventDefault(); 
        isActive = false; 
        handleCatch(fishObj, actor); 
    }, {passive:false});
  }

  const MAX_FISH_ON_SCREEN = 6; 
  function startFishSpawner() {
    setInterval(() => {
      if (!SETTINGS.showFish) return; 
      if (fishesInWater.size >= MAX_FISH_ON_SCREEN) return;
      const availableFish = FISH_DATA.filter(f => 
        !inventory.find(i => i.fishData.id === f.id) && 
        !fishesInWater.has(f.id)
      );

      if (availableFish.length > 0) {
        const randomFish = availableFish[Math.floor(Math.random() * availableFish.length)];
        spawnFishActor(randomFish);
      }
    }, 1500);
  }
  startFishSpawner();


  /* ===== HANDLE CATCH SYSTEM ===== */
  let currentCaught = null;

  function spawnBubbleEffect(x, y) {
    if(!SETTINGS.showBubbles) return; // Cek Setting
    const bubbleCount = 8; 
    for (let i = 0; i < bubbleCount; i++) {
      const b = document.createElement("div");
      b.className = "bubble-particle";
      const size = 10 + Math.random() * 15; 
      b.style.width = size + "px";
      b.style.height = size + "px";
      const offsetX = (Math.random() - 0.5) * 50; 
      const offsetY = (Math.random() - 0.5) * 50;
      b.style.left = (x + offsetX) + "px";
      b.style.top = (y + offsetY) + "px";
      b.style.animationDuration = (0.5 + Math.random() * 0.5) + "s";
      document.body.appendChild(b);
      setTimeout(() => { b.remove(); }, 800);
    }
  }

  function handleCatch(fishObj, actorEl){
    if(!fishObj || isCatching) return;
    isCatching = true;
    currentCaught = fishObj;
    
    const rect = actorEl.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    AudioMgr.playRand('splash', 0.8);
    AudioMgr.playRand('bubbles', 0.6);

    spawnBubbleEffect(centerX, centerY);

    actorEl.style.opacity="0";
    actorEl.style.pointerEvents="none";
  }
  
  /* ===== SETTINGS MANAGER ===== */
  const settingBtn = document.getElementById("settingBtn");
const settingOverlay = document.getElementById("settingOverlay");
const closeSetting = document.getElementById("closeSetting");
const saveSettingBtn = document.getElementById("saveSettingBtn");
  const checkFish = document.getElementById("showFish"); // Baru
const checkBlur = document.getElementById("enableBlur"); // Baru
  // Inputs
  const volMusicInput = document.getElementById("volMusic");
  const volAmbienceInput = document.getElementById("volAmbience"); // Baru
  const volSfxInput = document.getElementById("volSfx");
  const musicSelector = document.getElementById("musicSelector"); // Baru
  const toggleLoopBtn = document.getElementById("toggleLoopBtn"); // Baru
  const checkRays = document.getElementById("showRays");
  const checkBubbles = document.getElementById("showBubbles");
  const checkWaves = document.getElementById("showWaves");
  const checkTrails = document.getElementById("showTrails");

  // Elements to toggle
  const elRays = document.querySelector('.light-rays'); 
  const elBubbles = document.getElementById('bubbles');
  const elWaves = document.getElementById('currentsLayer');

  // 1. Open/Close Modal
  function openSettings() {
     settingOverlay.setAttribute("aria-hidden", "false");
     AudioMgr.playRand('ui');
  }
  function closeSettings() {
     settingOverlay.setAttribute("aria-hidden", "true");
     AudioMgr.playRand('ui');
  }

  if(settingBtn) settingBtn.addEventListener("click", openSettings);
  if(closeSetting) closeSetting.addEventListener("click", closeSettings);
  if(saveSettingBtn) saveSettingBtn.addEventListener("click", closeSettings);
  // 1. LOGIC SHOW FISH
  if (checkFish) {
    checkFish.addEventListener("change", (e) => {
      SETTINGS.showFish = e.target.checked;
      
      // Sembunyikan/Munculkan ikan yang SUDAH ada di layar
      const existingFish = document.querySelectorAll('.fish-actor');
      existingFish.forEach(fish => {
        fish.style.display = SETTINGS.showFish ? 'flex' : 'none';
      });
    });
  }
  
  // 2. LOGIC ENABLE BLUR
  if (checkBlur) {
    checkBlur.addEventListener("change", (e) => {
      SETTINGS.enableBlur = e.target.checked;
      
      if (SETTINGS.enableBlur) {
        // Nyalakan Blur (Hapus class no-blur)
        document.body.classList.remove('no-blur');
      } else {
        // Matikan Blur (Tambah class no-blur)
        document.body.classList.add('no-blur');
      }
    });
  }
  // 2. Audio Handlers
  if (volMusicInput) {
  volMusicInput.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SETTINGS.musicVol = val;
    AudioMgr.setMusicVolume(val);
  });
}

if (volAmbienceInput) {
  volAmbienceInput.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SETTINGS.ambienceVol = val;
    AudioMgr.setAmbienceVolume(val);
  });
}

if (volSfxInput) {
  volSfxInput.addEventListener("input", (e) => {
    SETTINGS.sfxVol = parseFloat(e.target.value);
  });
}

// 2. Music Player Handlers
if (musicSelector) {
  musicSelector.addEventListener("change", (e) => {
    const idx = parseInt(e.target.value);
    // Ganti lagu dan langsung mainkan
    AudioMgr.loadTrack(idx);
    AudioMgr.playBGM();
  });
}

if (toggleLoopBtn) {
  // Set text awal
  updateLoopBtnText();
  
  toggleLoopBtn.addEventListener("click", () => {
    // Toggle logic
    SETTINGS.loopMode = SETTINGS.loopMode === 'playlist' ? 'one' : 'playlist';
    updateLoopBtnText();
    AudioMgr.playRand('ui');
  });
  
  function updateLoopBtnText() {
    if (SETTINGS.loopMode === 'playlist') {
      toggleLoopBtn.textContent = "🔄 Lanjut Playlist";
      toggleLoopBtn.style.background = "rgba(255,255,255,0.2)";
    } else {
      toggleLoopBtn.textContent = "🔂 Ulang 1 Lagu";
      toggleLoopBtn.style.background = "#4a90e2"; // Highlight biru kalau loop 1
    }
  }
}

  // 3. Graphic Handlers
  if(checkRays) checkRays.addEventListener("change", (e) => {
     SETTINGS.showRays = e.target.checked;
     if(elRays) elRays.style.display = SETTINGS.showRays ? "block" : "none";
  });

  if(checkBubbles) checkBubbles.addEventListener("change", (e) => {
     SETTINGS.showBubbles = e.target.checked;
     if(elBubbles) elBubbles.style.display = SETTINGS.showBubbles ? "block" : "none";
  });

  if(checkWaves) checkWaves.addEventListener("change", (e) => {
     SETTINGS.showWaves = e.target.checked;
     if(elWaves) elWaves.style.display = SETTINGS.showWaves ? "block" : "none";
  });

  if(checkTrails) checkTrails.addEventListener("change", (e) => {
     SETTINGS.showTrails = e.target.checked;
  });

  // Handle Escape Key
  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape"){
      if(letterOverlay.getAttribute("aria-hidden")==="false") closeLetterModal();
      if(caughtOverlay.getAttribute("aria-hidden")==="false") closeCaughtModal();
      if(settingOverlay && settingOverlay.getAttribute("aria-hidden")==="false") closeSettings();
    }
  });
    // --- 5. CUSTOM VIDEO PLAYER LOGIC ---
  const videoContainers = document.querySelectorAll('.custom-video');

  videoContainers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const overlay = wrapper.querySelector('.play-overlay');

    if (!video || !overlay) return;

    // Fungsi Play
    overlay.addEventListener('click', () => {
      // 1. Munculkan controls bawaan browser (biar bisa pause/volume)
      video.setAttribute('controls', 'true'); 
      
      // 2. Play video
      video.play();
      
      // 3. Sembunyikan tombol custom kita
      wrapper.classList.add('is-playing');
    });

    // Opsional: Kalau video selesai atau dipause user, munculkan tombol lagi?
    // Biasanya lebih aesthetic kalau play sekali, controls native tetap ada.
    // Tapi kalau mau tombol muncul lagi pas pause, uncomment baris bawah ini:
    /*
    video.addEventListener('pause', () => {
      video.removeAttribute('controls');
      wrapper.classList.remove('is-playing');
    });
    */
  });
    /* =========================================
     LOGIKA PEMBUKA (OPENER)
     ========================================= */
  const openerOverlay = document.getElementById('openerOverlay');

  function startExperience() {
    // 1. Mainkan Musik
    AudioMgr.playBGM();
    
    // 2. Efek UI (Bunyi 'ting' atau air)
    AudioMgr.playRand('ui', 0.8); 
    
    // 3. Hilangkan Overlay
    if(openerOverlay) {
      openerOverlay.classList.add('hidden');
      
      // Hapus elemen setelah animasi selesai biar performa ringan
      setTimeout(() => {
        openerOverlay.remove();
      }, 1000);
    }
  }

  if(openerOverlay) {
    // Klik atau Sentuh akan membuka
    openerOverlay.addEventListener('click', startExperience);
    openerOverlay.addEventListener('touchstart', (e) => {
        startExperience();
    }, {passive: true});
  }


});
  // --- 4. SLIDER LOGIC (Strict One-by-One for Desktop) ---
  const scrollContainer = document.getElementById('memoryScroll');
  const cards = document.querySelectorAll('.memory-card');
  
  // Variabel buat nahan biar gak spam scroll
  let isLocked = false; 

  if(scrollContainer) {
    scrollContainer.addEventListener("wheel", (evt) => {
      // 1. Matikan scroll bawaan browser
      evt.preventDefault(); 
      
      // 2. Kalau lagi proses geser, tolak perintah baru (Cooldown)
      if (isLocked) return;

      // 3. Tentukan arah: > 0 itu ke Bawah/Kanan, < 0 itu ke Atas/Kiri
      const direction = evt.deltaY > 0 ? 1 : -1;
      
      // 4. Hitung lebar kartu + gap (perkiraan lebar per item)
      // Ambil kartu pertama sebagai patokan ukuran
      const cardWidth = cards[0].offsetWidth + 40; // 40 itu gap antar kartu (sesuaikan dgn CSS)

      // 5. Hitung posisi sekarang ada di kartu nomor berapa
      const currentScroll = scrollContainer.scrollLeft;
      const currentIndex = Math.round(currentScroll / cardWidth);

      // 6. Tentukan target kartu berikutnya
      let targetIndex = currentIndex + direction;

      // Jaga biar gak minus atau lebih dari jumlah kartu
      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= cards.length) targetIndex = cards.length - 1;

      // 7. Geser ke target!
      // Kalau targetnya sama dengan sekarang (misal udah mentok), gak usah lock
      if (targetIndex === currentIndex) return;

      isLocked = true; // Kunci dulu

      scrollContainer.scrollTo({
        left: targetIndex * cardWidth,
        behavior: 'smooth'
      });
      
      // Panggil checkActive manual biar highlight-nya pas
      checkActive();

      // 8. Buka kunci setelah animasi selesai (estimasi 600ms)
      setTimeout(() => {
        isLocked = false;
      }, 600);

    }, { passive: false });
  }


    function checkActive() {
    const center = scrollContainer.scrollLeft + (scrollContainer.offsetWidth / 2);
    
    cards.forEach(card => {
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const isCenter = Math.abs(center - cardCenter) < card.offsetWidth / 2;
      
      // Ambil elemen video & wrapper di dalam kartu ini (kalau ada)
      const video = card.querySelector('video');
      const videoWrapper = card.querySelector('.custom-video');

      if (isCenter) {
        // KARTU SEDANG DILIHAT (TENGAH)
        card.classList.add('active');
        // Kita tidak auto-play, menunggu user klik sendiri biar sopan.
        
      } else {
        // KARTU SUDAH DIGESER (TIDAK DILIHAT)
        card.classList.remove('active');
        
        // --- LOGIC BARU: AUTO PAUSE ---
        // Jika ada video dan video sedang jalan, kita matikan.
        if (video && !video.paused) {
          video.pause(); // 1. Stop videonya
          
          // 2. Sembunyikan controls bawaan browser
          video.removeAttribute('controls'); 
          
          // 3. Munculkan lagi tombol Play Aesthetic (Glass Button)
          if(videoWrapper) {
            videoWrapper.classList.remove('is-playing');
          }
        }
      }
    });
  }


  // Tambahkan event listener scroll biasa juga (untuk Touchscreen/Trackpad)
  if(scrollContainer) {
    scrollContainer.addEventListener('scroll', checkActive);
  }
  /* =========================================
     SECURITY: ANTI COPY-PASTE & RIGHT CLICK
     ========================================= */
  // 1. Matikan Klik Kanan (Context Menu)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 2. Matikan Shortcut Keyboard (Ctrl+C, Ctrl+U, Ctrl+S, F12)
  document.addEventListener('keydown', (e) => {
    // Cek jika Ctrl (atau Command di Mac) ditekan
    if (e.ctrlKey || e.metaKey) {
      // Blokir C (Copy), U (View Source), S (Save), P (Print)
      if (['c', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        // Opsional: Kasih peringatan lucu
        // alert("Eits, mau ngapain? 🤭"); 
      }
    }
    
    // Opsional: Blokir F12 (Inspect Element)
    if (e.key === 'F12') {
      e.preventDefault();
    }
  });
