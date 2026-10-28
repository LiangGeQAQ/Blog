'use strict';

/**
 * 为文章/页面里的图片补 loading="lazy" 与 decoding="async"，
 * 避免一进文章就把几十 MB 图片全部拉下来。
 * 跳过：页头 logo（首屏 LCP 元素）、站宠 SVG、data URI。
 */
const SKIP = [/\/images\/logo\./, /\/images\/pet\//, /^data:/];

hexo.extend.filter.register('after_render:html', function (str) {
  if (!str || str.indexOf('<img') === -1) return str;

  return str.replace(/<img\b([^>]*)>/g, function (whole, attrs) {
    if (/\bloading\s*=/.test(attrs)) return whole;
    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/);
    if (srcMatch && SKIP.some(re => re.test(srcMatch[1]))) return whole;
    return `<img loading="lazy" decoding="async"${attrs}>`;
  });
}, 900);
