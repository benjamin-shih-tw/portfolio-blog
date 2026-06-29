---
title: "live-photo-generator"
date: "2026-06-29"
description: "A Python tool to generate live photos."
type: "project"
link: "https://github.com/benjamin-shih-tw/live-photo-generator"
---

# Live Photo Generator

> 這個專案目的原本是要做到可以把一個影片丟上去以後可以變IPhone原況照片**並且可以變成動態桌布**...

## 原理

當使用者上傳一段影片以後 因為IOS的判讀機制，需要同時有一個照片檔和一個影片檔，照片檔的目的就有點像是你把它當一般圖片看的時候他的cover的概念，影片檔就是他動起來的樣子，
![圖一](/image/screenshot-1.png)
所以這是初版本的輸出，接著我們需要把它丟到iphone 上面，這邊採用AirDrop的方式，但就在我傳過去以後遇到了幾個問題

**1.如果始把整個資料夾拉過去他會導到「檔案app」上面**

**2.如果一次選取兩個之後把他拉到iphone上以後他會變成兩個獨立的檔案在「照片app」上面，依然不是我們想要的**

因此後來改換了輸出的格式
![圖一](/image/screenshot-2.png)
使用iphone原生的原況照片檔就成功了

### 關於無法變成wallpaper

其實變成wallpaper是我原本的目的，但這部分我也還沒研究完為什麼他沒辦法...

## 使用方式

就如 Readme.md 所述 啊剩下的都在底下連結的github專案中
