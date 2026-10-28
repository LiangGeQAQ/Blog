#!/usr/bin/env bash
# 博客仓库推送前安全检查（安装为 .git/hooks/pre-push 后每次 push 自动执行）
# 规则来源：BLOG_GUIDE.md「安全红线」
#   1) 禁止 node_modules / public / db.json / .env 等构建产物与配置入库
#   2) 禁止任何音视频文件入库（本机私有媒体）
#   3) 图片只允许出现在 source/_posts/** 文章资源目录，且单文件 <= 5MB
#   4) 禁止疑似密钥 / 私钥 / 身份证号
# 用法：手动检查  bash tools/pre-push-guard.sh --staged

set -u
BASE="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
cd "$BASE" || exit 0

MODE="${1:---staged}"
TMPF="$(mktemp)"
trap 'rm -f "$TMPF"' EXIT

collect_staged() {
  git diff --cached --name-only --diff-filter=ACMR
}

# pre-push 模式：只检查本次推送「新增/修改/重命名」的最终状态文件，
# 不追究历史提交里已被删除的文件（否则清理类提交无法推送）
collect_push() {
  while read -r local_ref local_sha remote_ref remote_sha; do
    [ -z "${local_sha:-}" ] && continue
    case "$local_sha" in *[!0]*) ;; *) continue ;; esac
    if [ "${remote_sha:-}" = "0000000000000000000000000000000000000000" ] || [ -z "${remote_sha:-}" ]; then
      git diff --name-only --diff-filter=ACMR "$(git merge-base "$local_sha" origin/main 2>/dev/null || echo "$local_sha^")" "$local_sha" 2>/dev/null
    else
      git diff --name-only --diff-filter=ACMR "$remote_sha" "$local_sha" 2>/dev/null
    fi
  done
}

if [ "$MODE" = "--staged" ]; then
  collect_staged > "$TMPF"
else
  collect_push > "$TMPF"
fi

FILES="$(cat "$TMPF" 2>/dev/null)"
[ -z "${FILES:-}" ] && { echo "✅ 安全检查通过（无待检查文件）"; exit 0; }

fail=0
err() { echo "❌ $*"; fail=1; }

while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    node_modules/*|public/*|db.json|.env|.env.*|.deploy*/*)
      err "禁止入库的构建产物/配置：$f" ;;
  esac

  ext="${f##*.}"; ext="$(echo "$ext" | tr 'A-Z' 'a-z')"
  case "$ext" in
    mp4|mov|mkv|avi|wmv|flv|webm|m4v|mp3|m4a|wav|flac)
      err "禁止入库的音视频文件：$f" ;;
  esac
  case "$ext" in
    jpg|jpeg|png|gif|webp|bmp|tif|tiff)
      case "$f" in
        source/_posts/*|source/images/*|themes/*/source/images/*) ;;
        *) err "图片只能放在 source/_posts/<文章名>/、source/images/ 或主题 source/images/ 下：$f" ;;
      esac
      ;;
  esac
done <<< "$FILES"

# 大文件检查：仅限制「新增」的大文件；历史遗留资产（如演示 GIF）允许留存
while IFS= read -r f; do
  [ -f "$f" ] || continue
  # 已存在于 HEAD 的文件视为历史资产，跳过体积限制
  if git cat-file -e "HEAD:${f}" 2>/dev/null; then continue; fi
  size=$(wc -c < "$f" 2>/dev/null || echo 0)
  [ "$size" -gt 5242880 ] && err "新增文件超过 5MB：$f ($((size/1024))KB)"
done <<< "$FILES"

# 内容级密钥扫描（检查新增行；排除本脚本自身）
SECRET_RE='(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[0-9]{17}[0-9Xx])'
if git diff --cached -U0 -- . ':(exclude)tools/pre-push-guard.sh' 2>/dev/null \
     | grep -E '^\+' | grep -Ev '^\+\+\+' | grep -Eq "$SECRET_RE"; then
  err "提交内容疑似包含密钥/私钥/身份证号，请检查后再提交"
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "推送已拦截。若确认是误报，可用 git push --no-verify（不推荐），或先修正/移动文件。"
  exit 1
fi
echo "✅ 安全检查通过"
exit 0
