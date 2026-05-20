/**
 * renderer.js — Canvas 2D 渲染主循环 + 动画控制器 + 交互
 * 替代原先的 scene.js + animation-controller.js + interaction.js
 */
import { AlbedoSprite } from './sprite-albedo.js';

// --- Canvas Setup ---
const container = document.getElementById('pet-container');
const canvas = document.getElementById('pet-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = container.clientWidth * window.devicePixelRatio;
  canvas.height = container.clientHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
resize();
window.addEventListener('resize', resize);

// --- Sprite ---
const sprite = new AlbedoSprite();

// --- Animation State ---
const State = { IDLE: 'idle', SHY: 'shy', SURPRISED: 'surprised', DRAGGING: 'dragging' };
let state = State.IDLE;
let stateTimer = 0;
let idleTime = 0;
let blinkTimer = 0;
let blinkInterval = 2 + Math.random() * 3;
let isBlinking = false;

// --- Audio (simple Web Audio beeps) ---
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
}
function playTone(freq, dur, type='sine') {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

// --- Speech ---
function showSpeech(text, duration = 2000) {
  sprite.speechText = text;
  sprite.speechTimer = duration / 1000;
  const bubble = document.getElementById('speech-bubble');
  const span = document.getElementById('speech-text');
  if (bubble && span) {
    span.textContent = text;
    bubble.classList.remove('hidden');
    clearTimeout(window._speechTimeout);
    window._speechTimeout = setTimeout(() => bubble.classList.add('hidden'), duration);
  }
}

// --- Interaction ---
let mouseX = 0, mouseY = 0;
let isMouseOver = false;
let hitZone = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let lastClickTime = 0;

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (isDragging) {
    const dx = e.screenX - dragStart.x;
    const dy = e.screenY - dragStart.y;
    dragStart = { x: e.screenX, y: e.screenY };
    window.electronAPI?.moveWindow(dx, dy);
    state = State.DRAGGING;
    stateTimer = 0;
    fireInteract();
    return;
  }

  hitZone = sprite.hitTest(mouseX, mouseY, container.clientWidth, container.clientHeight);

  if (hitZone) {
    isMouseOver = true;
    if (hitZone === 'head') {
      container.style.cursor = 'pointer';
    } else {
      container.style.cursor = 'grab';
    }
    window.electronAPI?.setIgnoreMouseEvents(false);
    // Eyes follow cursor
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2 + 30;
    sprite.eyeFollowX = (mouseX - cx) * 0.01;
    sprite.eyeFollowY = (mouseY - (cy - 62)) * 0.01;
  } else {
    isMouseOver = false;
    hitZone = null;
    container.style.cursor = 'default';
    window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
    sprite.eyeFollowX *= 0.9;
    sprite.eyeFollowY *= 0.9;
  }
});

canvas.addEventListener('mousedown', (e) => {
  initAudio();
  dragStart = { x: e.screenX, y: e.screenY };
  isDragging = false;
});

canvas.addEventListener('mouseup', (e) => {
  const dx = Math.abs(e.screenX - dragStart.x);
  const dy = Math.abs(e.screenY - dragStart.y);

  if (isDragging) {
    isDragging = false;
    container.style.cursor = hitZone === 'head' ? 'pointer' : hitZone ? 'grab' : 'default';
    transitionTo(State.IDLE);
    return;
  }

  if (dx < 3 && dy < 3 && hitZone) {
    handleClick(hitZone);
  }
});

canvas.addEventListener('mouseleave', () => {
  if (isDragging) { isDragging = false; transitionTo(State.IDLE); }
  isMouseOver = false;
  hitZone = null;
  window.electronAPI?.setIgnoreMouseEvents(true, { forward: true });
});

// Detect drag threshold
canvas.addEventListener('mousemove', (e) => {
  if (!isDragging && dragStart.x && hitZone) {
    const dx = Math.abs(e.screenX - dragStart.x);
    const dy = Math.abs(e.screenY - dragStart.y);
    if (dx > 3 || dy > 3) {
      isDragging = true;
      container.style.cursor = 'grabbing';
    }
  }
});

function handleClick(zone) {
  fireInteract();
  idleTime = 0;

  if (zone === 'head') {
    transitionTo(State.SHY);
    showSpeech('安兹大人……❤️');
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 100);
    setTimeout(() => playTone(784, 0.3), 200);
  } else if (zone === 'body' || zone === 'skirt') {
    transitionTo(State.SURPRISED);
    const lines = ['はい、何でしょうか？', 'ご主人様？', 'あら……', '何か御用ですか？'];
    showSpeech(lines[Math.floor(Math.random() * lines.length)]);
    playTone(440, 0.1);
    setTimeout(() => playTone(554, 0.15), 80);
  }

  // Double click
  const now = Date.now();
  if (now - lastClickTime < 400) {
    const loveLines = ['安兹大人、愛しています！', 'ずっとお側に……', '私のすべてはあなたのものです ❤️'];
    showSpeech(loveLines[Math.floor(Math.random() * loveLines.length)], 3000);
    playTone(523, 0.2);
    setTimeout(() => playTone(659, 0.2), 150);
    setTimeout(() => playTone(784, 0.3), 300);
  }
  lastClickTime = now;
}

// --- Interaction callback ---
let interactCallback = null;
function fireInteract() { if (interactCallback) interactCallback(); }
export function onInteract(cb) { interactCallback = cb; }

// --- State transitions ---
function transitionTo(newState) {
  if (state === newState) return;
  state = newState;
  stateTimer = 0;
  sprite.isSurprised = false;
  sprite.blushAlpha = 0;
}

// --- Animation update ---
function updateAnimations(dt, elapsed) {
  // Always-running idle animations
  sprite.bodyBob = elapsed * 1.5;
  sprite.wingFlap = elapsed * 0.8;
  sprite.hairSway = elapsed * 0.6;
  sprite.skirtSway = elapsed * 1.2;

  // Blink
  blinkTimer += dt;
  if (!isBlinking && blinkTimer >= blinkInterval) {
    isBlinking = true;
    blinkTimer = 0;
    sprite.blinkProgress = 0;
  }
  if (isBlinking) {
    sprite.blinkProgress += dt * 10;
    if (sprite.blinkProgress >= 1) {
      isBlinking = false;
      sprite.blinkProgress = 0;
      blinkInterval = 2 + Math.random() * 3;
    }
  }

  // State-specific
  stateTimer += dt;
  switch (state) {
    case State.SHY:
      sprite.headTilt = Math.min(stateTimer / 0.4, 1) * (-0.2);
      sprite.blushAlpha = Math.min(stateTimer / 0.3, 1);
      if (stateTimer > 2.5) transitionTo(State.IDLE);
      break;
    case State.SURPRISED:
      sprite.isSurprised = true;
      sprite.bodyBob = elapsed * 3; // faster breathing
      if (stateTimer > 1.8) transitionTo(State.IDLE);
      break;
    case State.DRAGGING:
      sprite.bodyBob = elapsed * 2.5;
      break;
    case State.IDLE:
      sprite.headTilt *= 0.9; // decay
      sprite.blushAlpha *= 0.95;
      sprite.isSurprised = false;
      idleTime += dt;
      // Deep idle after 5 min — slow blink + sway
      if (idleTime > 300) {
        sprite.headTilt = Math.sin(elapsed * 0.3) * 0.04;
      }
      break;
  }

  // Eye follow decay when not hovering
  if (!isMouseOver) {
    sprite.eyeFollowX *= 0.92;
    sprite.eyeFollowY *= 0.92;
  }

  // Speech timer decay
  if (sprite.speechTimer > 0) {
    sprite.speechTimer -= dt;
  }
}

// --- Render Loop ---
let lastTime = performance.now();
function render(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  updateAnimations(dt, now / 1000);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprite.draw(ctx, container.clientWidth, container.clientHeight);

  requestAnimationFrame(render);
}

// --- Start ---
requestAnimationFrame(render);
console.log('✨ 雅儿贝德 2D Desktop Pet 已就绪');
