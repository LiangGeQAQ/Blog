/*!
 * 站点桌宠（桌面端限定）
 * 设计：仅在「正文两侧有空白」且非首页时从页面边缘探出，可拖动，窄屏自动缩回。
 * 说明：角色为原创绘制的 Q 版银发少女形象（SVG），不含任何第三方素材或 Live2D 模型，
 *      故不涉及第三方版权与运行时依赖；交互思路参考 oneko.js 的轻量精灵做法。
 */
(function () {
  'use strict';

  var MIN_GUTTER = 110;   // 两侧空白小于该值就缩回（内容占满屏幕）
  var MOBILE_MAX = 900;   // 低于该宽度视为移动端
  var PET_W = 96;
  var PET_H = 128;
  var STORE_KEY = 'pet:pos:v1';

  var LINES = [
    '今天也要加油呀～',
    '要不要先喝口水？',
    '又在折腾板子吗？',
    '写不动了就休息一下。',
    '我在这儿陪你一会儿。'
  ];

  // 移动端/触屏：直接不加载
  var mqMobile = window.matchMedia('(max-width:' + MOBILE_MAX + 'px)');
  var mqCoarse = window.matchMedia('(pointer: coarse)');
  if (mqMobile.matches || mqCoarse.matches) return;
  // 首页不出现
  var path = location.pathname.replace(/index\.html$/, '');
  if (path === '/' || path === '') return;

  var el, bubble, side = 'right', y = 0, dragging = false, moved = false;
  var startX = 0, startY = 0, originLeft = 0, originTop = 0;
  var bubbleTimer = null;

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (s.side === 'left' || s.side === 'right') side = s.side;
      if (typeof s.y === 'number') y = s.y;
    } catch (e) { /* ignore */ }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ side: side, y: Math.round(y) })); } catch (e) {}
  }

  function contentWidth() {
    var main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    var r = main.getBoundingClientRect();
    return r.width || 0;
  }

  function gutter() {
    return (window.innerWidth - Math.min(contentWidth(), window.innerWidth)) / 2;
  }

  function clampY(v) {
    var max = window.innerHeight - PET_H - 12;
    return Math.max(12, Math.min(max, v));
  }

  function applyPosition() {
    if (!el) return;
    if (!dragging) y = clampY(y);
    el.classList.toggle('side-left', side === 'left');
    el.classList.toggle('side-right', side === 'right');
    el.style.top = Math.round(y) + 'px';
    if (side === 'left') {
      el.style.left = '0px';
      el.style.right = 'auto';
    } else {
      el.style.left = (window.innerWidth - PET_W) + 'px';
      el.style.right = 'auto';
    }
  }

  function updateVisibility() {
    if (!el) return;
    var g = gutter();
    var canShow = g >= MIN_GUTTER && !mqMobile.matches;
    el.classList.toggle('is-hidden', !canShow);
    el.setAttribute('aria-hidden', canShow ? 'false' : 'true');
    if (canShow) applyPosition();
  }

  function showBubble() {
    if (!bubble) return;
    bubble.textContent = LINES[Math.floor(Math.random() * LINES.length)];
    bubble.classList.add('is-on');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove('is-on'); }, 2600);
  }

  // ---- 拖动 ----
  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; moved = false;
    startX = e.clientX; startY = e.clientY;
    var r = el.getBoundingClientRect();
    originLeft = r.left; originTop = r.top;
    el.classList.add('is-dragging');
    if (el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (err) {} }
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    var left = Math.max(0, Math.min(window.innerWidth - PET_W, originLeft + dx));
    var top = Math.max(12, Math.min(window.innerHeight - PET_H - 12, originTop + dy));
    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
    y = top;
    side = left + PET_W / 2 < window.innerWidth / 2 ? 'left' : 'right';
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    if (moved) { saveState(); applyPosition(); }
    else { showBubble(); }
  }

  function build() {
    el = document.createElement('div');
    el.id = 'pet-widget';
    el.className = 'is-hidden';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', '站点桌宠，可拖动；点击说话');

    var img = document.createElement('img');
    img.src = '/images/pet/emilia-chibi.svg';
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);

    bubble = document.createElement('div');
    bubble.className = 'pet-bubble';
    el.appendChild(bubble);

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showBubble(); }
    });

    document.body.appendChild(el);

    loadState();
    y = clampY(y || window.innerHeight - PET_H - 80);
    applyPosition();
    updateVisibility();
  }

  var raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { applyPosition(); updateVisibility(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
})();
