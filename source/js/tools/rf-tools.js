/* =====================================================================
 * rf-tools.js — 3GPP 射频换算纯函数 + 页面初始化
 * 规范依据：
 *   - PLMN 身份编码：TS 24.301 §9.9.3.38（MCC/MNC 半字节反转）
 *   - NR-ARFCN / GSCN：TS 38.104 V18.7.0 Table 5.4.2.1-1 / 5.4.3.1-1
 * 纯函数挂在 window.RFTools，无外部依赖，可直接被 Node 引用做单测。
 * ===================================================================== */
(function (root) {
  'use strict';

  /* ---------- TS 38.104 Table 5.4.2.1-1：全局频率栅格 ---------- */
  // [频率上限 MHz, ΔFGlobal kHz, F_REF-Offs MHz, N_REF-Offs, N_REF 上限]
  var ARFCN_RANGES = [
    { fMax: 3000,   dF: 0.005, fOffs: 0,        nOffs: 0,       nMax: 599999 },
    { fMax: 24250,  dF: 0.015, fOffs: 3000,     nOffs: 600000,  nMax: 2016666 },
    { fMax: 100000, dF: 0.060, fOffs: 24250.08, nOffs: 2016667, nMax: 3279165 }
  ];

  /* ---------- TS 38.104 Table 5.4.3.1-1：同步栅格 GSCN ---------- */
  // 范围 1：0–3000 MHz，SSREF = N*1.2 + M*0.05，N=1..2499，M∈{1,3,5}，GSCN=3N+(M-3)/2
  // 范围 2：3000–24250 MHz，SSREF = 3000 + N*1.44，N=0..14756，GSCN=7499+N
  // 范围 3：24250–100000 MHz，SSREF = 24250.08 + N*17.28，N=0..4383，GSCN=22256+N
  var GSCN_R1 = { nMin: 1, nMax: 2499, mSet: [1, 3, 5], step: 1.2, mStep: 0.05, gBase: 0 };
  var GSCN_R2 = { nMin: 0, nMax: 14756, step: 1.44, fBase: 3000, gBase: 7499 };
  var GSCN_R3 = { nMin: 0, nMax: 4383, step: 17.28, fBase: 24250.08, gBase: 22256 };

  function round6(x) {
    // 消掉浮点尾数（如 3500.0000000000005），保留 6 位小数足够覆盖 5 kHz 栅格
    return Math.round(x * 1e6) / 1e6;
  }

  function arfcnRangeForFreq(fMHz) {
    for (var i = 0; i < ARFCN_RANGES.length; i++) {
      if (fMHz <= ARFCN_RANGES[i].fMax) return ARFCN_RANGES[i];
    }
    return null;
  }

  function arfcnRangeForN(nref) {
    for (var i = 0; i < ARFCN_RANGES.length; i++) {
      var r = ARFCN_RANGES[i];
      var nMin = i === 0 ? 0 : ARFCN_RANGES[i - 1].nMax + 1;
      if (nref >= nMin && nref <= r.nMax) return r;
    }
    return null;
  }

  /* ---------- NR-ARFCN ↔ 频率 ---------- */
  function freqToNref(fMHz) {
    if (fMHz < 0 || fMHz > 100000) return null;
    // 边界频率（3000 / 24250）同时邻近两段，枚举所有候选段取回算误差最小的合法 N_REF
    var best = null;
    for (var i = 0; i < ARFCN_RANGES.length; i++) {
      var r = ARFCN_RANGES[i];
      var nLow = i === 0 ? 0 : ARFCN_RANGES[i - 1].nMax + 1;
      var fLow = i === 0 ? 0 : r.fOffs;
      if (fMHz < fLow - 1 || fMHz > r.fMax + 1) continue;
      var n = Math.round((fMHz - r.fOffs) / r.dF) + r.nOffs;
      // 接缝频率（3000 / 24250）取整会落到相邻段，夹回本边界再参与误差比较
      if (n < nLow) n = nLow;
      if (n > r.nMax) n = r.nMax;
      var back = r.fOffs + r.dF * (n - r.nOffs);
      if (!best || Math.abs(back - fMHz) < Math.abs(best.back - fMHz)) {
        best = { n: n, back: back };
      }
    }
    return best ? best.n : null;
  }

  function nrefToFreq(nref) {
    var r = arfcnRangeForN(nref);
    if (!r) return null;
    return round6(r.fOffs + r.dF * (nref - r.nOffs));
  }

  /* ---------- GSCN → 频率（严格按 3GPP 定义，只接受合法 GSCN） ---------- */
  function gscnToFreq(gscn) {
    if (!Number.isInteger(gscn)) return null;
    if (gscn >= 22 && gscn <= 7498) {
      // 范围 1：GSCN = 3N + (M-3)/2
      var n1 = Math.round(gscn / 3);
      var rem = gscn - 3 * n1; // -1 / 0 / 1 → M = 1 / 3 / 5
      var m = 3 + 2 * rem;
      if (n1 < GSCN_R1.nMin || n1 > GSCN_R1.nMax || GSCN_R1.mSet.indexOf(m) < 0) return null;
      return { freq: round6(n1 * GSCN_R1.step + m * GSCN_R1.mStep), range: 1, n: n1, m: m };
    }
    if (gscn >= 7499 && gscn <= 22255) {
      var n2 = gscn - GSCN_R2.gBase;
      return { freq: round6(GSCN_R2.fBase + n2 * GSCN_R2.step), range: 2, n: n2 };
    }
    if (gscn >= 22256 && gscn <= 26639) {
      var n3 = gscn - GSCN_R3.gBase;
      return { freq: round6(GSCN_R3.fBase + n3 * GSCN_R3.step), range: 3, n: n3 };
    }
    return null;
  }

  /* ---------- 频率 → 最近 GSCN（同步栅格是离散点，取 SSREF 最接近者） ---------- */
  function freqToGscn(fMHz) {
    var candidates = [];

    // 范围 1：在 N0±1 内枚举 M∈{1,3,5}
    if (fMHz > 0 && fMHz < 2999.6) {
      var n0 = Math.round(fMHz / GSCN_R1.step);
      for (var d = -1; d <= 1; d++) {
        var n = n0 + d;
        if (n < GSCN_R1.nMin || n > GSCN_R1.nMax) continue;
        for (var k = 0; k < GSCN_R1.mSet.length; k++) {
          var mm = GSCN_R1.mSet[k];
          var g1 = 3 * n + (mm - 3) / 2;
          if (g1 < 22 || g1 > 7498) continue; // 表定 GSCN 范围
          var ff = round6(n * GSCN_R1.step + mm * GSCN_R1.mStep);
          candidates.push({ freq: ff, gscn: g1, range: 1 });
        }
      }
    }

    // 范围 2
    if (fMHz >= 2999 && fMHz <= 24250) {
      var n2 = Math.max(GSCN_R2.nMin, Math.min(GSCN_R2.nMax, Math.round((fMHz - GSCN_R2.fBase) / GSCN_R2.step)));
      candidates.push({
        freq: round6(GSCN_R2.fBase + n2 * GSCN_R2.step),
        gscn: GSCN_R2.gBase + n2,
        range: 2
      });
    }

    // 范围 3
    if (fMHz >= 24249 && fMHz <= 100000) {
      var n3 = Math.max(GSCN_R3.nMin, Math.min(GSCN_R3.nMax, Math.round((fMHz - GSCN_R3.fBase) / GSCN_R3.step)));
      candidates.push({
        freq: round6(GSCN_R3.fBase + n3 * GSCN_R3.step),
        gscn: GSCN_R3.gBase + n3,
        range: 3
      });
    }

    if (!candidates.length) return null;
    var best = candidates[0];
    for (var i = 1; i < candidates.length; i++) {
      if (Math.abs(candidates[i].freq - fMHz) < Math.abs(best.freq - fMHz)) best = candidates[i];
    }
    best.error = round6(best.freq - fMHz); // 同步栅格点与输入频率的偏差（MHz）
    return best;
  }

  /* ---------- PLMN：MCC/MNC ↔ PLMN-Identity（TS 24.301 §9.9.3.38） ----------
   * 八位组位表（高 nibble = bits8-5，低 nibble = bits4-1）：
   *   octet1: 高=MCC1 低=MCC2
   *   octet2: 高=MNC3(2 位 MNC 时为 0xF) 低=MCC3
   *   octet3: 高=MNC2 低=MNC1
   * nibbles 数组按 [低, 高, 低, 高, 低, 高] 排，拼字节恒取 (n[i+1], n[i])。
   */
  function plmnEncode(mcc, mnc) {
    if (!/^\d{3}$/.test(mcc)) return { error: 'MCC 必须是 3 位数字' };
    if (!/^\d{2,3}$/.test(mnc)) return { error: 'MNC 必须是 2 或 3 位数字' };
    var a = mcc.split('');
    var b = mnc.split('');
    var mnc3 = b.length === 3 ? b[2] : 'F';
    var nibbles = [a[1], a[0], a[2], mnc3, b[0], b[1]];
    var hex = '';
    for (var i = 0; i < nibbles.length; i += 2) {
      hex += nibbles[i + 1] + nibbles[i];
    }
    return { hex: hex.toUpperCase(), nibbles: nibbles };
  }

  function plmnDecode(hex) {
    var clean = String(hex).replace(/\s+/g, '').toUpperCase();
    if (!/^[0-9A-F]{6}$/.test(clean)) return { error: 'PLMN 编码必须是 6 个十六进制字符（3 字节）' };
    var bytes = clean.match(/[0-9A-F]{2}/g);
    var n = [];
    for (var i = 0; i < 3; i++) {
      n.push(bytes[i].charAt(1)); // 低 nibble
      n.push(bytes[i].charAt(0)); // 高 nibble
    }
    // n = [MCC2, MCC1, MCC3, MNC3/F, MNC1, MNC2]
    var mcc = n[1] + n[0] + n[2];
    // MNC 顺序 = MNC1 MNC2 MNC3，即 n[4] n[5] n[3]
    var mnc = n[3] === 'F' ? n[4] + n[5] : n[4] + n[5] + n[3];
    if (!/^\d{3}$/.test(mcc) || !/^\d{2,3}$/.test(mnc)) {
      return { error: '解码结果含非法 nibble（MCC/MNC 位出现 A–E），不是有效 PLMN 编码' };
    }
    return { mcc: mcc, mnc: mnc };
  }

  var RFTools = {
    ARFCN_RANGES: ARFCN_RANGES,
    freqToNref: freqToNref,
    nrefToFreq: nrefToFreq,
    gscnToFreq: gscnToFreq,
    freqToGscn: freqToGscn,
    plmnEncode: plmnEncode,
    plmnDecode: plmnDecode,
    round6: round6
  };

  root.RFTools = RFTools;
  if (typeof module !== 'undefined' && module.exports) module.exports = RFTools;
})(typeof window !== 'undefined' ? window : this);
