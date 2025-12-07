
document.addEventListener("DOMContentLoaded", () => {
  /* ====== BUBBLE GENERATOR (light & efficient) ====== */
  const bubbleContainer = document.getElementById('bubbles');
  
  function spawnBubbleOne() {
    const b = document.createElement('div');
    b.className = 'bubble';
    
    // random size and horizontal position
    const size = Math.random() * 28 + 8; // 8 - 36px
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}vw`;
    
    // random rise duration and slight horizontal drift via animation-duration and transform
    const dur = Math.random() * 6 + 6; // 6 - 12s
    b.style.animationDuration = `${dur}s`;
    b.style.opacity = `${0.5 + Math.random() * 0.5}`;
    
    bubbleContainer.appendChild(b);
    
    // cleanup after animation finishes (slightly longer)
    setTimeout(() => {
      if (b && b.parentNode) b.parentNode.removeChild(b);
    }, (dur + 0.5) * 1000);
  }
  
  // spawn at varied intervals to feel natural
  const bubbleTimers = [];
  
  function startBubbles() {
    // initial burst
    for (let i = 0; i < 10; i++) {
      setTimeout(spawnBubbleOne, i * 200);
    }
    // steady spawn
    bubbleTimers.push(setInterval(spawnBubbleOne, 420));
  }
  startBubbles();
  
  
  /* ====== NO BUTTON "ESCAPE" LOGIC (desktop & mobile friendly) ====== */
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const buttonsWrap = document.querySelector('.buttons');
  const panel = document.querySelector('.panel');
  
  // ensure buttonsWrap has size for calculation
  /* ====== LOGIKA TOMBOL "TIDAK" KABUR (FULL LAYAR) ====== */
/* ====== LOGIKA TOMBOL "TIDAK" (VERSI ANTI KELUAR) ====== */
/* ====== PERSIAPAN DATA (MEME + SOUND PASANGAN) ====== */
// Kita pakai Array of Objects biar meme dan sound-nya jodoh (gak ketukar)
/* ====== PERSIAPAN DATA (MEME + SOUND PASANGAN) ====== */
const prankCollection = [
  { 
    img: 'meme1.jpg', 
    sound: 'assets/sounds/meme1.mp3' 
  },
  { 
    img: 'meme2.jpg', 
    sound: 'assets/sounds/meme2.mp3' 
  },
  { 
    img: 'meme3.jpg', 
    sound: 'assets/sounds/meme3.mp3' 
  }
];

// --- VARIABEL SATPAM SUARA ---
// Variabel ini ditaruh di LUAR fungsi biar datanya tersimpan terus
let activeAudio = null;

/* ====== FUNGSI EFEK MEME & SUARA (ANTI-NUMPUK) ====== */
function showMemeEffect() {
  const layer = document.getElementById('memeLayer');
  const imgElement = document.getElementById('memeImage');
  
  // 1. CEK: Apakah ada suara yang lagi main?
  if (activeAudio) {
    activeAudio.pause();       // Stop paksa suara lama
    activeAudio.currentTime = 0; // Reset ke detik 0
  }

  // 2. Pilih Paket Random
  const randomItem = prankCollection[Math.floor(Math.random() * prankCollection.length)];

  // 3. Set Gambar
  imgElement.src = `assets/img/${randomItem.img}`;

  // 4. Mainkan Suara Baru & Simpan di variabel "Satpam"
  activeAudio = new Audio(randomItem.sound);
  activeAudio.volume = 0.8; 
  activeAudio.play().catch(e => console.log("Gagal memutar audio:", e));

  // 5. Reset Animasi Visual
  layer.classList.remove('meme-animate');
  void layer.offsetWidth; 
  layer.classList.add('meme-animate');
}



/* ====== UPDATE LOGIKA TOMBOL KABUR ====== */
function moveNoButtonRandomly() {
  
  // --- > TRIGGER EFEK BARU DI SINI < ---
  showMemeEffect(); 
  // -------------------------------------

  // ... (Sisa kode "Pindah Alam" yang tadi, jangan diubah) ...
  if (noBtn.parentNode !== document.body) {
    document.body.appendChild(noBtn);
  }
  noBtn.style.position = 'fixed'; 
  noBtn.style.margin = '0';
  noBtn.style.zIndex = '99999'; 

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;
  const maxX = screenW - btnW - 10;
  const maxY = screenH - btnH - 10;

  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  noBtn.style.left = `${Math.max(10, randomX)}px`;
  noBtn.style.top = `${Math.max(10, randomY)}px`;
}



  
  // Desktop hover
  noBtn.addEventListener('mouseover', moveNoButtonRandomly);
  // Desktop click so it still moves if someone taps/clicks fast
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButtonRandomly();
  });
  // Mobile touch
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButtonRandomly();
  }, { passive: false });
  
  // Accessibility fallback: if user really wants to click "Tidak", after many tries show a tiny toast
  let escapeTries = 0;
  noBtn.addEventListener('focus', () => {
    escapeTries++;
    if (escapeTries > 10) {
      // allow for a short time then move again
      setTimeout(() => moveNoButtonRandomly(), 800);
    }
  });
  
  
  /* ====== YES BUTTON behavior ====== */
  /* ====== YES BUTTON behavior (LOVE FLOW + BUBBLE SOUNDS) ====== */

// 1. Daftar file suara (Pastikan nama file di folder assets/sounds SAMA PERSIS)
const bubbleSounds = [
  'assets/sounds/bubbles1.ogg',
  'assets/sounds/Bubbles2.ogg.mp3',
  'assets/sounds/Bubbles3.ogg.mp3',
  'assets/sounds/Bubbles4.ogg.mp3',
  'assets/sounds/Bubbles5.ogg.mp3'
];

// Helper: Mainkan suara random
function playRandomBubble() {
  const randomIndex = Math.floor(Math.random() * bubbleSounds.length);
  const audio = new Audio(bubbleSounds[randomIndex]);
  audio.volume = 0.6; // Volume 60% biar tidak terlalu berisik
  audio.play().catch(e => console.log("Audio error:", e)); 
}

// Fungsi untuk membuat ledakan hati visual + audio
function createLoveExplosion(sourceElement) {
  const rect = sourceElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Kita buat 25 hati
  for (let i = 0; i < 25; i++) {
    
    // --- AUDIO EFFECT (Delay bertahap) ---
    // Kita kasih delay i * 30ms.
    // Jadi suaranya berurutan cepat: pop..pop..pop..pop
    setTimeout(() => {
      // Mainkan suara (hanya untuk 15 hati pertama biar gak terlalu chaos)
      if (i < 15) playRandomBubble();
    }, i * 30); 


    // --- VISUAL EFFECT (Hati Terbang) ---
    const heart = document.createElement('div');
    heart.innerHTML = ['❤️', '💖', '💗', '😍', '💕'][Math.floor(Math.random() * 5)];
    heart.className = 'heart-flow';
    
    heart.style.left = `${centerX}px`;
    heart.style.top = `${centerY}px`;

    const randomX = (Math.random() - 0.5) * 160; 
    const randomY = -100 - (Math.random() * 200); 
    const randomRot = (Math.random() - 0.5) * 60;

    heart.style.setProperty('--tx', `${randomX}px`);
    heart.style.setProperty('--ty', `${randomY}px`);
    heart.style.setProperty('--rot', `${randomRot}deg`);
    
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }
}

// Event Listener Tombol Yes
yesBtn.addEventListener('click', () => {
  localStorage.setItem('fromPrank', '1');
  
  // 1. Trigger Ledakan
  createLoveExplosion(yesBtn);
  
  // 2. Animasi Panel
  panel.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(0.95)' }
  ], { duration: 200 });
  
  // 3. Redirect (Tunggu suara & animasi selesai dikit)
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 1500); 
});

  
  
  /* ====== SAFETY: prevent unexpected horizontal scroll on certain devices ====== */
  // ensure no element ever creates horizontal overflow
  function forceNoOverflow() {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
  }
  forceNoOverflow();
  window.addEventListener('resize', forceNoOverflow);
});
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
