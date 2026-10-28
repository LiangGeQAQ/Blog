#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""规范化 Hexo 文章 front-matter：
1. 修正 `key:value` 缺空格
2. 标签统一大小写（c -> C，c++ 保持 C++）
3. 缺失 description 时从正文首段自动摘要（<=80 字）
只改动必要的行，保持其余原样。
用法: python3 scripts/normalize_frontmatter.py [--dry]
"""
import glob
import re
import sys

DRY = '--dry' in sys.argv
KEYS = ('title', 'date', 'updated', 'tags', 'categories', 'comment', 'mathjax', 'description')


def strip_md(p: str) -> str:
    p = re.sub(r'```.*?```', '', p, flags=re.S)
    p = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', p)
    p = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', p)
    p = re.sub(r'<[^>]+>', '', p)
    p = re.sub(r'^[>#\-\*\d\.\s]+', '', p, flags=re.M)
    p = re.sub(r'[\*_`]', '', p)
    return re.sub(r'\s+', ' ', p).strip()


def first_paragraph(body: str) -> str:
    for block in re.split(r'\n\s*\n', body):
        stripped = block.strip()
        if not stripped:
            continue
        # 跳过纯标题块 / 纯图片块 / 纯代码块
        if stripped.startswith('#') and '\n' not in stripped:
            continue
        if re.fullmatch(r'(!\[[^\]]*\]\([^)]*\)\s*)+', stripped):
            continue
        if stripped.startswith('```'):
            continue
        t = strip_md(block)
        if len(t) >= 20 and not re.match(r'^[=\-\s]+$', t):
            return t
    return ''


def yaml_escape(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"')


def norm_tag(t: str) -> str:
    t = t.strip()
    if t.lower() == 'c':
        return 'C'
    if t.lower() == 'c++':
        return 'C++'
    return t


def split_list(raw: str):
    raw = raw.strip().strip('[]')
    if not raw:
        return []
    return [x.strip().strip('\'"') for x in raw.split(',') if x.strip()]


changed = []
for path in sorted(glob.glob('source/_posts/*.md')):
    src = open(path, encoding='utf-8').read()
    m = re.match(r'^---\r?\n(.*?)\r?\n---\r?\n?(.*)$', src, re.S)
    if not m:
        continue
    fm, body = m.group(1), m.group(2)
    lines = fm.split('\n')
    out = []
    has_desc = any(re.match(r'^\s*description\s*:', l) for l in lines)
    for line in lines:
        lm = re.match(r'^(\s*)([A-Za-z_]+):(.*)$', line)
        if lm and lm.group(2) in KEYS:
            key, val = lm.group(2), lm.group(3)
            if val and not val.startswith(' '):
                line = f'{lm.group(1)}{key}: {val}'
            if key in ('tags', 'categories'):
                items = [norm_tag(x) for x in split_list(val)]
                if items:
                    line = f'{key}: [{", ".join(items)}]'
        out.append(line)

    if not has_desc:
        desc = first_paragraph(body)
        if desc:
            if len(desc) > 80:
                desc = desc[:79].rstrip() + '…'
            # 作为最后一个字段插入，保持原有顺序稳定
            out.append(f'description: "{yaml_escape(desc)}"')

    new_fm = '\n'.join(out)
    if new_fm != fm:
        changed.append(path)
        if not DRY:
            open(path, 'w', encoding='utf-8').write(f'---\n{new_fm}\n---\n{body}')

print(f'{"[dry] " if DRY else ""}changed {len(changed)} posts')
for p in changed[:50]:
    print(' -', p)
