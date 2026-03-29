// ===== 音声 =====
const normalSound    = new Audio('assets/sounds/normal.m4a');
const sensitiveSound = new Audio('assets/sounds/sensitive.m4a');
normalSound.preload    = 'auto';
sensitiveSound.preload = 'auto';

// cloneNode で再生 → 連打や同時再生の競合を防ぐ
// ※ iOSはクリック操作が user gesture になるので unlock不要
function playSound(isSensitive) {
  const original = isSensitive ? sensitiveSound : normalSound;
  const s = original.cloneNode();
  s.play().catch(() => {});
}

// ===== 状態 =====
const BUTTON_COUNT = 10;
let sensitiveIndex = null;

// ===== DOM 参照 =====
const screenPhoto      = document.getElementById('screen-photo');
const screenGame       = document.getElementById('screen-game');
const fileInput        = document.getElementById('file-input');
const preview          = document.getElementById('preview');
const startBtn         = document.getElementById('start-btn');
const facePhoto        = document.getElementById('face-photo');
const resultBanner     = document.getElementById('result-banner');
const resetBtn         = document.getElementById('reset-btn');
const backBtn          = document.getElementById('back-btn');
const magnifyBtns      = document.querySelectorAll('.magnify-btn');
const sensitiveOverlay = document.getElementById('sensitive-overlay');

// ===== Screen 1: 顔写真登録 =====
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    preview.src = dataUrl;
    preview.style.display = 'block';
    sessionStorage.setItem('facePhoto', dataUrl);
    startBtn.disabled = false;
  };
  reader.readAsDataURL(file);
});

startBtn.addEventListener('click', startGame);

// ===== Screen 2: ゲーム =====
function startGame() {
  sensitiveIndex = Math.floor(Math.random() * BUTTON_COUNT);
  facePhoto.src = sessionStorage.getItem('facePhoto');
  magnifyBtns.forEach(btn => btn.classList.remove('pressed'));
  sensitiveOverlay.classList.add('hidden');
  screenPhoto.hidden = true;
  screenGame.hidden  = false;
  hideBanner();
}

magnifyBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.index, 10);
    btn.classList.add('pressed');
    handlePress(index);
  });
});

function handlePress(index) {
  const isSensitive = (index === sensitiveIndex);
  playSound(isSensitive);
  if (isSensitive) {
    showSensitiveOverlay();
  } else {
    showBanner(false);
  }
}

// ===== バナー =====
function showBanner(isSensitive) {
  resultBanner.textContent = isSensitive ? '💗 敏感ーーー！！！ 💗' : 'むむ... 違う';
  resultBanner.className   = isSensitive ? 'sensitive' : 'normal';
  clearTimeout(resultBanner._timer);
  resultBanner._timer = setTimeout(hideBanner, 2000);
}

function hideBanner() {
  resultBanner.className = 'hidden';
}

// ===== 敏感ヒット演出 =====
const HEARTS = ['💗', '💖', '💕', '✨', '🌸', '💓', '💝'];

function showSensitiveOverlay() {
  showBanner(true);

  sensitiveOverlay.innerHTML = '<div class="big-text">💗 敏感ーーー！！！ 💗<br>やっちゃった〜！！</div>';
  sensitiveOverlay.classList.remove('hidden');

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const heart = document.createElement('span');
      heart.className = 'heart-float';
      heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      heart.style.left   = Math.random() * 90 + 5 + '%';
      heart.style.bottom = Math.random() * 40 + '%';
      heart.style.animationDelay = Math.random() * 0.5 + 's';
      sensitiveOverlay.appendChild(heart);
      setTimeout(() => heart.remove(), 3000);
    }, i * 80);
  }

  if (navigator.vibrate) navigator.vibrate([150, 80, 150, 80, 400]);

  clearTimeout(sensitiveOverlay._timer);
  sensitiveOverlay._timer = setTimeout(() => {
    sensitiveOverlay.classList.add('hidden');
  }, 4000);
}

// ===== もう一度: ゲームのみリセット =====
resetBtn.addEventListener('click', () => {
  sensitiveIndex = Math.floor(Math.random() * BUTTON_COUNT);
  magnifyBtns.forEach(btn => btn.classList.remove('pressed'));
  sensitiveOverlay.classList.add('hidden');
  hideBanner();
});

// ===== 写真を変える: Screen 1 に戻る =====
backBtn.addEventListener('click', () => {
  sensitiveIndex = null;
  sensitiveOverlay.classList.add('hidden');
  screenGame.hidden  = true;
  screenPhoto.hidden = false;
  fileInput.value    = '';
  preview.src        = '';
  preview.style.display = 'none';
  startBtn.disabled  = true;
  sessionStorage.removeItem('facePhoto');
});
