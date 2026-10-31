#!/usr/bin/env bash
# 建/切到「按天」工作分支：daily/YYYY-MM-DD
# 用法：
#   tools/daily-branch.sh            # 用今天的日期
#   tools/daily-branch.sh 2026-10-30 # 指定日期
# 说明：分支推上去只会触发 Vercel 的 Preview 部署，不产生 Production 部署。
set -euo pipefail

day="${1:-$(date +%F)}"
branch="daily/$day"

cd "$(git rev-parse --show-toplevel)"
git fetch origin --prune

if git show-ref --verify --quiet "refs/heads/$branch"; then
  git checkout "$branch"
elif git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  git checkout -b "$branch" "origin/$branch"
else
  # 从最新的 main 起一条干净分支
  git checkout main
  git pull --ff-only origin main
  git checkout -b "$branch"
fi

echo "当前分支：$(git branch --show-current)"
echo "提示：改完用 tools/push-daily.sh 提交并推送（只产生 Preview 部署）。"
