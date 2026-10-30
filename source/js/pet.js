/*!
 * 站点桌宠（桌面端限定）
 * 设计：非首页、正文两侧有空白时出现；可拖到页面任意位置悬浮，不强制贴边；
 *      正文占满屏幕时滑向最近一侧隐藏。
 * 说明：角色形象为三视图切出的透明 PNG/WebP 精灵（来源登记见 images/pet/ATTRIBUTION.md），
 *      非商业展示用途；交互思路参考 oneko.js 的轻量精灵做法。
 * 兼容：主题开启 PJAX，站内跳转不会重新加载文档，因此必须响应 pjax 事件重建实例。
 */
(function () {
  'use strict';

  var MIN_GUTTER = 110;   // 两侧空白小于该值就缩回（内容占满屏幕）
  var MOBILE_MAX = 900;   // 低于该宽度视为移动端（手机不加载）
  var PET_W = 171;
  var PET_H = 310;
  var STORE_KEY = 'pet:pos:v2';

  var LINES_ANY = [
    '又见面啦～\n今天想看点什么？',
    '点我一下说一句，\n再点一下换一句。',
    '我还能被拖走哦，\n放到顺手的地方就行。',
    '写博客的时候，\n别把调试参数也贴进去呀。',
    '这站是 Hexo 搭的，\n改完记得 push。',
    '困了就睡，\n代码明天还是你的。',
    '喝水。就现在。\n（认真盯）',
    '要不要先跑一遍构建？\n反正每次都会忘。',
    '我眨了眨眼，\n你看见了吗？',
    '诶？\n刚才是不是有只虫子飞过去。',
    '别盯着我啦，\n我只是一张 171×310 的图。',
    '写得真好……\n虽然我一句没看懂。',
    '这个 bug 昨天就在了吧？\n（小声）',
    '慢慢来，\n一次只改一个地方。',
    '哼哼～',
    '地址栏加 ?pet=0，\n我就可以先休息。'
  ];
  var LINES_MORNING = [
    '早上好呀。\n记得吃早饭。',
    '早八吗？\n那我陪你一起困。'
  ];
  var LINES_AFTERNOON = [
    '下午三点最容易犯困，\n起来走两步吧。',
    '今天进度怎么样？\n有没有偷偷摸鱼。'
  ];
  var LINES_EVENING = [
    '晚上好～\n今晚打算写点什么？',
    '又是改样式的一晚吗？\n我懂你。'
  ];
  var LINES_LATE = [
    '这个点了还不睡？\n明天还要上班诶。',
    '再改最后一个 bug 就睡——\n你上次也这么说。'
  ];
  var lastLine = '';

  var FORCE = /[?&]pet=1\b/.test(location.search);   // ?pet=1 强制显示（排障用）
  var OFF = /[?&]pet=0\b/.test(location.search);     // ?pet=0 临时关闭

  var el = null, bubble = null, side = 'right';
  var x = 0, y = 0;
  var dragging = false, moved = false;
  var startX = 0, startY = 0, originLeft = 0, originTop = 0;
  var bubbleTimer = null, lastPath = null, raf = 0;

  /* ---------- 伪 2.5D：整卡透视倾斜 ---------- */
  var ASSET_V = '?v=20261030t';
  var PET_VER = '20261030.19';   // 内容指纹：改素材必须同步改这里，否则 CDN 7 天缓存不会更新
  var SPRITE_CLOSED_1X = '/images/pet/front_closed_310.webp' + ASSET_V;
  var SPRITE_CLOSED_2X = '/images/pet/front_closed_620.webp' + ASSET_V;
  var SPRITE_CLOSED_3X = '/images/pet/front_closed_930.webp' + ASSET_V;
  var SPRITE_1X = '/images/pet/front_310.webp' + ASSET_V;
  var SPRITE_2X = '/images/pet/front_620.webp' + ASSET_V;
  var SPRITE_3X = '/images/pet/front_930.webp' + ASSET_V;
  // 三层结构：底图（眼内已铺满眼白）+ 会动的虹膜 + 固定在最上层的睫毛/眼眶
  var EYES = [
    { src: '/images/pet/iris_l.webp' + ASSET_V, src2: '/images/pet/iris_l@2x.webp' + ASSET_V, x: 34.12, y: 27.9, w: 8.97, h: 5.84 },
    { src: '/images/pet/iris_r.webp' + ASSET_V, src2: '/images/pet/iris_r@2x.webp' + ASSET_V, x: 61.76, y: 27.82, w: 8.82, h: 5.84 }
  ];
  var MAX_EYE_X = 1.2, MAX_EYE_Y = 0.8;   // 幅度收敛：只在眼眶内小幅游移   // 虹膜最大位移（CSS px，1x）
  var TILT_START = 0.68;                  // 指针偏移超过这个比例才开始带头部倾斜
  var MAX_TILT_Y = 1.5, MAX_TILT_X = 1.0;   // 头部倾斜幅度（比原来收敛一半以上）
  var artEl = null;             // 承载倾斜的 card
  var eyeEls = [];              // 虹膜补丁（跟随）
  var layers = [];              // 兼容旧接口，sprite 模式恒为空
  var headTilt = null;
  var target = { x: 0, y: 0 };  // 归一化指针方向 [-1,1]
  var cur = { x: 0, y: 0 };
  var tiltRaf = 0, tiltOn = false;
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

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
    if (bubble && bubble.classList.contains('is-on')) placeBubble();
  }

  function updateVisibility() {
    if (!el) return;
    var ok = FORCE ? true : (gutter() >= MIN_GUTTER && !mqMobile());
    el.classList.toggle('is-hidden', !ok);
    el.setAttribute('aria-hidden', ok ? 'false' : 'true');
    if (ok) applyPosition();
  }

  /* ===== 伪 2.5D（sprite 版：透视倾斜 + 视差位移） ===== */

  // 超过阈值才缓慢加入头部倾斜：阈值内完全静止，避免“跟着鼠标晃”
  function tiltAmount(v) {
    var a = Math.abs(v);
    if (a <= TILT_START) return 0;
    var t = (a - TILT_START) / (1 - TILT_START);
    return (v < 0 ? -1 : 1) * t * t;   // 平方过渡，越靠边越明显
  }

  function applyTilt() {
    // 1) 眼睛跟随（主效果）
    for (var i = 0; i < eyeEls.length; i++) {
      var e = eyeEls[i];
      e.style.transform = 'translate3d(' + (cur.x * MAX_EYE_X).toFixed(2) + 'px,' +
                          (cur.y * MAX_EYE_Y).toFixed(2) + 'px,0)';
    }
    // 2) 角度大时才轻微带头部倾斜（次效果）
    if (!artEl) return;
    var ry = tiltAmount(cur.x) * MAX_TILT_Y;
    var rx = -tiltAmount(cur.y) * MAX_TILT_X;
    artEl.style.transform = 'perspective(700px) rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
  }

  function tick() {
    var ex = target.x - cur.x, ey = target.y - cur.y;
    cur.x += ex * 0.16;
    cur.y += ey * 0.16;
    if (Math.abs(ex) < 0.002 && Math.abs(ey) < 0.002) {
      cur.x = target.x; cur.y = target.y;
      applyTilt();
      tiltRaf = 0; tiltOn = false;
      return;
    }
    applyTilt();
    tiltRaf = requestAnimationFrame(tick);
  }

  function kickTilt() {
    if (tiltOn || reduced) return;
    tiltOn = true;
    tiltRaf = requestAnimationFrame(tick);
  }

  function onWindowMove(e) {
    if (!el || dragging || reduced) return;
    var r = el.getBoundingClientRect();
    var nx = (e.clientX - (r.left + r.width / 2)) / 280;
    var ny = (e.clientY - (r.top + r.height / 2)) / 220;
    target.x = clamp(nx, -1, 1);
    target.y = clamp(ny, -1, 1);
    kickTilt();
  }

  function resetTilt() {
    target.x = 0; target.y = 0;
    kickTilt();
  }

  function addLayer(card, cfg, cls, collect) {
    var el2 = document.createElement('img');
    el2.className = cls;
    el2.alt = '';
    el2.draggable = false;
    el2.src = cfg.src;
    el2.srcset = cfg.src2 + ' 2x';
    el2.style.left = cfg.x + '%';
    el2.style.top = cfg.y + '%';
    el2.style.width = cfg.w + '%';
    el2.style.height = cfg.h + '%';
    card.appendChild(el2);
    if (collect) collect.push(el2);
    return el2;
  }

  function buildEyeLayers(card) {
    eyeEls = [];
    for (var i = 0; i < EYES.length; i++) addLayer(card, EYES[i], 'pet-eye', eyeEls);
    // 睫毛层最后添加 → 永远盖在虹膜之上，虹膜移动时被它裁住不会越界

  }

  function mountArt(card) {
    if (reduced) { return; }
    artEl = card;
    buildEyeLayers(card);
    startBlink();
    card.style.transformOrigin = '50% 88%;';
    card.style.transformOrigin = '50% 88%';
    window.addEventListener('pointermove', onWindowMove, { passive: true });
    window.addEventListener('blur', resetTilt);
    document.addEventListener('mouseleave', resetTilt);
  }



  /* ---------- 眨眼：两帧换图（闭眼帧已预载，切换无闪烁） ---------- */
  var BLINK_ON = true;
  var blinkTimer = null, blinkOn = false, closedEl = null;

  function setClosed(on) {
    if (closedEl) closedEl.style.opacity = on ? '1' : '0';
  }

  function scheduleBlink() {
    if (!BLINK_ON) return;
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(blinkOnce, 3600 + Math.random() * 3200);
  }

  function blinkOnce() {
    if (!el || !closedEl || document.hidden) { scheduleBlink(); return; }
    blinkOn = true;
    for (var i = 0; i < eyeEls.length; i++) eyeEls[i].style.opacity = '0';
    // 交叉溶解到闭眼原画：半程 → 全闭 → 睁（不做任何贴片/绘制）
    if (closedEl) closedEl.style.opacity = '0.65';
    setTimeout(function () { if (closedEl) closedEl.style.opacity = '1'; }, 90);
    setTimeout(function () {
      blinkOn = false;
      if (closedEl) closedEl.style.opacity = '0';
      for (var j = 0; j < eyeEls.length; j++) eyeEls[j].style.opacity = '1';
      scheduleBlink();
    }, 430);
  }

  function startBlink() {
    scheduleBlink();
  }

  function pickLine() {
    var h = new Date().getHours();
    var pool = LINES_ANY.slice();
    if (h >= 5 && h < 11) pool = pool.concat(LINES_MORNING);
    else if (h >= 11 && h < 18) pool = pool.concat(LINES_AFTERNOON);
    else if (h >= 18 && h < 23) pool = pool.concat(LINES_EVENING);
    else pool = pool.concat(LINES_LATE);
    var s = '';
    for (var i = 0; i < 6; i++) {
      s = pool[Math.floor(Math.random() * pool.length)];
      if (s !== lastLine) break;
    }
    lastLine = s;
    return s;
  }

  var fontTried = false;
  function ensureFont() {
    if (fontTried) return;
    fontTried = true;
    if (!document.fonts || !document.fonts.load) return;
    try {
      document.fonts.load('13.5px PetBubble').then(function () {
        if (bubble && bubble.classList.contains('is-on')) placeBubble();
      })["catch"](function () {});
    } catch (e) { /* ignore */ }
  }

  /* 气泡摆位：贴到页面外侧的空白带，优先人头上方，空间不够翻到脚下；尾巴指向头顶 */
  function placeBubble() {
    if (!bubble || !el) return;
    var W = window.innerWidth, H = window.innerHeight;
    var pr = el.getBoundingClientRect();
    var main = document.querySelector('.main-content') || document.querySelector('main');
    var mr = main ? main.getBoundingClientRect() : null;
    var band = side === 'right'
      ? (mr ? W - mr.right : W - pr.right)
      : (mr ? mr.left : pr.left);
    var maxW = clamp(Math.round(band - 12), 140, 240);
    bubble.style.maxWidth = maxW + 'px';

    bubble.classList.remove('is-below');
    bubble.style.left = '0px';
    bubble.style.top = '0px';
    var bw = bubble.offsetWidth || maxW;
    var bh = bubble.offsetHeight || 64;

    var left = side === 'right' ? W - 10 - bw : 10;
    left = clamp(left, 8, Math.max(8, W - bw - 8));

    var headX = pr.left + pr.width / 2;
    var top = Math.round(pr.top - bh - 12);
    var below = false;
    if (top < 8) {
      below = true;
      top = Math.round(pr.top + pr.height + 10);
      if (top + bh > H - 8) top = H - 8 - bh;
    }
    top = Math.max(8, top);

    bubble.style.left = Math.round(left - pr.left) + 'px';
    bubble.style.top = Math.round(top - pr.top) + 'px';
    bubble.style.setProperty('--tail-x', Math.round(clamp(headX - left, 20, bw - 20)) + 'px');
    bubble.classList.toggle('is-below', below);
  }

  function showBubble() {
    if (!bubble) return;
    ensureFont();
    var text = pickLine();
    bubble.textContent = text;
    placeBubble();
    bubble.classList.add('is-on');
    clearTimeout(bubbleTimer);
    var ms = 2600 + text.length * 60;
    bubbleTimer = setTimeout(function () { bubble.classList.remove('is-on'); }, Math.min(ms, 6400));
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

    var art = document.createElement('div');
    art.className = 'pet-art';
    var card = document.createElement('div');
    card.className = 'pet-card';
    var img = document.createElement('img');
    img.src = SPRITE_1X;
    img.srcset = SPRITE_2X + ' 2x, ' + SPRITE_3X + ' 3x';
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    card.appendChild(img);

    if (!card.querySelector('.pet-closed')) {
      var cimg = document.createElement('img');
      cimg.className = 'pet-closed';
      cimg.alt = '';
      cimg.draggable = false;
      cimg.src = SPRITE_CLOSED_1X;
      cimg.srcset = SPRITE_CLOSED_2X + ' 2x, ' + SPRITE_CLOSED_3X + ' 3x';
      cimg.style.opacity = '0';
      card.appendChild(cimg);
      closedEl = cimg;
    }
    art.appendChild(card);
    art.setAttribute('data-credit', '角色形象：阿万提供（AI 生成三视图），见 /images/pet/ATTRIBUTION.md');
    el.appendChild(art);
    mountArt(card);

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
    layers = []; headTilt = null; artEl = null;
    cancelAnimationFrame(tiltRaf); tiltRaf = 0; tiltOn = false;
    cur.x = cur.y = 0; target.x = target.y = 0;
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
        off: OFF,
        sprite: !!artEl,
        ver: ASSET_V.replace('?v=', ''),
        codeVer: PET_VER,
        tilt: { x: +cur.x.toFixed(3), y: +cur.y.toFixed(3) }
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
