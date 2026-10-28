#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""布局体检：用真实浏览器量盒，抓“肉眼才能发现”的样式事故。

检查项
  1. 横向溢出：页面 scrollWidth > 视口宽度（移动端最常见）
  2. 文本被裁切：元素 overflow 隐藏且内容高度/宽度超出（例如字号变大后半行字消失）
  3. 关键元素重叠：友链卡片的头像与名称/简介、导航菜单项互相压盖
  4. 关键元素缺失或尺寸为 0

依赖：chromium + websocket-client (pip3 install websocket-client)
用法：
  cd /root/work/blog && node node_modules/hexo-cli/bin/hexo generate
  python3 tools/layout-check.py                       # 起本地服务并检查默认页面
  python3 tools/layout-check.py --base https://www.liliaw.com   # 体检线上
  python3 tools/layout-check.py --widths 1440,1024,390
退出码：0 通过；1 发现问题。
"""
import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request

try:
    import websocket  # websocket-client
except ImportError:
    sys.exit("缺少依赖：pip3 install websocket-client")

DEFAULT_PAGES = ["/", "/archives/", "/categories/", "/tags/", "/links/", "/about/"]
WIDTHS = [1440, 1024, 390]

JS = r"""
(() => {
  const issues = [];
  const seen = new Set();
  const vw = window.innerWidth;

  // 1) 横向溢出
  const de = document.documentElement;
  if (de.scrollWidth > vw + 2) {
    issues.push({type: 'overflow-x', detail: `scrollWidth=${de.scrollWidth} > viewport=${vw}`});
  }

  const hasText = el => (el.textContent || '').trim().length > 0;

  // 2) 被裁切的文本：overflow 隐藏 + 内容超框 + 确实有文字
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const clipY = cs.overflowY === 'hidden' && el.scrollHeight > el.clientHeight + 2;
    const intentionalEllipsis = cs.textOverflow === 'ellipsis';
    const clipX = !intentionalEllipsis && cs.overflowX === 'hidden' && el.scrollWidth > el.clientWidth + 2;
    if (!(clipY || clipX)) return;
    if (!hasText(el) && el.children.length === 0) return;
    if (el.clientHeight < 6 || el.clientWidth < 6) return;
    const cls = (el.className && el.className.toString().slice(0, 60)) || el.tagName;
    const key = cls + '|' + (clipY ? 'y' : '') + (clipX ? 'x' : '');
    if (seen.has(key)) return;
    seen.add(key);
    issues.push({
      type: 'clipped',
      element: cls,
      detail: `scroll=${el.scrollWidth}x${el.scrollHeight} client=${el.clientWidth}x${el.clientHeight}`,
      text: (el.textContent || '').trim().slice(0, 40)
    });
  });

  // 3) 重叠检测：同一张友链卡片内，头像不应压住名称/简介
  document.querySelectorAll('.friends-link-item').forEach((item, i) => {
    const a = item.querySelector('.avatar');
    const t = item.querySelector('.name');
    const d = item.querySelector('.description');
    const box = e => e ? e.getBoundingClientRect() : null;
    const ba = box(a), bt = box(t), bd = box(d);
    if (ba && bt && ba.right > bt.left + 1) {
      issues.push({type: 'overlap', element: 'friends-link#%d avatar/name'.replace('%d', i),
                   detail: `avatar.right=${Math.round(ba.right)} name.left=${Math.round(bt.left)}`});
    }
    if (ba && bd && ba.right > bd.left + 1) {
      issues.push({type: 'overlap', element: 'friends-link#%d avatar/desc'.replace('%d', i),
                   detail: `avatar.right=${Math.round(ba.right)} desc.left=${Math.round(bd.left)}`});
    }
    if (bt && bd && bt.bottom > bd.top + 2) {
      issues.push({type: 'overlap', element: 'friends-link#%d name/desc'.replace('%d', i),
                   detail: `name.bottom=${Math.round(bt.bottom)} desc.top=${Math.round(bd.top)}`});
    }
  });

  // 4) 导航菜单项不该互相压盖
  const items = [...document.querySelectorAll('.menu-list .menu-item')].map(e => e.getBoundingClientRect());
  for (let i = 1; i < items.length; i++) {
    if (items[i].left < items[i-1].right - 1 && items[i].bottom > items[i-1].top + 1) {
      issues.push({type: 'overlap', element: 'menu-item#' + i, detail: 'nav items overlap'});
      break;
    }
  }

  // 5) 关键元素存在性/尺寸
  const required = {
    '/': ['.home-article-item', '.header-wrapper'],
    '/links/': ['.friends-link-item'],
    '/categories/': ['.all-category-list-item'],
    '/tags/': ['.tag-hot-item, .tag-index-item']
  };
  const path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
  (required[path] || []).forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) issues.push({type: 'missing', element: sel, detail: 'not found'});
    else {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) issues.push({type: 'zero-size', element: sel, detail: `${Math.round(r.width)}x${Math.round(r.height)}`});
    }
  });

  return JSON.stringify(issues);
})()
"""


def free_port():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def http_get(url, timeout=5):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.load(r)


def cdp(ws, seq):
    def send(method, params=None):
        seq[0] += 1
        ws.send(json.dumps({"id": seq[0], "method": method, "params": params or {}}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == seq[0]:
                return m
    return send


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="", help="站点根地址；留空则起本地静态服务")
    ap.add_argument("--pages", default="", help="逗号分隔路径，默认常用页")
    ap.add_argument("--widths", default=",".join(map(str, WIDTHS)))
    args = ap.parse_args()

    pages = [p.strip() for p in args.pages.split(",") if p.strip()] or DEFAULT_PAGES
    widths = [int(w) for w in args.widths.split(",") if w.strip()]

    server = None
    base = args.base.rstrip("/")
    if not base:
        root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
        if not os.path.isdir(root):
            sys.exit("找不到 public/，先跑 hexo generate")
        port = free_port()
        server = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
                                  cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        base = f"http://127.0.0.1:{port}"
        time.sleep(1.5)

    chrome = None
    issues_total = 0
    try:
        port = free_port()
        bin_name = shutil.which("chromium") or shutil.which("chromium-browser") or shutil.which("google-chrome")
        if not bin_name:
            sys.exit("找不到 chromium")
        chrome = subprocess.Popen(
            [bin_name, "--headless=new", "--no-sandbox", "--disable-gpu",
             f"--remote-debugging-port={port}", "--remote-allow-origins=*",
             "--window-size=1440,900", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(40):
            try:
                http_get(f"http://127.0.0.1:{port}/json/version", 1)
                break
            except Exception:
                time.sleep(0.3)
        targets = http_get(f"http://127.0.0.1:{port}/json")
        page = [t for t in targets if t["type"] == "page"][0]
        ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=180)
        seq = [0]
        send = cdp(ws, seq)
        send("Page.enable")

        for w in widths:
            send("Emulation.setDeviceMetricsOverride",
                 {"width": w, "height": 900, "deviceScaleFactor": 1, "mobile": w < 500})
            for path in pages:
                url = base + path
                send("Page.navigate", {"url": url})
                # 等待真正加载完成（线上站点比本地慢）
                for _ in range(30):
                    st = send("Runtime.evaluate", {"expression": "document.readyState", "returnByValue": True})
                    if st.get("result", {}).get("result", {}).get("value") == "complete":
                        break
                    time.sleep(0.5)
                time.sleep(0.5)
                r = send("Runtime.evaluate", {"expression": JS, "returnByValue": True})
                raw = r.get("result", {}).get("result", {}).get("value")
                issues = json.loads(raw) if raw else []
                if issues:
                    issues_total += len(issues)
                    print(f"\n❌ [{w}px] {path} -> {len(issues)} 个问题")
                    for it in issues:
                        print(f"   - {it['type']}: {it.get('element','')} | {it.get('detail','')}"
                              + (f" | text={it.get('text')!r}" if it.get("text") else ""))
                else:
                    print(f"✅ [{w}px] {path}")
        ws.close()
    finally:
        if chrome:
            chrome.terminate()
        if server:
            server.terminate()

    print("\n" + ("全部通过" if issues_total == 0 else f"共 {issues_total} 个问题"))
    sys.exit(0 if issues_total == 0 else 1)


if __name__ == "__main__":
    main()
