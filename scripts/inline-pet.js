'use strict';

/**
 * 把桌宠的 CSS/JS 内联进 HTML。
 * 原因：站点首屏背景图较大，外链请求 6KB 的 pet.js 也会被带宽挤到十几秒后才返回，
 * 导致桌宠迟迟不出现。内联后随 HTML 一起到达，解析即执行。
 * 占位符：<!--PET_INLINE-->（见 themes/keep/layout/_partial/head.ejs）
 */
const fs = require('fs');
const path = require('path');

const PLACEHOLDER = '<!--PET_INLINE-->';

hexo.extend.filter.register('after_render:html', function (str) {
  if (!str || str.indexOf(PLACEHOLDER) === -1) return str;

  const cssPath = path.join(hexo.source_dir, 'css', 'pet.css');
  const jsPath = path.join(hexo.source_dir, 'js', 'pet.js');
  const newsPath = path.join(hexo.source_dir, '_data', 'pet-news.json');

  let css = '';
  let js = '';
  let news = '';
  try { css = fs.readFileSync(cssPath, 'utf8'); } catch (e) { /* ignore */ }
  try { js = fs.readFileSync(jsPath, 'utf8'); } catch (e) { /* ignore */ }
  // 当日新闻：存在且格式合法才内联；缺失/损坏就让桌宠安静地不提新闻
  try {
    const raw = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
    if (raw && Array.isArray(raw.items) && raw.items.length && raw.date) {
      news = `<script id="pet-news-data">window.__PET_NEWS=${JSON.stringify({
        date: raw.date,
        items: raw.items.slice(0, 8).map((s) => String(s).slice(0, 30)),
      }).replace(/<\//g, '<\\/')}</script>\n`;
    }
  } catch (e) { /* ignore */ }

  if (!css || !js) return str;

  // 内联 script 里不能出现 </script> 字面量
  const safeJs = js.replace(/<\/script/gi, '<\\/script');

  const block = `<style id="pet-inline-css">\n${css}\n</style>\n${news}<script id="pet-inline-js">\n${safeJs}\n</script>`;
  return str.split(PLACEHOLDER).join(block);
}, 1000);
