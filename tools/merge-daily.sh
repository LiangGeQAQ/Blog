#!/usr/bin/env bash
# 把昨天的 daily 分支合并进 main，并删除该分支（每天最多 1 次 Production 部署）。
# 用法：
#   tools/merge-daily.sh                # 默认合并「昨天」的分支 daily/YYYY-MM-DD
#   tools/merge-daily.sh daily/2026-10-30
#   tools/merge-daily.sh --list         # 只列出远端还存在的 daily 分支
# 安全：只做 --no-ff 合并 + 普通 push，不 force、不 rebase 已推送提交。
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
git fetch origin --prune

if [ "${1:-}" = "--list" ]; then
  git branch -r --list 'origin/daily/*' | sed 's#origin/##'
  exit 0
fi

branch="${1:-daily/$(date -d yesterday +%F)}"

if ! git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  echo "远端没有分支 $branch" >&2
  exit 2
fi

git checkout main
git pull --ff-only origin main
git merge --no-ff "origin/$branch" -m "merge: $branch → main"
git push origin main

# 清理：远端 + 本地
git push origin --delete "$branch"
git branch -D "$branch" 2>/dev/null || true

echo "已合并 $branch 到 main 并删除分支。Vercel 开始 Production 部署。"
