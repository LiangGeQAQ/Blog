#!/usr/bin/env bash
# 把指定文件提交并推到当前 daily 分支（只触发 Preview 部署）。
# 用法：
#   tools/push-daily.sh -m "post: 新增《xxx》" source/_posts/xxx.md source/_posts/xxx/
#   tools/push-daily.sh -m "edit: 压缩素材"            # 不加文件 = 用 git add -u（已跟踪文件的改动）
# 注意：
#   - 必须在 daily/* 分支上运行（在 main 上直接跑会被拒绝，避免又造 Production 部署）
#   - 提交前会跑 tools/pre-push-guard.sh
set -euo pipefail

msg=""
files=()
while [ $# -gt 0 ]; do
  case "$1" in
    -m|--message) msg="${2:-}"; shift 2 ;;
    *) files+=("$1"); shift ;;
  esac
done

[ -n "$msg" ] || { echo "缺少提交信息：-m \"post: ...\"" >&2; exit 2; }

cd "$(git rev-parse --show-toplevel)"
branch="$(git branch --show-current)"
case "$branch" in
  daily/*) ;;
  *) echo "当前在 $branch，请在 daily/YYYY-MM-DD 分支上提交（用 tools/daily-branch.sh 创建）。" >&2; exit 2 ;;
esac

if [ ${#files[@]} -gt 0 ]; then
  git add -- "${files[@]}"
else
  git add -u
fi

bash tools/pre-push-guard.sh --staged
git commit -m "$msg"
git push -u origin "$branch"
echo "已推送到 $branch（Vercel 会生成 Preview 部署，不进 Production）。"
