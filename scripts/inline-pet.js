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

  let css = '';
  let js = '';
  try { css = fs.readFileSync(cssPath, 'utf8'); } catch (e) { /* ignore */ }
  try { js = fs.readFileSync(jsPath, 'utf8'); } catch (e) { /* ignore */ }

  if (!css || !js) return str;

  // 内联 script 里不能出现 </script> 字面量
  const safeJs = js.replace(/<\/script/gi, '<\\/script');

  const block = `<style id="pet-inline-css">\n${css}\n</style>\n<script id="pet-inline-js">\n${safeJs}\n</script>`;
  return str.split(PLACEHOLDER).join(block);
}, 1000);
