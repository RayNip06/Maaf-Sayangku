/* =========================================================
   UTIL: pindah antar scene dengan fade
========================================================= */
function goToScene(id) {
  const current = document.querySelector('.scene--active');
  const next = document.getElementById(id);
  if (!next || current === next) return;

  if (current) {
    current.classList.add('scene--leaving');
    current.classList.remove('scene--active');
    setTimeout(() => current.classList.remove('scene--leaving'), 700);
  }

  // beri sedikit delay supaya transisi fade terasa berurutan, bukan instan
  setTimeout(() => {
    next.classList.add('scene--active');
  }, current ? 260 : 0);
}

/* =========================================================
   SCENE 1 -> 2 : buka amplop
========================================================= */
const envelopeBtn = document.getElementById('envelope');
const letterEl = document.getElementById('letter');
const letterBody = document.getElementById('letter-body');
const continueBtn = document.getElementById('btn-continue');

let envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;
  envelopeBtn.classList.add('is-open');

  // beri waktu animasi flap & amplop sebelum pindah scene
  setTimeout(() => {
    goToScene('scene-letter');

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });

      playLetterIntro();
    }, 700);

  }, 950);
}

// Event delegation di level document: menangkap klik di mana pun di dalam
// area amplop (termasuk span/svg dekoratif di dalamnya) tanpa bergantung
// pada hit-area satu elemen tunggal. Ini paling tahan terhadap perbedaan
// rendering antar-browser.
document.addEventListener('click', (e) => {
  if (e.target.closest('#envelope')) {
    openEnvelope();
  }
});

function playLetterIntro() {
  letterEl.classList.add('is-shown');

  const lines = letterBody.querySelectorAll('[data-line]');
  lines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('is-visible');
    }, 500 + i * 650);
  });

  const totalDelay = 500 + lines.length * 650 + 300;
  setTimeout(() => {
    continueBtn.classList.add('is-visible');
  }, totalDelay);
}

continueBtn.addEventListener('click', () => {
  goToScene('scene-question');
});

/* =========================================================
   SCENE 3 : pertanyaan maaf
========================================================= */
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const noCounter = document.getElementById('no-counter');
const questionTitle = document.getElementById('question-title');
const questionSub = document.getElementById('question-sub');

const noResponses = [
  'yah... coba sentuh tombol "Belum siap" itu lagi deh, lihat apa yang terjadi 👀',
  'tombolnya geser, hehe. boleh dicoba lagi?',
  'aku tunggu terus kok, nggak akan capek.',
  'baiklah, aku tetap di sini sampai kamu siap.',
];
let noClickCount = 0;

function getRandomPositionWithin(container, btn) {
  const cRect = container.getBoundingClientRect();
  const bRect = btn.getBoundingClientRect();
  const maxX = Math.max(cRect.width - bRect.width - 8, 8);
  const maxY = Math.max(cRect.height - bRect.height - 8, 8);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  return { x, y };
}

btnNo.addEventListener('click', () => {

  noClickCount++;

  noCounter.hidden = false;

  const responses = [
    'ehh kok belum siap 😔',
    'aku masih nungguin loh 🥺',
    'masa iya belum juga...',
    'aku janji bakal lebih baik',
    'sekali lagi coba pencet 😭',
    'aku tetap sayang kamu',
    'aku nggak pergi ke mana-mana kok',
    'aku tunggu terus deh',
    '🥹',
    '🥺'
  ];

  noCounter.textContent =
    responses[(noClickCount - 1) % responses.length];

  // kabur terus tanpa batas
  const btnWidth = btnNo.offsetWidth;
  const btnHeight = btnNo.offsetHeight;

  const margin = 30;

  const x =
    Math.random() *
    (window.innerWidth - btnWidth - margin * 2);

  const y =
    Math.random() *
    (window.innerHeight - btnHeight - margin * 2);

  btnNo.style.position = 'fixed';
  btnNo.style.left = `${x + margin}px`;
  btnNo.style.top = `${y + margin}px`;
  btnNo.style.zIndex = '9999';

  // tombol ya makin besar
  const scale = Math.min(1 + noClickCount * 0.05, 2.5);
  btnYes.style.transform = `scale(${scale})`;

  growHeart();

});

function growHeart() {
  const scale = Math.min(1 + noClickCount * 0.04, 1.3);
  questionTitle.style.transform = `scale(${scale})`;
}

btnYes.addEventListener('click', () => {
  goToScene('scene-final');
  launchHeartBurst();
});

/* =========================================================
   PARTIKEL: kelopak bunga jatuh + kunang-kunang lembut
========================================================= */
const canvas = document.getElementById('petal-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let burstParticles = [];
let width, height;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createPetal() {
  return {
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.3,
    size: 8 + Math.random() * 10,
    speedY: 0.4 + Math.random() * 0.6,
    speedX: (Math.random() - 0.5) * 0.5,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.01 + Math.random() * 0.015,
    opacity: 0.45 + Math.random() * 0.35,
    hue: Math.random() > 0.5 ? '#E8B4B8' : '#F2C9CD',
  };
}

const PETAL_COUNT = prefersReducedMotion ? 0 : 16;
for (let i = 0; i < PETAL_COUNT; i++) {
  const p = createPetal();
  p.y = Math.random() * height; // sebar di awal supaya tidak semua mulai dari atas
  particles.push(p);
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.hue;
  ctx.beginPath();
  // bentuk kelopak: oval lonjong sederhana
  ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function updatePetal(p) {
  p.sway += p.swaySpeed;
  p.x += p.speedX + Math.sin(p.sway) * 0.4;
  p.y += p.speedY;
  p.rotation += p.rotationSpeed;

  if (p.y > height + 20) {
    Object.assign(p, createPetal());
    p.y = -20;
  }
  if (p.x > width + 20) p.x = -20;
  if (p.x < -20) p.x = width + 20;
}

/* burst hati kecil saat "Ya, aku maafkan" ditekan */
function launchHeartBurst() {
  if (prefersReducedMotion) return;
  const cx = width / 2;
  const cy = height / 2;
  for (let i = 0; i < 26; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3.5;
    burstParticles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      size: 6 + Math.random() * 8,
      life: 1,
      decay: 0.012 + Math.random() * 0.012,
      hue: Math.random() > 0.5 ? '#C97B84' : '#E8B4B8',
    });
  }
}

function drawHeart(x, y, size, alpha, color) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(0, -2, -10, -2, -10, 5);
  ctx.bezierCurveTo(-10, 12, -4, 15, 0, 20);
  ctx.bezierCurveTo(4, 15, 10, 12, 10, 5);
  ctx.bezierCurveTo(10, -2, 0, -2, 0, 4);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p) => {
    updatePetal(p);
    drawPetal(p);
  });

  burstParticles.forEach((b) => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.05; // gravitasi ringan
    b.life -= b.decay;
    if (b.life > 0) {
      drawHeart(b.x, b.y, b.size * b.life, Math.max(b.life, 0), b.hue);
    }
  });
  burstParticles = burstParticles.filter((b) => b.life > 0);

  requestAnimationFrame(animate);
}
animate();