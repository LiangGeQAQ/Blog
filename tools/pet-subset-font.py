#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重建桌宠气泡字体子集（ZCOOL KuaiLe, OFL-1.1）。

台词在 source/js/pet.js 的 LINES_* 数组里，当日新闻在 source/_data/pet-news.json 里；
两者任意一个改了字符集就可能变大，所以每次改文案/换新闻都跑一遍本脚本：

    python3 tools/pet-subset-font.py

行为：
  1. 收集 pet.js 里所有台词字符串 + pet-news.json 的 items
  2. 用 Google Fonts 的 text= 参数取子集 woff2
  3. 写入 source/font/pet-bubble-vN.woff2（N 自增），并同步改写 source/css/pet.css
  4. 校验字符覆盖，缺字直接非 0 退出

依赖：requests 可省（用 urllib），fontTools + brotli 仅用于校验（有则校验，无则跳过）。
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PET_JS = os.path.join(ROOT, 'source', 'js', 'pet.js')
NEWS = os.path.join(ROOT, 'source', '_data', 'pet-news.json')
CSS = os.path.join(ROOT, 'source', 'css', 'pet.css')
FONT_DIR = os.path.join(ROOT, 'source', 'font')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')


def collect_chars():
    src = open(PET_JS, encoding='utf-8').read()
    blocks = re.findall(r"var LINES_[A-Z0-9_]+ = \[(.*?)\n  \];", src, re.S)
    texts = []
    for b in blocks:
        texts += re.findall(r"'((?:[^'\\]|\\.)*)'", b)
    try:
        news = json.load(open(NEWS, encoding='utf-8'))
        texts += [str(x) for x in news.get('items', [])]
        texts.append('今日要闻：')
    except Exception:
        pass
    chars = ''.join(dict.fromkeys(''.join(t.replace('\\n', '') for t in texts)))
    return chars


def fetch_subset(chars):
    url = ('https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&text='
           + urllib.parse.quote(chars))
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    css = urllib.request.urlopen(req, timeout=30).read().decode()
    m = re.findall(r"url\((https://[^)]+)\)", css)
    if not m:
        raise RuntimeError('Google Fonts 没返回字体地址，检查网络或 text 参数')
    return urllib.request.urlopen(m[-1], timeout=30).read()


def current_version():
    css = open(CSS, encoding='utf-8').read()
    m = re.search(r'pet-bubble-v(\d+)\.woff2', css)
    return int(m.group(1)) if m else 0


def main():
    chars = collect_chars()
    ver = current_version() + 1
    out = os.path.join(FONT_DIR, 'pet-bubble-v%d.woff2' % ver)
    data = fetch_subset(chars)
    with open(out, 'wb') as f:
        f.write(data)

    css = open(CSS, encoding='utf-8').read()
    css = re.sub(r'pet-bubble-v\d+\.woff2', 'pet-bubble-v%d.woff2' % ver, css)
    open(CSS, 'w', encoding='utf-8').write(css)

    print('字体: %s (%d KB), %d 个字符' % (os.path.relpath(out, ROOT), len(data) // 1024, len(chars)))

    # 覆盖率校验（可选）
    try:
        from fontTools.ttLib import TTFont
        cmap = TTFont(out).getBestCmap()
        miss = [c for c in chars if ord(c) not in cmap]
        if miss:
            print('缺字:', ''.join(miss))
            return 1
        print('覆盖校验: %d/%d 通过' % (len(chars), len(chars)))
    except ImportError:
        print('（未装 fontTools/brotli，跳过覆盖校验）')
    return 0


if __name__ == '__main__':
    sys.exit(main())
