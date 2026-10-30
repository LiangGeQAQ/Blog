---
title: 把 AI 出图变成能用的桌宠：一份 Q 版人物提示词备忘
date: 2026-10-30 02:20:00
updated: 2026-10-30 08:50:00
tags: [AI, 提示词, 桌宠, 图像处理, Hexo]
categories: [工具与效率]
comment: true
mathjax: false
description: "从「能出图」到「能上线」之间隔着一整条工程流水线，记录一次 Q 版桌宠的提示词设计与踩坑实录。"
---

博客右下角那只小人，是我熬了一晚上调出来的。

过程不算优雅：一开始自己拿 SVG 手绘，画到第三版发现自己画的是"倒着的半圆"；后来改走 AI 出图 + 像素处理，又被"白边""错位""眨眼闪白"轮番教育。最后能跑起来，靠的不是某个神奇的提示词，而是**把工程约束提前写进提示词里**。

这篇就当个备忘，顺便把踩过的坑记下来。

## 一、提示词的四段式

一套能用的桌宠素材，我最后拆成四个独立需求：

| 用途 | 关键约束 |
|---|---|
| 三视图 | 正面/侧面/背面并列、同比例、透明背景 |
| 正面自然垂手 | 手臂 15–20°、腋下有缝、**禁止 T-pose** |
| 转身序列 | 5 帧 0°→90°，角度逐帧递增、脚底同线 |
| 行走循环 | 4 帧、90° 侧视、步幅小且自然 |

抽一个看，正面垂手那条的核心长这样：

```text
二头身 Q 版小人，正面平视，透明背景（alpha 通道，无任何背景元素）。
头部占总高约 50%，短圆四肢，幼态圆脸。
双臂自然下垂，从躯干向外张开约 15–20 度，肘部微屈，双手略向前伸。
肩部放松不耸起，手臂与躯干之间留有清晰缝隙、不遮挡身体轮廓。
干净纤细的闭合线稿，赛璐璐平涂，一层硬阴影，低饱和柔和配色。
```

配套的负面词才是真正干活的部分：

```text
white background, solid background, checkerboard pattern, ground shadow,
T-pose, arms straight out, arms crossed, arms merged with torso,
3D render, realistic face, watercolor, thick paint, adult proportions,
messy sketch lines, American cartoon eyes, gradient blending
```

**经验：正面/负面要成对写。** 你只写"手臂自然下垂"，它大概率给你一个标准 T-pose 设定图；你必须明确写"不要 T-pose、手臂不要贴住躯干"。提示词不是许愿池，是需求文档。

## 二、四个我踩过的坑

### 坑 1：透明背景 ≠ 白底

"透明背景"这个词模型经常听不懂，直接给你一张纯白底。白底也能用，但你得自己抠——而如果角色是**白发 + 白袍**，抠图会把人抠出白边，边缘全是混了背景色的像素。

我的解法是"最近不透明色扩散"：对半透明边缘像素，用邻近的实色去替换它，而不是简单调 alpha。处理前后边缘平均色从 `(252,247,250)` 收敛到 `(229,225,229)`，才勉强看不出白圈。

### 坑 2：两次生成不可能像素一致

这是最贵的一课。

我先出了一张正视图，又出了一张同角色的闭眼图，兴冲冲想拿闭眼图做眨眼帧——结果两张图**腿长不一样**。按脸对齐，身体错位；按轮廓对齐，脸被拉伸变形。用户一眼就看出来"高了半条腿"。

结论很简单粗暴：**AI 生成的两次结果，不存在"同一张画的两种状态"。** 想要眨眼，别指望重新生成，去用 **img2img / 局部重绘（inpaint）**，只重绘眼部，其余锁死。

### 坑 3：配准锚点选哪个

如果只能硬凑两张图，锚点选择决定成败：

- 按**眉毛**对齐 → 半径拉变形（眉毛位置在不同生成里最不稳定）
- 按**轮廓 IoU** 对齐 → 全图最像，但身高会被宽度/发量带偏
- 按**眼球中心**对齐 → ✅ 眼睛对得最准，而且只替换眼部时，身体根本不需要对齐

最后一版的做法：**只替换眼睛**，掩膜 = 底图眼球轮廓的凸包 → 外扩 3px → 羽化 1.5px。验收标准写得死死的：

> 掩膜之外，与底图的逐像素差异必须为 **0**。

实测 0 像素，这样身体、头发、眉毛在结构上不可能被动到。

### 坑 4：眨眼闪白

第一版眨眼是直接换 `<img>` 的 `src`。结果每次眨眼，画面会白闪一下——因为新图还在解码时，元素是空的，页面底色直接透出来。

改成**两张图叠放，只切 opacity**，并且闭眼帧提前预载，问题消失。

顺带一个反直觉的坑：**CSS 透明度变化在 headless 截图里根本抓不到**（连把 src 换成纯红都不刷新画面），只能去读 `getComputedStyle().opacity` 采样峰值来验证。所以我前半程的"我以为改好了"有一半是假的。

## 三、上线之后还有一层

素材改完不等于用户能看到新版本——CDN 对 `/images/*` 常见是 7 天缓存，同名文件覆盖不会生效。这次我连续三次"修好了"其实都卡在这。

最后给所有素材 URL 加了内容指纹：

```js
var ASSET_V = '?v=20261030t';
// 改素材必须同步改这里，否则 CDN 缓存不会更新
```

## 四、一句话总结

> 提示词负责"生成得像"，工程负责"用得起来"。

AI 出图现在很能打，但它不知道你要做的是**171×310 像素、带透明通道、能叠在网页角落、每 5 秒眨一次眼**的小人。这些约束，得由你翻译成人话写进提示词，剩下的部分——抠图、配准、掩膜、缓存——才是真正决定"能不能上线"的地方。

完整的实现参数我记在站点的 `BLOG_GUIDE 4.6.2` 里了，万一以后忘了怎么调，翻那份就行。

## 五、附录：可直接抄的提示词

下面四份是我实际跑通的那一套，按「一次只让模型干一件事」的思路拆开的。

> 说明：具体到哪个角色、什么发色服装、要不要做某个特殊动作，这些和我的私活强绑定的细节我都用 `xx` 代替了——**留白的地方换成你自己的设定即可**，结构不用动。任务描述越具体（比如“给我来一段跑步”“拿剑摆个姿势”），模型越容易崩，这也是我把它们虚化的原因。

### 5.1 三视图设定稿

```text
二头身 Q 版小人，角色三视图设定稿：正面 / 正侧面 / 背面 并列排布在同一张画布上，
同比例、同一视角高度、脚底落在同一条水平线上。
角色设定：xx（发型 xx、发色 xx、服装 xx、配饰 xx）。
头部占总高约 50%，短圆四肢，幼态圆脸，大眼睛，表情中性自然。
透明背景（alpha 通道，无任何背景元素、无文字、无边框、无地面阴影）。
干净纤细的闭合线稿，赛璐璐平涂，一层硬阴影，低饱和柔和配色。
```

```text
white background, solid background, checkerboard pattern, ground shadow,
text, watermark, border, three different characters, different proportions between views,
dynamic pose, T-pose, action pose, motion blur,
3D render, realistic face, watercolor, thick paint, adult proportions, messy sketch lines
```

### 5.2 正面自然垂手（主形象）

```text
二头身 Q 版小人，正面平视，透明背景（alpha 通道，无任何背景元素）。
角色设定：xx（发型 xx、发色 xx、服装 xx、配饰 xx）。
头部占总高约 50%，短圆四肢，幼态圆脸。
双臂自然下垂，从躯干向外张开约 15–20 度，肘部微屈，双手略向前伸。
肩部放松不耸起，手臂与躯干之间留有清晰缝隙、不遮挡身体轮廓。
干净纤细的闭合线稿，赛璐璐平涂，一层硬阴影，低饱和柔和配色。
```

```text
white background, solid background, checkerboard pattern, ground shadow,
T-pose, arms straight out, arms crossed, arms merged with torso,
3D render, realistic face, watercolor, thick paint, adult proportions,
messy sketch lines, American cartoon eyes, gradient blending
```

### 5.3 转身序列（5 帧）

```text
同一角色，xx 视角的转身序列，5 帧横向等距排列：0°（正面）、22.5°、45°、67.5°、90°（正侧面）。
每帧均为完整全身，比例一致，头顶到脚底高度完全相同，脚底对齐同一条水平线。
角度逐帧递增，不跳步、不回摆、不重复同一视角。
角色设定：xx（发型 xx、发色 xx、服装 xx、配饰 xx）。
透明背景（alpha 通道，无背景元素、无地面阴影、无文字）。
干净纤细的闭合线稿，赛璐璐平涂，一层硬阴影，低饱和柔和配色。
```

```text
only one view, duplicated identical frames, front view repeated, inconsistent scale,
floating feet, ground shadow, background, text, watermark, motion blur,
multiple characters, T-pose, action pose, 3D render, realistic face, adult proportions
```

### 5.4 行走循环（4 帧）

```text
二维游戏行走循环，4 帧横向排列，90° 正侧视角，同一角色。
角色设定：xx（发型 xx、发色 xx、服装 xx、配饰 xx）。
步幅小、自然，重心平稳，手臂前后小幅摆动，不做大幅摆臂。
4 帧可循环闭合：第 4 帧能自然衔接第 1 帧；第 1、3 帧为接触帧，第 2、4 帧为通过帧。
每帧比例一致、脚底同线，角色朝向始终一致。
透明背景（alpha 通道，无背景元素、无地面阴影、无文字）。
干净纤细的闭合线稿，赛璐璐平涂，一层低饱和柔和阴影。
```

```text
run, sprint, jump, tilt body, motion blur, duplicated frames,
different character per frame, changing size, facing different directions,
background, ground shadow, text, watermark, 3D render, realistic face, adult proportions
```

**几句话补充：**

- 三视图和垂手正视图是刚需，直接决定后面抠图和配准的难度；转身、行走这两组是加分项，做不出来手绘补也行。
- 帧数越多越容易崩（5 帧里出现两张一模一样的视角是家常便饭）。真要序列帧，我的做法是**一帧一图 + img2img 锁形象**，别指望一次出整条序列。
- 每条正面词都要配一条负面词，尤其是 `T-pose` 和 `arms merged with torso` 这两句，少了就等着收 T 字怪。
