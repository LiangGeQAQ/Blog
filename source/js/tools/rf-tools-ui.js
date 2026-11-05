/* =====================================================================
 * rf-tools-ui.js — /tools 页面交互（PLMN + NR 频点换算）
 * 依赖 rf-tools.js 提供的 window.RFTools 纯函数。
 * 带 data-pjax：主题 PJAX 切换页面后会重新执行，DOM 也是新节点，无需手动解绑。
 * ===================================================================== */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var T = window.RFTools;
    if (!T || !document.getElementById('rf-tabs')) return;

    var $ = function (id) { return document.getElementById(id); };

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function showError(el, msg) {
      el.innerHTML = '<p class="rf-err">' + esc(msg) + '</p>';
    }

    /* ---------------- 页内页签 ---------------- */
    // 无 JS 时面板全部展开（CSS 只在 .js-tabs 下隐藏），这里负责切换与 hash 同步
    var tabsRoot = document.getElementById('rf-tabs');
    if (tabsRoot) {
      var tabBtns = Array.prototype.slice.call(tabsRoot.querySelectorAll('.rf-tab'));
      var tabPanels = Array.prototype.slice.call(tabsRoot.querySelectorAll('.rf-tabpanel'));

      var activateTab = function (name, syncHash) {
        var found = false;
        tabBtns.forEach(function (b) {
          var on = b.getAttribute('data-tab') === name;
          if (on) found = true;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
        });
        tabPanels.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === name);
        });
        if (found && syncHash) {
          // replaceState 而非 pushState：切页签不污染浏览器历史
          try { history.replaceState(null, '', '#' + name); } catch (e) { /* file:// 下忽略 */ }
        }
        return found;
      };

      var initialTab = (location.hash || '').replace('#', '');
      if (!activateTab(initialTab, false) && tabBtns.length) {
        activateTab(tabBtns[0].getAttribute('data-tab'), false);
      }
      tabsRoot.classList.add('js-tabs'); // JS 就绪后才收拢面板，避免闪隐

      tabBtns.forEach(function (btn, idx) {
        btn.addEventListener('click', function () {
          activateTab(btn.getAttribute('data-tab'), true);
        });
        btn.addEventListener('keydown', function (e) {
          var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          var next = tabBtns[(idx + dir + tabBtns.length) % tabBtns.length];
          activateTab(next.getAttribute('data-tab'), true);
          next.focus();
        });
      });

      window.addEventListener('popstate', function () {
        var name = (location.hash || '').replace('#', '');
        if (name) activateTab(name, false);
      });
    }

    /* ---------------- PLMN 编码 ---------------- */
    var mccEl = $('rf-plmn-mcc');
    var mncEl = $('rf-plmn-mnc');
    var encOut = $('rf-plmn-enc-out');

    function runEncode() {
      var mcc = mccEl.value.trim();
      var mnc = mncEl.value.trim();
      if (!mcc && !mnc) {
        encOut.innerHTML = '<p class="rf-hint">输入后实时给出十六进制编码。</p>';
        return;
      }
      var r = T.plmnEncode(mcc, mnc);
      if (r.error) { showError(encOut, r.error); return; }
      var spaced = r.hex.replace(/(..)(..)(..)/, '$1 $2 $3');
      encOut.innerHTML =
        '<dl class="rf-result">' +
        '<div><dt>PLMN-Identity（HEX）</dt><dd class="rf-mono">' + esc(r.hex) + '</dd></div>' +
        '<div><dt>按字节显示</dt><dd class="rf-mono">' + esc(spaced) + '</dd></div>' +
        '<div><dt>MCC / MNC</dt><dd>' + esc(mcc) + ' / ' + esc(mnc) + '</dd></div>' +
        '</dl>';
    }
    mccEl.addEventListener('input', runEncode);
    mncEl.addEventListener('input', runEncode);

    /* ---------------- PLMN 解码 ---------------- */
    var hexEl = $('rf-plmn-hex');
    var decOut = $('rf-plmn-dec-out');

    function runDecode() {
      var raw = hexEl.value.trim();
      if (!raw) {
        decOut.innerHTML = '<p class="rf-hint">输入后实时解码，空格会自动忽略。</p>';
        return;
      }
      var r = T.plmnDecode(raw);
      if (r.error) { showError(decOut, r.error); return; }
      var clean = raw.replace(/\s+/g, '').toUpperCase();
      var spaced = clean.replace(/(..)(..)(..)/, '$1 $2 $3');
      decOut.innerHTML =
        '<dl class="rf-result">' +
        '<div><dt>MCC</dt><dd class="rf-mono">' + esc(r.mcc) + '</dd></div>' +
        '<div><dt>MNC</dt><dd class="rf-mono">' + esc(r.mnc) + '（' + esc(r.mnc.length) + ' 位）</dd></div>' +
        '<div><dt>PLMN-Identity</dt><dd class="rf-mono">' + esc(spaced) + '</dd></div>' +
        '</dl>';
    }
    hexEl.addEventListener('input', runDecode);

    /* ---------------- NR 频点换算 ---------------- */
    var mode = 'f2n';
    var segBtns = document.querySelectorAll('.rf-seg-btn');
    var nrInput = $('rf-nr-input');
    var nrLabel = $('rf-nr-label');
    var nrOut = $('rf-nr-out');

    var MODE_UI = {
      f2n: {
        labelHTML: '频率 F<sub>REF</sub>（MHz，0 – 100000）',
        placeholder: '例如 3500'
      },
      n2f: {
        labelHTML: 'NR-ARFCN（N<sub>REF</sub>，整数 0 – 3279165）',
        placeholder: '例如 633333'
      },
      g2f: {
        labelHTML: 'GSCN（整数 22 – 26639）',
        placeholder: '例如 7846'
      }
    };

    segBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        mode = btn.getAttribute('data-rf-mode');
        segBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        nrLabel.innerHTML = MODE_UI[mode].labelHTML;
        nrInput.placeholder = MODE_UI[mode].placeholder;
        nrInput.value = '';
        nrOut.innerHTML = '<p class="rf-hint">输入后实时计算。</p>';
        nrInput.focus();
      });
    });

    function row(dt, dd, mono) {
      return '<div><dt>' + dt + '</dt><dd class="' + (mono ? 'rf-mono ' : '') + '"> ' + dd + '</dd></div>';
    }

    function rangeName(fMHz) {
      if (fMHz <= 3000) return '范围 1（≤3 GHz，ΔF=5 kHz）';
      if (fMHz <= 24250) return '范围 2（3 – 24.25 GHz，ΔF=15 kHz）';
      return '范围 3（≥24.25 GHz，ΔF=60 kHz）';
    }

    function runNr() {
      var raw = nrInput.value.trim();
      if (!raw) {
        nrOut.innerHTML = '<p class="rf-hint">输入后实时计算。</p>';
        return;
      }
      var v = Number(raw);
      if (!Number.isFinite(v)) { showError(nrOut, '请输入数字。'); return; }

      if (mode === 'n2f') {
        if (!Number.isInteger(v)) { showError(nrOut, 'NR-ARFCN 必须是整数。'); return; }
        var f = T.nrefToFreq(v);
        if (f === null) { showError(nrOut, 'N_REF 超出合法范围 0 – 3279165。'); return; }
        nrOut.innerHTML = '<dl class="rf-result">' +
          row('F<sub>REF</sub>（MHz）', esc(f.toFixed(3)), true) +
          row('NR-ARFCN', esc(v), true) +
          row('所属栅格段', esc(rangeName(f))) +
          '</dl>';
        return;
      }

      if (mode === 'g2f') {
        if (!Number.isInteger(v)) { showError(nrOut, 'GSCN 必须是整数。'); return; }
        var g = T.gscnToFreq(v);
        if (g === null) { showError(nrOut, 'GSCN 超出合法范围 22 – 26639，或落在保留值上。'); return; }
        nrOut.innerHTML = '<dl class="rf-result">' +
          row('SS<sub>REF</sub>（MHz）', esc(g.freq.toFixed(3)), true) +
          row('GSCN', esc(v), true) +
          row('同步栅格段', esc('范围 ' + g.range + (g.range === 1 ? '（N=' + g.n + '，M=' + g.m + '）' : '（N=' + g.n + '）'))) +
          '</dl>';
        return;
      }

      // f2n：频率同时反查 ARFCN 与最近 GSCN
      if (v < 0 || v > 100000) { showError(nrOut, '频率超出 0 – 100000 MHz。'); return; }
      var nref = T.freqToNref(v);
      var gscn = T.freqToGscn(v);
      if (nref === null) { showError(nrOut, '该频率无法映射到合法 NR-ARFCN。'); return; }
      var fBack = T.nrefToFreq(nref);
      var html = '<dl class="rf-result">' +
        row('NR-ARFCN（N<sub>REF</sub>）', esc(nref), true) +
        row('栅格点频率（MHz）', esc(fBack.toFixed(3)), true) +
        row('与输入偏差（MHz）', esc(T.round6(fBack - v).toFixed(3)), true) +
        row('所属栅格段', esc(rangeName(fBack)));
      if (gscn) {
        html += row('最近 GSCN', esc(gscn.gscn) + ' → SS<sub>REF</sub> ' + esc(gscn.freq.toFixed(3)) + ' MHz', true) +
          row('SS<sub>REF</sub> 偏差（MHz）', esc(gscn.error.toFixed(3)), true);
      }
      html += '</dl>';
      nrOut.innerHTML = html;
    }
    nrInput.addEventListener('input', runNr);
  });
})();
