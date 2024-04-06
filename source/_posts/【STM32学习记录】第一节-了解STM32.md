---
title: 【STM32学习记录】第一节-了解STM32
mathjax: true
date: 2022-03-10 20:45:36
tags: [STM32,C8T6,芯片结构]
updated: 2022-03-24 09:35:30categories: [STM32]
comment: true
---

+   相关说明

    本系列文章仅为个人学习记录，若有错误欢迎指出，相关的参考文章会在本文末进行列出，主要参考视频为**Blibili**[@正点原子官方](https://space.bilibili.com/394620890?from=search&seid=13393056502650554081&spm_id_from=333.337.0.0)，以及**Blibili**[@野火_firege](https://space.bilibili.com/356820657?from=search&seid=6957304932395919416&spm_id_from=333.337.0.0)。

    +   相关的可参考文件：

    [STM32 中文参考手册](http://www.stm32er.com/zb_users/upload/2021/01/202101191611046723128863.pdf)

    [STM32 选型手册 2021](https://www.stmcu.com.cn/upload/Selection_Guide.pdf)

    [STM32F103C8T6 ](https://pdf1.alldatasheetcn.com/datasheet-pdf/view/201596/STMICROELECTRONICS/STM32F103C8T6.html)

# 1.  STM32概述

## 1.1 **CM3**芯片结构

![](https://s3.bmp.ovh/imgs/2022/03/2dd63aab5ae67707.png)

上图为Cortex-M3 芯片的结构图，总的来说，内核是由**ARM**公司来设计的，

**ST**即意法半导体公司，设计开发了其他的内容。

## 1.2 STM32F103系列

![](https://s3.bmp.ovh/imgs/2022/03/47b00675cee9d26c.png)

总的来说**STM32F103**系列芯片

由**内核**、**总线**、**外设**组成；

复位和时钟控制**RCC**挂载在**AHB总线**上，

-> **驱动单元** + **被动单元**

四种驱动单元：

+   ICode
+   DCode
+   System
+   DMA

1.  **内核**通过**ICode总线**控制**外设**；

![](https://s3.bmp.ovh/imgs/2022/03/e58a15af0c523e3e.png)

2.  **DCode**为**数据总线**；

    | 存放区域 | 存放类型 |
    | :------: | :------: |
    |  Flash   |   常量   |
    |   SRAM   | 全局变量 |
    |   SRAM   | 局部变量 |

3.  **寄存器**存在于**外设**中通过**System总线**读取；

4.  **DMA总线**用于搬数据，可以使CPU内部得到通用寄存器不被占用（不使用DMA时数据从SRAM中先被CPU读取至通用寄存器中，再通过总线传输）；

## 1.3 命名规则

![](https://s3.bmp.ovh/imgs/2022/03/2a4430e84a485b9f.png)

区分32选型因素：

+   flash容量
+   引脚数量



参考网站：

[【单片机】野火STM32F103教学视频 (配套霸道/指南者/MINI)【全】(刘火良老师出品) (无字幕)_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1yW411Y7Gw)

[【正点原子】 手把手教你学STM32单片机教学视频 嵌入式 之 F103-基于新战舰V3/精英/MINI板_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Lx411Z7Qa)



<center>暂时就这样，持续更新ing...<center/>

<img src="艾米莉亚1.jpg"  width="330"  height = "450" />