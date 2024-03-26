#!/bin/sh
cd source/_posts/ && ./updateFileTime.js && cd .. && cd .. && git add . && git commit -m "uptate" && git push origin main
# 如果你的分支不是master记得替换
