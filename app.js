// ===== 音声 =====
const normalSound    = new Audio('assets/sounds/normal.mp3');
const sensitiveSound = new Audio('assets/sounds/sensitive.mp3');
normalSound.preload    = 'auto';
sensitiveSound.preload = 'auto';

function playSound(isSensitive) {
  const s = isSensitive ? sensitiveSound : normalSound;
  s.currentTime = 0; // 連打対応: 先頭から再生
  s.play().catch(() => {}); // ブラウザのAutoplay制限を無視
}

// ===== 状態 =====
const BUTTON_COUNT = 9;
let sensitiveIndex = null;

// ===== DOM 参照 =====
const screenPhoto  = document.getElementById('screen-photo');
const screenGame   = document.getElementById('screen-game');
const fileInput    = document.getElementById('file-input');
const preview      = document.getElementById('preview');
const startBtn     = document.getElementById('start-btn');
const facePhoto    = document.getElementById('face-photo');
const resultBanner = document.getElementById('result-banner');
const resetBtn     = document.getElementById('reset-btn');
const magnifyBtns  = document.querySelectorAll('.magnify-btn');

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
  // 毎回ランダムで敏感ボタンを1つ決定
  sensitiveIndex = Math.floor(Math.random() * BUTTON_COUNT);

  // 顔写真をセット
  facePhoto.src = sessionStorage.getItem('facePhoto');

  // ボタンをすべてリセット
  magnifyBtns.forEach(btn => btn.classList.remove('pressed'));

  // 画面切り替え
  screenPhoto.hidden = true;
  screenGame.hidden  = false;
  hideBanner();
}

magnifyBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const index = parseInt(btn.dataset.index, 10);
    btn.classList.add('pressed'); // 押したボタンをグレーアウト
    handlePress(index);
  });
});

function handlePress(index) {
  const isSensitive = (index === sensitiveIndex);
  playSound(isSensitive);
  showBanner(isSensitive);
}

function showBanner(isSensitive) {
  resultBanner.textContent = isSensitive ? '🎉 敏感ーーー！！！' : 'むむ... 違う';
  resultBanner.className   = isSensitive ? 'sensitive' : 'normal';

  clearTimeout(resultBanner._timer);
  resultBanner._timer = setTimeout(hideBanner, 2000);
}

function hideBanner() {
  resultBanner.className = 'hidden';
}

// ===== リセット =====
resetBtn.addEventListener('click', () => {
  sensitiveIndex = null;
  screenGame.hidden  = true;
  screenPhoto.hidden = false;
  fileInput.value    = '';
  preview.src        = '';
  preview.style.display = 'none';
  startBtn.disabled  = true;
  sessionStorage.removeItem('facePhoto');
});
