---
title: 利用Multisim完成李萨如图形仿真
mathjax: true
date: 2022-03-16 23:00:42
tags: [Multisim,李萨如图形]
categories: [Multisim]
comment: true
---

>   因为大物实验的课上 李萨如图形 在 *3 : 2* 时显现的图形与老师PPT上的图形有些许出入，
>   所以回来以后尝试自己用 *Multisim* 做一个仿真看看在此时 李萨如图形 到底是什么样子的。

# 李萨如图形

李萨如图形（Lissajous-Figure），亦可称为利萨茹图形，是指在<u>互相垂直的方向上</u>的两个频率成<u>简单整数比</u>的<u>简谐振动</u>所合成的<u>规则的、稳定的闭合曲线</u>。

## * 简谐运动

物体在<u>与位移成正比的恢复力作用</u>下，在其平衡位置附近<u>按正弦规律作往复的运动</u>。

以*x*表示位移，*t*表示时间，这种振动的<u>数学表达式</u>为：

$x=Asin(\omega_nt+\varphi)$，

式中$A$为位移*x*的最大值，称为**振幅**，它表示<u>振动的强度</u>，

$\omega_n$ 表示<u>每秒中的振动的辐角增量</u>，称为<u>角频率</u>，也称<u>圆频率</u>；

$\varphi$ 称为**初相位**；

以 $f=\tfrac{\omega_n}{2\pi}$ 表示每秒中振动的周数，称为**频率**；

频率的倒数，$T=\tfrac{1}{f}$ ，表示振动一周所需的时间，称为**周期**。

### * 简谐运动的三大要素

振幅$A$、频率$f$（或角频率$\omega_n$）、$\varphi$初相位，称为简谐振动三要素。

## 数学定义

李萨如曲线由以下<u>参数方程</u>定义：

$x(\theta)=asin\theta$

$y(\theta)=bsin(n\theta+\varphi)$

其中，$n\geqslant1$且$0\leqslant\varphi\leqslant\tfrac{\pi}{2}$，

n称为**曲线的参数**，是两个正弦振动的<u>频率比</u>。

若比例为<u>有理数</u>，则$n=\tfrac{q}{p}$，参数方程可以写作：

$x(\theta)=asin(p\theta)$

$y(\theta)=bsin(q\theta+\varphi)$

$0\leqslant\varphi\leqslant2\pi$

## 通过李萨如图形得出频率比值

当用 “*X-Y*” 方式，即 “ $Y_1$ 位移” 拉出，进入这一方式，

此时，$Y_1$ 通道为 *X* 输入端，$Y_2$ 通道为 *Y* 输入端，当从 *X/Y* 这两个输入端<u>输入正弦信号</u>时，在示波管荧光屏上可显示出李萨如图形，根据图形可以<u>推算出两个信号之间的频率及相位关系</u>。

根据如下方程我们可以得出 *X* 与 *Y* 两个正弦信号的频率关系：

$\tfrac{X方向切线对图形的切点数N_X}{Y方向切线对图形的切点数N_Y}=\tfrac{f_y}{f_x}$

## Multisim中绘制李萨如图形

>   **Multisim** 中的<u>虚拟信号发生器</u>是不能够调节相位的，但是使用<u>交流信号源</u>代替信号发生器，就可以在设置中调整相位差。

所以我们选择左上角的放置元件，

在 “**POWER_SOURCES**” 一栏中拉取两个 “**AC_POWER**” 放置，

并拉取三个 “**DGND**” 放置，

从右侧栏中选择示波器，

如下图放置，

![](https://s3.bmp.ovh/imgs/2022/03/484445f75cfe9340.png)

之后我们可以根据自己的需要调整 电压值、频率、相位差等数参数进行仿真实验。

右上角 进行仿真 <u>双击示波器查看生成的李萨如图形</u>，

下面列出常见的李萨如图形表（使用 *Multisim* 绘制），

![](https://s3.bmp.ovh/imgs/2022/03/8187183a08e2f6ac.png)





[利萨如图形_百度百科 (baidu.com)](https://baike.baidu.com/item/%E5%88%A9%E8%90%A8%E5%A6%82%E5%9B%BE%E5%BD%A2/10517125)

[简谐运动_百度百科 (baidu.com)](https://baike.baidu.com/item/%E7%AE%80%E8%B0%90%E8%BF%90%E5%8A%A8/1101010)

[在multisim中，如何产生李萨如图形，我没找到相位调节的地方_百度知道 (baidu.com)](https://zhidao.baidu.com/question/1796430360334163547.html)

<div align = "center"><img src="emt.png"/></div>

