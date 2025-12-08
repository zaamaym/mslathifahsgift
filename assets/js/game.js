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
    musicVol: 0.3,
    ambienceVol: 0.5, // Tambahkan ini (default volume laut)
    sfxVol: 0.8,
    showRays: true,
    showBubbles: true,
    showWaves: true,
    showTrails: false,
    showBloom: false // <--- DEFAULT OFF
  };

  // DOM Elements
    // ... elemen overlay lainnya ...
  const bottleOverlay = document.getElementById("bottleOverlay");
  const closeBottleBtn = document.getElementById("closeBottleBtn");
  
  // Flag supaya botol cuma muncul sekali per sesi permainan
  let hasSpawnedBottle = false;

  if(closeBottleBtn) {
      closeBottleBtn.addEventListener("click", () => {
          bottleOverlay.setAttribute("aria-hidden", "true");
          AudioMgr.playRand('ui');
      });
  }

  const playArea = document.getElementById("playArea");
  const bagBtn = document.getElementById("bagBtn");
  const bagCount = document.getElementById("bagCount");
  const inventoryPanel = document.getElementById("inventoryPanel");
  const invGrid = document.getElementById("invGrid");
  const releaseAllBtn = document.getElementById("releaseAllBtn");
  const closeInv = document.getElementById("closeInv");
  // TAMBAHAN: Sembunyikan tooltip saat inventory di-scroll
  invGrid.addEventListener("scroll", () => {
      if(gameTooltip) gameTooltip.classList.remove("visible");
  }, { passive: true });

  // Overlays & Modals
  const caughtOverlay = document.getElementById("caughtOverlay");
  const letterOverlay = document.getElementById("letterOverlay");
  const caughtType = document.getElementById("caughtType");
  const caughtSkin = document.getElementById("caughtSkin");
  const caughtName = document.getElementById("caughtName");
  const takeBtn = document.getElementById("takeBtn");
  const readBtn = document.getElementById("readBtn");
  const closeCaught = document.getElementById("closeCaught");

  const letterSkin = document.getElementById("letterSkin");
  const letterType = document.getElementById("letterType");
  const letterFishName = document.getElementById("letterFishName");
  const letterStudent = document.getElementById("letterStudent");
  const letterMsg = document.getElementById("letterMsg");
  const releaseBtn = document.getElementById("releaseBtn");
  const closeLetter = document.getElementById("closeLetter");
  const closeLetterX = document.getElementById("closeLetterX");
  
  const gameTooltip = document.getElementById("gameTooltip");

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
    
    // LAYER 2: Music (Lagu Background)
    bgmMusic: new Audio('assets/sounds/backgroundmusic.mp3'),

    // Kumpulan Suara (Pools)
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
   // Setup Ambience (Gunakan ambienceVol)
   this.bgmAmbience.loop = true;
   this.bgmAmbience.volume = SETTINGS.ambienceVol;
   
   // Setup Music (Gunakan musicVol)
   this.bgmMusic.loop = true;
   this.bgmMusic.volume = SETTINGS.musicVol;
   },
   
   setMusicVolume(vol) {
       // Hanya ubah volume Lagu
       this.bgmMusic.volume = vol;
     },
     
     // TAMBAHKAN FUNGSI INI
     setAmbienceVolume(vol) {
       // Hanya ubah volume Laut
       this.bgmAmbience.volume = vol;
     },

    playBGM() {
      this.bgmAmbience.play().catch(() => console.log("Waiting for interaction (Ambience)..."));
      this.bgmMusic.play().catch(() => console.log("Waiting for interaction (Music)..."));
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

  function unlockAudio() {
    AudioMgr.playBGM();
    document.body.removeEventListener('click', unlockAudio);
    document.body.removeEventListener('touchstart', unlockAudio);
    AudioMgr.playRand('ui', 0.5); 
  }
  document.body.addEventListener('click', unlockAudio);
  document.body.addEventListener('touchstart', unlockAudio);


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
function triggerConfetti() {
  const partySounds = [
    'assets/sounds/party_popper1.ogg',
    'assets/sounds/party_popper2.ogg',
    'assets/sounds/party_popper3.ogg'
  ];
  const pick = partySounds[Math.floor(Math.random() * partySounds.length)];
  try {
    const s1 = new Audio(pick);
    s1.volume = 1;
    setTimeout(() => s1.play().catch(() => {}), 500);
  } catch (e) {}
  
  const duration = 1000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 25,
    spread: 360,
    ticks: 80,
    zIndex: 1000,
    colors: ['#FF7A7A', '#FFD93D', '#AEE2FF', '#B8F1B0', '#CDB4FF']
  };
  
  const confettiCount = 80;
  const colors = ['#FF7A7A', '#FFD93D', '#AEE2FF', '#B8F1B0', '#CDB4FF'];
  const confettiContainer = document.createElement('div');
  confettiContainer.classList.add('confetti-container');
  document.body.appendChild(confettiContainer);
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.width = Math.random() * 8 + 4 + 'px';
    confetti.style.height = confetti.style.width;
    confettiContainer.appendChild(confetti);
  }
  
  // 🧹 Hapus confetti setelah 5 detik
  setTimeout(() => {
    confettiContainer.remove();
  }, 3000);
  
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    
    const particleCount = 40 * (timeLeft / duration);

  }, 250);
  
  setTimeout(() => confettiContainer.remove(), 5000);
}

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
    // 2. Fungsi Utama: Spawn Ikan
  function spawnFishActor(fishObj) {
    // CEK 1: Jangan spawn jika sudah ada di inventory (Gunakan '==' biar 1 sama dengan "1")
    if(inventory.some(i => i.fishData.id == fishObj.id)) return;

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

    // SFX spawn (Hanya untuk ikan langka)
    if (fishObj.type === 'Legendary' || fishObj.type === 'Epic') {
      if(Math.random() < 0.6) AudioMgr.playRand('dark', 0.5); 
    }

    playArea.appendChild(actor);
    fishesInWater.set(fishObj.id, actor);

    // --- ANIMATION LOOP ---
    let isActive = true;
    let trailTimer = 0;

    function swim() {
      // CEK 2: Jika tiba-tiba ikan ini masuk inventory (misal baru ketangkap), langsung hapus
      if (inventory.some(i => i.fishData.id == fishObj.id)) {
          isActive = false;
          actor.remove();
          fishesInWater.delete(fishObj.id);
          return;
      }

      if (!isActive || !fishesInWater.has(fishObj.id)) return;

      if (posX > 100 && posX < window.innerWidth - 100) {
        if (Math.random() < 0.005) {
            velocityX *= -1; // Balik arah
            spawnTurnBubbles(posX, posY + (size / 2)); // Efek Bubble
            if(Math.random() < 0.3) AudioMgr.playRand('bubbles', 0.3);
        } 
      }

      facing = velocityX > 0 ? "scaleX(-1)" : "scaleX(1)";
      posX += velocityX;
      time += 1;
      posY = basePosY + Math.sin(time * waveFreq) * waveAmp;

      actor.style.transform = `translate(${posX}px, ${posY}px) ${facing}`;

      // Trail Logic
      trailTimer++;
      if (trailTimer > 12) { 
        if(SETTINGS.showBubbles) {
            const trailX = velocityX > 0 ? posX : posX + size;
            const trailY = posY + (size / 2); 
            spawnTrailParticle(trailX, trailY, size);
        }
        trailTimer = 0;
      }
      if (SETTINGS.showTrails && Math.random() < 0.2) {
        const tailX = velocityX > 0 ? posX : posX + size;
        const tailY = posY + (size / 2);
        spawnSparkle(tailX, tailY, fishObj.color);
      }
      if (SETTINGS.showWaves && Math.random() < 0.08) {
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

    // 3. Manager: Pengatur Spawn Otomatis
  const MAX_FISH_ON_SCREEN = 6;
  let spawnerInterval = null;
  
  function startFishSpawner() {
    if (spawnerInterval) return; // Cegah double interval
    
    spawnerInterval = setInterval(() => {
      // STOP TOTAL jika tas sudah penuh (sesuai jumlah data ikan)
      if (inventory.length >= FISH_DATA.length) return;
      
      // STOP jika layar penuh
      if (fishesInWater.size >= MAX_FISH_ON_SCREEN) return;
      
      // FILTER KETAT: Hanya ikan yang BELUM ada di tas DAN BELUM ada di air
      // Kita pakai '==' agar aman (misal id:1 vs id:"1")
      const availableFish = FISH_DATA.filter(f =>
        !inventory.some(i => i.fishData.id == f.id) &&
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
  /* Tambahkan ini di area helper function, misalnya di bawah spawnBubbleEffect */
  // 1. Helper: Bubble saat putar balik
function spawnTurnBubbles(x, y) {
  if (!SETTINGS.showBubbles) return;
  
  const count = 3;
  for (let i = 0; i < count; i++) {
    const b = document.createElement("div");
    b.className = "bubble-particle";
    const size = 5 + Math.random() * 8;
    b.style.width = size + "px";
    b.style.height = size + "px";
    
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    b.style.left = (x + offsetX) + "px";
    b.style.top = (y + offsetY) + "px";
    b.style.animationDuration = (0.4 + Math.random() * 0.4) + "s";
    
    document.body.appendChild(b);
    setTimeout(() => { b.remove(); }, 800);
  }
}

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
    inventoryPanel.setAttribute("aria-hidden", "true");
    
    const rect = actorEl.getBoundingClientRect();
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    AudioMgr.playRand('splash', 0.8);
    AudioMgr.playRand('bubbles', 0.6);
setTimeout(() => triggerConfetti(), 300);
    spawnBubbleEffect(centerX, centerY);

    actorEl.style.opacity="0";
    actorEl.style.pointerEvents="none";

    const ghost = document.createElement("div");
    ghost.className="fish-fly";
    if(fishObj.skin.endsWith(".png")){
      const img = document.createElement("img");
      img.src = fishObj.skin;
      img.style.width = rect.width + "px";
      img.style.height = "auto";
      ghost.appendChild(img);
    } else {
      ghost.innerText = fishObj.skin || "🐟";
    }
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top + "px";
    document.body.appendChild(ghost);

    const targetX = window.innerWidth/2 - rect.width/2;
    const targetY = window.innerHeight/2 - rect.height/2;
    
    requestAnimationFrame(()=>{
      ghost.style.left = targetX+"px";
      ghost.style.top = targetY+"px";
      ghost.style.transform="scale(2)";
    });

    setTimeout(()=>{
      ghost.remove();
      isCatching=false;
      
      AudioMgr.playRand('exitWater', 0.8); 
      AudioMgr.playSpecific('congrats'); 

      if(fishObj.type === 'Legendary') {
         AudioMgr.playSpecific('earthCrack'); 
      } else if (fishObj.type === 'Epic' || fishObj.type === 'Rare') {
         AudioMgr.playRand('crackles', 0.7); 
      } else {
         AudioMgr.playRand('magic', 0.5); 
      }

      caughtOverlay.setAttribute("aria-hidden","false");
      caughtType.innerText = fishObj.type;
      
      let typeColor = "#fff";
      if(fishObj.type==="Legendary") typeColor="#FFD700";
      else if(fishObj.type==="Epic") typeColor="#FF69B4";
      else if(fishObj.type==="Rare") typeColor="#1E90FF";
      else if(fishObj.type==="Uncommon") typeColor="#32CD32";
      else typeColor="#AAAAAA";
      
      caughtType.style.color = typeColor;

      if(fishObj.skin.endsWith(".png")){
        caughtSkin.innerHTML = `
          <div class="fish-caught-wrap">
            <img src="assets/img/rays.png" class="fish-rays" />
            <img class="fish-img" src="${fishObj.skin}" alt="${fishObj.fishName}" 
                style="width:100px; max-width:80vw; height:auto;" />
          </div>
        `;
      } else {
        caughtSkin.innerHTML = `
          <div class="fish-caught-wrap">
            <img src="assets/img/rays.png" class="fish-rays" />
            <span class="fish-emoji">${fishObj.skin}</span>
          </div>
        `;
      }

      caughtName.innerText = fishObj.fishName;
      caughtName.style.color = fishObj.color;
      
      takeBtn.onclick=()=>{ 
        AudioMgr.playRand('ui'); 
        addToInventory(fishObj); 
        closeCaughtModal(); 
      };
      readBtn.onclick=()=>{ 
        AudioMgr.playRand('ui'); 
        addToInventory(fishObj); 
        openLetterModal(fishObj); 
        closeCaughtModal(false); 
      };
      closeCaught.onclick=()=>{ 
        AudioMgr.playRand('ui'); 
        addToInventory(fishObj); 
        closeCaughtModal(); 
      };

      const el = fishesInWater.get(fishObj.id);
      if(el){ el.remove(); fishesInWater.delete(fishObj.id); }

      maybeShowReleaseAll();
    }, 600);
  }

  function closeCaughtModal(h=true){
    caughtOverlay.setAttribute("aria-hidden","true");
    currentCaught=null;
    updateBagCount();
  }


  /* ===== INVENTORY SYSTEM ===== */
  function addToInventory(fishObj){
    if(inventory.find(i=>i.fishData.id===fishObj.id)) return;
    inventory.push({fishData:fishObj, caughtAt:Date.now()});
    updateBagCount();
    renderInventoryGrid();
    maybeShowReleaseAll();
  }

  /* ===== INVENTORY RENDER (With Fish Name) ===== */
  function renderInventoryGrid(){
    invGrid.innerHTML="";
    const slots = 26; 
    
    for(let i = 0; i < slots; i++){
      const slot = document.createElement("div");
      slot.className = "inv-slot";
      
      if(i >= inventory.length){
        slot.classList.add("empty");
      } else {
        const it = inventory[i];
        
        if(it.fishData.skin.endsWith(".png")){
          const img = document.createElement("img");
          img.src = it.fishData.skin;
          img.alt = it.fishData.fishName;
          img.style.width = "32px"; 
          img.style.height = "auto";
          slot.appendChild(img);
        } else {
          const emojiSpan = document.createElement("span");
          emojiSpan.style.fontSize = "24px";
          emojiSpan.innerText = it.fishData.skin || "🐟";
          slot.appendChild(emojiSpan);
        }

        const showTooltip = (e) => {
            const rect = slot.getBoundingClientRect();
            gameTooltip.innerText = it.fishData.fishName;
            gameTooltip.style.color = it.fishData.color || "#fff";
            let topPos = rect.top - 40; 
            let leftPos = rect.left + (rect.width / 2) - (gameTooltip.offsetWidth / 2);
            if(e.type.includes('touch')) topPos = rect.top - 50; 

            gameTooltip.style.top = `${topPos}px`;
            gameTooltip.style.left = `${leftPos}px`;
            gameTooltip.classList.add("visible");
        };

        const hideTooltip = () => { gameTooltip.classList.remove("visible"); };

        slot.addEventListener("mouseenter", showTooltip);
        slot.addEventListener("mouseleave", hideTooltip);

        let pressTimer;
        let isLongPress = false;

        slot.addEventListener("touchstart", (e) => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                showTooltip(e); 
                if(navigator.vibrate) navigator.vibrate(30); 
                AudioMgr.playRand('ui'); 
            }, 500);
        }, { passive: true });

        slot.addEventListener("touchend", (e) => {
            clearTimeout(pressTimer);
            hideTooltip(); 
            if (isLongPress && e.cancelable) e.preventDefault(); 
        });

        slot.addEventListener("touchmove", () => {
            clearTimeout(pressTimer);
            isLongPress = false;
            hideTooltip();
        });

        // Cari bagian slot.addEventListener("click"...) di baris 114
slot.addEventListener("click", (e) => {
    if (isLongPress) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }
    
    // TAMBAHAN: Paksa tooltip hilang sebelum buka letter
    gameTooltip.classList.remove("visible"); 

    AudioMgr.playRand('ui'); 
    openLetterModal(it.fishData);
});


      }
      invGrid.appendChild(slot);
    }
    updateBagCount();
  }


  /* ===== LETTER MODAL ===== */
  let activeLetterFishId=null;
  function openLetterModal(fishObj){
    activeLetterFishId=fishObj.id;
    AudioMgr.playRand('magic');
    
    let typeColor = "#fff";
    if(fishObj.type==="Legendary") typeColor="#FFD700";
    else if(fishObj.type==="Epic") typeColor="#FF69B4";
    else if(fishObj.type==="Rare") typeColor="#1E90FF";
    else if(fishObj.type==="Uncommon") typeColor="#32CD32";
    else typeColor="#AAAAAA";
    letterType.style.color = typeColor;

    letterSkin.innerText = fishObj.skin.endsWith(".png") ? "" : fishObj.skin;
    letterType.innerText=fishObj.type;
    letterFishName.innerText=fishObj.fishName;
    letterFishName.style.color = fishObj.color;
    
    letterStudent.innerHTML = `Dari: <span style="color: ${fishObj.color}; font-weight: bold;">${fishObj.student}</span>`;
    letterStudent.style.color = ''; 

    let formatted = fishObj.msg.replace(/\n/g, "<br>");
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<i>$1</i>");
    letterMsg.innerHTML = formatted;

    if(fishObj.skin.endsWith(".png")){
      letterSkin.innerHTML = `<img src="${fishObj.skin}" alt="${fishObj.fishName}" style="width:40px; height:auto;">`;
    }

    letterOverlay.setAttribute("aria-hidden","false");
    
    releaseBtn.onclick=()=>{ 
        releaseFish(fishObj.id); 
        closeLetterModal(); 
    };
    closeLetter.onclick=()=>{
        AudioMgr.playRand('ui');
        closeLetterModal();
    };
    closeLetterX.onclick=()=>{
        AudioMgr.playRand('ui');
        closeLetterModal();
    };
  }

  function closeLetterModal(){
    letterOverlay.setAttribute("aria-hidden","true");
    activeLetterFishId=null;
    renderInventoryGrid();
    maybeShowReleaseAll();
  }


  /* ===== RELEASE SYSTEM ===== */
  function releaseFish(id){
    const idx=inventory.findIndex(i=>i.fishData.id===id);
    AudioMgr.playRand('enterWater');
    if(idx>-1) inventory.splice(idx,1);
    const fishObj=FISH_DATA.find(f=>f.id===id);
    if(fishObj) setTimeout(()=>spawnFishActor(fishObj),rand(1000, 3000));
    updateBagCount();
    renderInventoryGrid();
  }

  function releaseAll(){
    AudioMgr.playRand('whale');
    while(inventory.length){
      const it=inventory.pop();
      const fishObj=FISH_DATA.find(f=>f.id===it.fishData.id);
      if(fishObj) setTimeout(()=>spawnFishActor(fishObj),rand(500, 2500));
    }
    updateBagCount();
    renderInventoryGrid();
    maybeShowReleaseAll();
  }
  releaseAllBtn.addEventListener("click", releaseAll);


  /* ===== UI TOGGLES (Inventory) ===== */
  bagBtn.addEventListener("click",()=>{
    AudioMgr.playRand('ui');
    gameTooltip.classList.remove("visible"); 
    const hidden=inventoryPanel.getAttribute("aria-hidden")==="true";
    inventoryPanel.setAttribute("aria-hidden", hidden?"false":"true");
    if(hidden) renderInventoryGrid();
  });
  
  closeInv.addEventListener("click",()=>{
      AudioMgr.playRand('ui');
      gameTooltip.classList.remove("visible");
      inventoryPanel.setAttribute("aria-hidden","true");
  });
  
  function updateBagCount(){ bagCount.innerText=inventory.length; }
  function spawnFinalBottle() {
    if(hasSpawnedBottle) return; // Cegah muncul berkali-kali
    hasSpawnedBottle = true;

    AudioMgr.playRand('magic'); // Bunyi 'ting' ajaib

    const bottle = document.createElement("div");
    bottle.className = "bottle-actor";
    bottle.innerHTML = "🍾"; // Emoji Botol
    
    // Posisi Spawn (Dari kiri layar)
    const startY = 150 + Math.random() * (window.innerHeight - 300);
    bottle.style.left = "-100px";
    bottle.style.top = startY + "px";
    
    // Transisi gerak (Jalan pelan dari kiri ke kanan)
    // Kita set manual lewat JS biar bisa dideteksi kliknya
    document.getElementById("playArea").appendChild(bottle);

    // Animasi Gerak menggunakan Web Animations API (lebih smooth di JS)
    const anim = bottle.animate([
      { left: '-100px' },
      { left: (window.innerWidth + 100) + 'px' }
    ], {
      duration: 15000, // 15 detik jalan pelan
      easing: 'linear',
      fill: 'forwards'
    });

    // Event Klik Botol
    bottle.onclick = () => {
        AudioMgr.playRand('ui');
        anim.pause(); // Stop gerakannya
        bottle.remove(); // Hapus botolnya
        
        // Buka Modal
        bottleOverlay.setAttribute("aria-hidden", "false");
    };

    // Hapus elemen kalau sudah lewat layar (selesai animasi)
    anim.onfinish = () => {
       if(bottle.parentNode) bottle.remove();
       // Reset flag kalau kelewat, biar nanti muncul lagi kalau user release ikan & tangkap lagi
       hasSpawnedBottle = false; 
    };
  }

    function maybeShowReleaseAll(){
    // Hitung sisa ikan di air
    const countInWater = FISH_DATA.filter(f=>!inventory.find(i=>i.fishData.id===f.id)).length;
    
    releaseAllBtn.hidden = countInWater > 0;
    
    if(countInWater === 0) {
        inventoryPanel.setAttribute("aria-hidden","false");
        
        // --- LOGIKA BARU DI SINI ---
        // Jika semua ikan sudah ditangkap (inventory penuh sesuai data)
        if(inventory.length >= FISH_DATA.length) {
            // Tunggu 2 detik setelah ikan terakhir ditangkap, baru muncul botol
            setTimeout(spawnFinalBottle, 2000);
        }
    }
  }

  /* ===== TUTORIAL MANAGER ===== */
  const tutorialBtn = document.getElementById("tutorialBtn");
  const tutorialOverlay = document.getElementById("tutorialOverlay");
  const closeTutorial = document.getElementById("closeTutorial");
  const closeTutorialMain = document.getElementById("closeTutorialBtn");

  function openTutorial() {
      tutorialOverlay.setAttribute("aria-hidden", "false");
      AudioMgr.playRand('ui');
  }

  function closeTutorialModal() {
      tutorialOverlay.setAttribute("aria-hidden", "true");
      AudioMgr.playRand('ui');
      // Tandai bahwa user sudah pernah lihat tutorial
      localStorage.setItem("hasSeenTutorial", "true"); 
  }

  if (tutorialBtn) tutorialBtn.addEventListener("click", openTutorial);
  if (closeTutorial) closeTutorial.addEventListener("click", closeTutorialModal);
  if (closeTutorialMain) closeTutorialMain.addEventListener("click", closeTutorialModal);

  // --- AUTO SHOW (Hanya untuk pemain baru) ---
  // Cek apakah user sudah pernah lihat tutorial sebelumnya
  setTimeout(() => {
    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (!hasSeen) {
        openTutorial(); // Muncul otomatis kalau belum pernah lihat
    }
  }, 1000); // Delay 1 detik setelah loading biar smooth

  /* ===== SETTINGS MANAGER ===== */
  const settingBtn = document.getElementById("settingBtn");
  const settingOverlay = document.getElementById("settingOverlay");
  const closeSetting = document.getElementById("closeSetting");
  const saveSettingBtn = document.getElementById("saveSettingBtn");
  
  // Inputs
  const volMusicInput = document.getElementById("volMusic");
  const volAmbienceInput = document.getElementById("volAmbience"); // Ambil elemen baru
  const volSfxInput = document.getElementById("volSfx");
  const checkRays = document.getElementById("showRays");
  const checkBubbles = document.getElementById("showBubbles");
  const checkWaves = document.getElementById("showWaves");
  const checkTrails = document.getElementById("showTrails");
  const checkBloom = document.getElementById("showBloom"); // Ambil elemen checkbox

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
if (checkBloom) {
  // 1. Set posisi awal sesuai default (False/Unchecked)
  checkBloom.checked = SETTINGS.showBloom;
  
  // 2. Event Listener saat diklik
  checkBloom.addEventListener("change", (e) => {
    SETTINGS.showBloom = e.target.checked;
    toggleBloomEffect(SETTINGS.showBloom);
    AudioMgr.playRand('ui');
  });
}

// FUNGSI HELPER UNTUK APPLY CLASS KE BODY
function toggleBloomEffect(isActive) {
  if (isActive) {
    document.body.classList.add("enable-bloom");
  } else {
    document.body.classList.remove("enable-bloom");
  }
}

// Panggil sekali saat load untuk memastikan state benar
toggleBloomEffect(SETTINGS.showBloom);
  if(settingBtn) settingBtn.addEventListener("click", openSettings);
  if(closeSetting) closeSetting.addEventListener("click", closeSettings);
  if(saveSettingBtn) saveSettingBtn.addEventListener("click", closeSettings);

  // 2. Audio Handlers
  if(volMusicInput) volMusicInput.addEventListener("input", (e) => {
     const val = parseFloat(e.target.value);
     SETTINGS.musicVol = val;
     AudioMgr.setMusicVolume(val);
  });
 // 2. Ambience Handler (BARU)
 if (volAmbienceInput) volAmbienceInput.addEventListener("input", (e) => {
   const val = parseFloat(e.target.value);
   SETTINGS.ambienceVol = val;
   AudioMgr.setAmbienceVolume(val);
 });
  if(volSfxInput) volSfxInput.addEventListener("input", (e) => {
     SETTINGS.sfxVol = parseFloat(e.target.value);
  });

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
