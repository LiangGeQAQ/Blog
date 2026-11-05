---
title: tools
date: 2026-11-05 11:00:00
updated: 2026-11-05 11:00:00
comment: false
description: "基于 3GPP 规范的在线换算：PLMN-Identity 编解码、NR-ARFCN 与 GSCN 频点转换。"
---

## 3GPP 射频与标识换算

本页工具全部在浏览器本地计算，不上传任何输入。规范依据与参数表：

- **PLMN-Identity 编码**：TS 24.301 §9.9.3.38（MCC/MNC 半字节反转，2 位 MNC 以 `0xF` 填充）
- **NR-ARFCN 与 GSCN**：TS 38.104 V18.7.0 Table 5.4.2.1-1 与 Table 5.4.3.1-1

### 工具一：PLMN-Identity 编解码

`PLMN-Identity` 占 3 个字节，MCC 与 MNC 的十进制位按半字节（nibble）交换顺序排列：

| 八位组 | 高 4 bit | 低 4 bit |
|---|---|---|
| octet 1 | MCC digit 1 | MCC digit 2 |
| octet 2 | MNC digit 3（2 位 MNC 时为 `F`） | MCC digit 3 |
| octet 3 | MNC digit 2 | MNC digit 1 |

<div class="rf-tool" id="rf-plmn">
<div class="rf-grid">
<section class="rf-panel" aria-labelledby="rf-plmn-enc-h">
<h3 id="rf-plmn-enc-h">MCC / MNC → PLMN 编码</h3>
<div class="rf-field">
<label for="rf-plmn-mcc">MCC（3 位数字，如 460）</label>
<input id="rf-plmn-mcc" class="rf-input" type="text" inputmode="numeric" maxlength="3" placeholder="460" autocomplete="off">
</div>
<div class="rf-field">
<label for="rf-plmn-mnc">MNC（2 或 3 位数字，如 00 / 011）</label>
<input id="rf-plmn-mnc" class="rf-input" type="text" inputmode="numeric" maxlength="3" placeholder="00" autocomplete="off">
</div>
<div class="rf-output" id="rf-plmn-enc-out" aria-live="polite">
<p class="rf-hint">输入后实时给出十六进制编码。</p>
</div>
</section>
<section class="rf-panel" aria-labelledby="rf-plmn-dec-h">
<h3 id="rf-plmn-dec-h">PLMN 编码 → MCC / MNC</h3>
<div class="rf-field">
<label for="rf-plmn-hex">PLMN-Identity（6 个十六进制字符）</label>
<input id="rf-plmn-hex" class="rf-input" type="text" maxlength="6" placeholder="46F000" autocomplete="off" spellcheck="false">
</div>
<div class="rf-output" id="rf-plmn-dec-out" aria-live="polite">
<p class="rf-hint">输入后实时解码，空格会自动忽略。</p>
</div>
</section>
</div>
</div>

### 工具二：NR 频率 / NR-ARFCN / GSCN 换算

全局频率栅格与同步栅格是两套独立的离散点：**NR-ARFCN** 标识载波参考频率 F<sub>REF</sub>，**GSCN** 标识同步信号块频率 SS<sub>REF</sub>。由频率反查时返回栅格上最接近的合法点，并给出偏差。

<div class="rf-tool" id="rf-nr">
<div class="rf-seg" role="tablist" aria-label="换算方向">
<button type="button" class="rf-seg-btn is-active" role="tab" aria-selected="true" data-rf-mode="f2n">频率 → ARFCN / GSCN</button>
<button type="button" class="rf-seg-btn" role="tab" aria-selected="false" data-rf-mode="n2f">NR-ARFCN → 频率</button>
<button type="button" class="rf-seg-btn" role="tab" aria-selected="false" data-rf-mode="g2f">GSCN → 频率</button>
</div>
<div class="rf-field">
<label for="rf-nr-input" id="rf-nr-label">频率 F<sub>REF</sub>（MHz，0 – 100000）</label>
<input id="rf-nr-input" class="rf-input" type="text" inputmode="decimal" placeholder="例如 3500" autocomplete="off">
</div>
<div class="rf-output" id="rf-nr-out" aria-live="polite">
<p class="rf-hint">输入后实时计算。</p>
</div>
</div>

#### NR-ARFCN 全局频率栅格参数（TS 38.104 Table 5.4.2.1-1）

关系式：F<sub>REF</sub> = F<sub>REF-Offs</sub> + ΔF<sub>Global</sub> × (N<sub>REF</sub> − N<sub>REF-Offs</sub>)

<div class="rf-table-wrap">

| 频率范围 (MHz) | ΔF<sub>Global</sub> (kHz) | F<sub>REF-Offs</sub> (MHz) | N<sub>REF-Offs</sub> | N<sub>REF</sub> 范围 |
|---|---|---|---|---|
| 0 – 3000 | 5 | 0 | 0 | 0 – 599999 |
| 3000 – 24250 | 15 | 3000 | 600000 | 600000 – 2016666 |
| 24250 – 100000 | 60 | 24250.08 | 2016667 | 2016667 – 3279165 |

</div>

#### GSCN 同步栅格参数（TS 38.104 Table 5.4.3.1-1）

<div class="rf-table-wrap">

| 频率范围 (MHz) | SS<sub>REF</sub> 定义 | GSCN 定义 | GSCN 范围 |
|---|---|---|---|
| 0 – 3000 | N×1200 kHz + M×50 kHz，N=1…2499，M∈{1,3,5} | 3N + (M−3)/2 | 22 – 7498 |
| 3000 – 24250 | 3000 MHz + N×1.44 MHz，N=0…14756 | 7499 + N | 7499 – 22255 |
| 24250 – 100000 | 24250.08 MHz + N×17.28 MHz，N=0…4383 | 22256 + N | 22256 – 26639 |

</div>

<noscript class="rf-noscript">本页换算工具需要启用 JavaScript；上方参数表可正常查阅。</noscript>

<script src="/js/tools/rf-tools.js" data-pjax></script>
<script src="/js/tools/rf-tools-ui.js" data-pjax></script>
