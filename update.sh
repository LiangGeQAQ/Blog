#!/bin/sh
time=$(date "+%Y/%m/%d")
cd source/_posts/ && ./updateFileTime.js && cd .. && cd .. && git add . && git commit -m "$time" && git push origin main
echo Update $time
# 如果你的分支不是master记得替换
