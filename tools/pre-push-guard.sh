#!/usr/bin/env bash
# 博客仓库推送前安全检查（安装为 .git/hooks/pre-push 后每次 push 自动执行）
# 规则来源：BLOG_GUIDE.md「安全红线」
#   1) 禁止 node_modules / public / db.json / .env 等构建产物与配置入库
#   2) 禁止任何音视频文件入库（本机私有媒体）
#   3) 图片只允许出现在 source/_posts/** 文章资源目录，且单文件 <= 5MB
#   4) 禁止疑似密钥 / 私钥 / 身份证号 / 手机号
# 用法：手动检查  bash tools/pre-push-guard.sh --staged

set -u
BASE="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
cd "$BASE" || exit 0

MODE="${1:---staged}"
if [ "$MODE" = "--staged" ]; then
  RANGE="--cached"
  FILES="$(git diff --cached --name-only --diff-filter=ACMR)"
else
  # pre-push: 检查即将推送的提交范围
  remote="$1"; url="$2"
  while read -r local_ref local_sha remote_ref remote_sha; do
    if [ "$remote_sha" = "0000000000000000000000000000000000000000" ]; then
      git rev-list "$local_sha" --not --remotes=origin 2>/dev/null
    else
      git rev-list "$remote_sha..$local_sha" 2>/dev/null
    fi
  done | sort -u | while read -r sha; do
    git show --name-only --pretty=format: "$sha"
  done | sort -u > /tmp/blog_push_files.$$
  FILES="$(cat /tmp/blog_push_files.$$ 2>/dev/null)"
  rm -f /tmp/blog_push_files.$$
fi
[ -z "${FILES:-}" ] && exit 0

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
        source/_posts/*) ;;
        *) err "图片只能放在 source/_posts/<文章名>/ 下：$f" ;;
      esac
      if [ -f "$f" ]; then
        size=$(wc -c < "$f" 2>/dev/null || echo 0)
        [ "$size" -gt 5242880 ] && err "图片超过 5MB：$f ($((size/1024))KB)"
      fi ;;
  esac
done <<< "$FILES"

# 内容级密钥扫描（仅检查新增行）
SECRET_RE='(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[0-9]{17}[0-9Xx])'
# 排除本脚本自身（含正则样例会自我命中）
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
