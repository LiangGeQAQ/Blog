/*!
 * 站点桌宠（桌面端限定）
 * 设计：非首页、正文两侧有空白时出现；可拖到页面任意位置悬浮，不强制贴边；
 *      正文占满屏幕时滑向最近一侧隐藏。
 * 说明：角色为原创绘制的 Q 版银发少女形象（SVG），不含任何第三方素材或 Live2D 模型，
 *      故不涉及第三方版权与运行时依赖；交互思路参考 oneko.js 的轻量精灵做法。
 * 兼容：主题开启 PJAX，站内跳转不会重新加载文档，因此必须响应 pjax 事件重建实例。
 */
(function () {
  'use strict';

  var MIN_GUTTER = 110;   // 两侧空白小于该值就缩回（内容占满屏幕）
  var MOBILE_MAX = 900;   // 低于该宽度视为移动端（手机不加载）
  var PET_W = 96;
  var PET_H = 136;
  var STORE_KEY = 'pet:pos:v2';

  var LINES = [
    '今天也要加油呀～',
    '要不要先喝口水？',
    '又在折腾板子吗？',
    '写不动了就休息一下。',
    '我在这儿陪你一会儿。'
  ];

  var FORCE = /[?&]pet=1\b/.test(location.search);   // ?pet=1 强制显示（排障用）
  var OFF = /[?&]pet=0\b/.test(location.search);     // ?pet=0 临时关闭

  var el = null, bubble = null, side = 'right';
  var x = 0, y = 0;
  var dragging = false, moved = false;
  var startX = 0, startY = 0, originLeft = 0, originTop = 0;
  var bubbleTimer = null, lastPath = null, raf = 0;

  function mqMobile() { return !FORCE && window.matchMedia('(max-width:' + MOBILE_MAX + 'px)').matches; }

  function currentPath() {
    return location.pathname.replace(/index\.html$/, '');
  }

  function isHome() {
    if (FORCE) return false;
    var p = currentPath();
    return p === '/' || p === '';
  }

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      if (typeof s.x === 'number') x = s.x;
      if (typeof s.y === 'number') y = s.y;
    } catch (e) { /* ignore */ }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ x: Math.round(x), y: Math.round(y) })); } catch (e) {}
  }

  function contentWidth() {
    var main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    if (!main) return 0;
    return main.getBoundingClientRect().width || 0;
  }

  function gutter() {
    return (window.innerWidth - Math.min(contentWidth(), window.innerWidth)) / 2;
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function applyPosition() {
    if (!el) return;
    x = clamp(x, 0, window.innerWidth - PET_W);
    y = clamp(y, 12, window.innerHeight - PET_H - 12);
    side = (x + PET_W / 2) < window.innerWidth / 2 ? 'left' : 'right';
    el.classList.toggle('side-left', side === 'left');
    el.classList.toggle('side-right', side === 'right');
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
  }

  function updateVisibility() {
    if (!el) return;
    var ok = FORCE ? true : (gutter() >= MIN_GUTTER && !mqMobile());
    el.classList.toggle('is-hidden', !ok);
    el.setAttribute('aria-hidden', ok ? 'false' : 'true');
    if (ok) applyPosition();
  }

  function showBubble() {
    if (!bubble) return;
    bubble.textContent = LINES[Math.floor(Math.random() * LINES.length)];
    bubble.classList.add('is-on');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.classList.remove('is-on'); }, 2600);
  }

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
    x = clamp(originLeft + dx, 0, window.innerWidth - PET_W);
    y = clamp(originTop + dy, 12, window.innerHeight - PET_H - 12);
    side = (x + PET_W / 2) < window.innerWidth / 2 ? 'left' : 'right';
    el.classList.toggle('side-left', side === 'left');
    el.classList.toggle('side-right', side === 'right');
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('is-dragging');
    if (moved) { saveState(); applyPosition(); }
    else { showBubble(); }
  }

  function build() {
    if (el) return;
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
    if (!x && !y) {
      x = window.innerWidth - PET_W - 24;
      y = window.innerHeight - PET_H - 96;
    }
    applyPosition();
    updateVisibility();
  }

  function destroy() {
    if (!el) return;
    el.remove();
    el = null; bubble = null; dragging = false;
  }

  /* 根据当前 URL / 视口决定挂载还是卸载 */
  function sync(force) {
    if (OFF) { destroy(); return; }
    if (!force && currentPath() === lastPath) { updateVisibility(); return; }
    lastPath = currentPath();
    if (isHome() || mqMobile()) { destroy(); return; }
    build();
    updateVisibility();
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { applyPosition(); updateVisibility(); });
  }

  function boot() {
    sync(true);
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', function () { sync(true); });

    // PJAX：站内跳转不会触发 DOMContentLoaded，必须监听 pjax 事件
    ['pjax:success', 'pjax:end', 'pjax:complete', 'pjax:popstate'].forEach(function (ev) {
      window.addEventListener(ev, function () { setTimeout(function () { sync(true); }, 60); });
    });
    window.addEventListener('popstate', function () { setTimeout(function () { sync(true); }, 120); });

    // 兜底：某些主题/脚本不发事件，URL 变了就重建
    setInterval(function () {
      if (currentPath() !== lastPath) sync(true);
    }, 1200);

    // 排障用：控制台执行 __petDebug() 查看当前判定
    window.__petDebug = function () {
      return {
        mounted: !!el,
        path: currentPath(),
        home: isHome(),
        mobileMQ: mqMobile(),
        innerWidth: window.innerWidth,
        contentWidth: Math.round(contentWidth()),
        gutter: Math.round(gutter()),
        minGutter: MIN_GUTTER,
        hidden: el ? el.classList.contains('is-hidden') : null,
        pos: { x: Math.round(x), y: Math.round(y) },
        force: FORCE,
        off: OFF
      };
    };
  }

  /* 站点资源较重，页面可能长时间停在 loading，defer/DOMContentLoaded 会被拖住，
     因此用 async 加载 + 轮询 body 就绪 */
  var started = false;
  function start() {
    if (started || !document.body) return;
    started = true;
    boot();
  }
  document.addEventListener('DOMContentLoaded', start);
  var waitBody = setInterval(function () {
    if (started) { clearInterval(waitBody); return; }
    if (document.body) { start(); clearInterval(waitBody); }
  }, 250);
  start();
})();
