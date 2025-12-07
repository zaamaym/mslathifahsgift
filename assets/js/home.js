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
  
  // 🎉 CONFETTI + SOUND
  function triggerConfetti() {
    const partySounds = [
      'assets/sounds/party_popper1.ogg',
      'assets/sounds/party_popper2.ogg',
      'assets/sounds/party_popper3.ogg'
    ];
    const pick = partySounds[Math.floor(Math.random() * partySounds.length)];
    try {
      const s1 = new Audio(pick);
      const s2 = new Audio(pick);
      s1.volume = s2.volume = 1;
      setTimeout(() => s1.play().catch(() => {}), 500);
      setTimeout(() => s2.play().catch(() => {}), 1500);
    } catch (e) {}

     const duration = 3000;
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
    }, 5000);

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 40 * (timeLeft / duration);

      // kiri
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));

      // kanan
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

      setTimeout(() => confettiContainer.remove(), 5000);
    }
  
  // jika dari prank
  if (localStorage.getItem('fromPrank')) {
    localStorage.removeItem('fromPrank');
    try {
      const mainSound = new Audio('assets/sounds/objective_success.ogg');
      mainSound.volume = 0.8;
      mainSound.play().catch(() => {});
    } catch (e) {}
    setTimeout(() => triggerConfetti(), 1000);
  }
  
  // ---------------- BUBBLES ----------------
  const bubbleContainer = document.getElementById('bubbles');
  
  function spawnBubble() {
    const b = document.createElement("div");
    b.classList.add("bubble");
    const size = 10 + Math.random() * 20;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = Math.random() * 100 + "vw";
    b.style.animationDuration = (4 + Math.random() * 4) + "s";
    bubbleContainer.appendChild(b);
    setTimeout(() => b.remove(), 9000);
  }
  setInterval(spawnBubble, 400);
  
  // ---------------- BUTTON FIX ----------------
  const startBtn = document.getElementById("startBtn");
  const partyBtn = document.getElementById("partyBtn");
  partyBtn.addEventListener("click", () => {
    setTimeout(() => triggerConfetti(), 1000);
  });
  startBtn.addEventListener("click", () => {
    setTimeout(() => {
      window.location.href = "game.html";
    }, 1200);
  });
  
}); // END DOMContentLoaded
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
