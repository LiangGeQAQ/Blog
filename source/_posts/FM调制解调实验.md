---
title: FM调制解调实验
mathjax: true
date: 2022-07-17 21:54:47
tags: [GNU Radio,FM,WBFM,NBFM,HackRF]
categories: [FM]
comment: true
---

# GNU radio FM调制解调实验

## 1. 实验原理

### 1.1 角度调制基本概念

​	正弦载波有三个参量：**幅度**、**频率**、**相位**。

​	不仅可以把调制信号的信息载荷于载波的幅度变化中，还可以载荷于载波的频率或相位中。在调制中，**若载波的频率随调制信号变化**，称为**频率调制**或**调频FM**；**若载波的相位随调制信号变化**，则称为**相位调制**或**调相PM**。

​	在这两种调制过程中，载波的**幅度都保持恒定不变**，而**载波的频率和相位的变化都表现为载波的瞬时相位的变化**，因此把调频和调相统称为角度调制或调角。如图1（图源：[基带、射频，到底是干什么用的？-面包板社区 (eet-china.com)](https://www.eet-china.com/mp/a15415.html)）

​	角度调制与幅度调制不同的是，已调信号频谱不再是原调制信号频谱的线性搬移，而是频谱的**非线性变换**，会产生与频谱搬移不同的信道频率成分，故**角度调制又称为非线性调制**。

​	**角度调制分为频率调制FM和相位调制PM**，即载波的**幅度保持不变**，而**载波的频率或相位随着基带调制信号变化的调制方式**。如果**载波的频率变化量与调制信号电压成正比**，则称为**调频FM**，如果**载波的相位变化量与调制信号电压成正比**，则称为**调相PM**。如表1所示。

<div align = "center">表1 角度调制</div>

| 角度调制 | 某变化量与调制信号电压成正比 |
| :------: | :--------------------------: |
|  调频FM  |       载波的频率变化量       |
|  调相PM  |       载波的相位变化量       |

![角度调频](基本调制方式.png)

<div align = "center">图1 基本调制方式</div>

​	角度调制的一般原理公式如下所示：
$$
s(t)=Acos[\omega_ct+\varphi(t)]
$$
​	其中，$\omega_ct+\varphi(t)$**为已调信号的瞬时相位**，记为$\theta(t)$，$\varphi(t)$**为已调信号相对于载波相位**$\omega_ct$**的瞬时相位偏移**，$\dfrac{d[\omega_ct+\varphi(t)]}{dt}=\omega_c+\dfrac{d\varphi(t)}{dt}$**为已调信号的瞬时角频率**，记为$\omega(t)$，$\dfrac{d\varphi(t)}{dt}$为**已调信号相对于载波频率**$\omega_c$**的瞬时角频率偏移**（瞬时频偏）。（瞬时相位指的是，当前时刻投影所在的以弧度表示的位置）

​	相位调制PM，是指**瞬时相位偏移** $\varphi(t)$ **随调制信号** $m(t)$ **做线性变化**，即
$$
\varphi(t)=K_{PM}·m(t)
$$
​	其中，$K_{PM}$**是调相灵敏度**，含义是**单位调制信号幅度引起PM信号的相位偏移量**，则调相已调信号为：
$$
S_{PM}(t)=Acos[\omega_ct+K_{PM}m(t)]
$$
​	频率调制FM，是指**瞬时频率偏移**$\dfrac{d\varphi(t)}{dt}$**随调制信号$m(t)$做线性变化**，即
$$
\dfrac{d\varphi(t)}{dt}=K_{FM}·m(t)
$$
​	其中，$K_{FM}$为**频率偏移系数**。则此时，相位偏移$\varphi(t)=K_{FM} \lmoustache m(\tau)d\tau$。调频的已调信号可表示为：
$$
S_{PM}(t)=Acos[\omega_ct+K_{FM}\lmoustache m(\tau)d\tau]
$$

​	由此可知，PM和FM的区别仅在于，**PM是相位偏移随**$\varphi(t)$**随调制信号**$m(t)$**线性变化**，**FM是相位偏移随**$m(t)$**的积分呈线性变化**。如果预先不知道调制信号$m(t)$的具体形式，则无法判断已调信号是调相信号，还是调频信号。

### 1.2 单音调制FM与PM

​	假设调制信号为单一频率的余弦波，即
$$
m(t)=Acos\omega_mt=Acos2\pi f_mt
$$
​	当用该调制信号来进行相位调制PM时，PM已调信号为：
$$
\begin{equation*} 
	\begin{split}
S_{PM}(t)
& = Acps[\omega_ct+K_{PM}m(t)]\newline
& = Acos[\omega_ct+m_{PM}cos\omega_mt]\newline
	\end{split}
\end{equation*}
$$

​	其中，$m_{PM}=K_{PM}A$ **称为调相指数**，表示最大的相位偏移。

​	当用该调制信号来进行频率调制FM时，FM已调信号为：
$$
\begin{split}
S_{FM}(t)
& = Acos[\omega_ct+K_{FM}A\lmoustache cos\omega_mt dt]\newline
& = Acos[\omega_ct+m_{FM}sin\omega_mt]
\end{split}
$$
​	其中，$m_{FM}=\dfrac{K_{FM}A}{\omega_m}=\dfrac{\Delta\omega}{\omega_m}=\dfrac{\Delta f}{f_m}$ **称为调频指数**，表示最大的相位偏移。$\Delta\omega$为最大角频偏，$\Delta f$为最大频偏，瞬时相位偏移$\varphi(t)=m_{FM}sin\omega_mt$。

### 1.3 单频FM解调

​	调制信号为$m(t)=A_mcos\omega_mt=A_mcos2\pi f_mt$，数字FM解调器的输入是IQ信号（IQ信号代表In-Phase Quadrature，即代表**两路相位相差90度的信号**），FM已调信号表达式为：
$$
\begin{split}
S_{FM}(t)
& = Acos[\omega_ct+K_{FM}A_m\lmoustache cos \omega_m\tau d \tau]\newline
& = Acos[\omega_ct+m_{FM}sin\omega_mt]
\end{split}
$$
​	设定$I(t)=Acos(m_{FM}sin\omega_mt),Q(t)=Asin(m_{FM}sin\omega_mt)$。

​	则由FM表达式可得，
$$
S_{FM}(t)=Re\{[I(t)+jQ(t)]·e^{j\omega_ct}\}=Re\{\tilde{s}(t)·e^{j\omega_ct}\}
$$
​	证明：
$$
\begin{aligned}
&注:设复数x=a+bi，Re[x]=a,即取实部操作\newline
&将I(t),Q(t)代回原式，有\newline
&S_{FM}(t)=Re\\{[Acos(m_{FM}sin\omega_mt)+jAsin(m_{FM}sin\omega_mt)]·e^{j\omega_ct}\\}\\
&由欧拉公式e^{ix}=cosx+sinx\newline
&e^{j\omega_ct}=cos(\omega_ct)+jsin(\omega_ct)\newline
&令a=Acos(m_{FM}sin\omega_mt)\newline
&b=Asin(m_{FM}sin\omega_mt)\newline
&c=cos(\omega_ct)\newline
&d=sin(\omega_ct)\newline
&(a+bj)(c+dj)=ac+adj+bcj+bdj^2\newline
&\therefore Re[(a+bj)(c+dj)]=ac-bd\newline
&令m_{FMsin\omega_mt}=\alpha,\omega_ct=\beta\newline
&由cos(a+b)=cosacosb-sinasinb可得\newline
&Acos(m_{FM}sin\omega_mt)c=cos(\omega_ct)-Asin(m_{FM}sin\omega_mt)sin(\omega_ct)=Acos[m_{FM}sin\omega_mt+\omega_ct]\newline
&\therefore S_{FM}(t)=Re\\{[I(t)+jQ(t)]·e^{j\omega_ct}\\}\newline
&证毕\newline
\end{aligned}
$$
​	其中，$\tilde{s}(t)=I(t)+jQ(t)=A·e^{j\varphi(t)},\varphi(t)=m_{FM}sin\omega_mt$。

​	调制信号 $m(t)=A_mcos\omega_mt=A_mcos2\pi f_mt$  可以通过以下公式得到，
$$
m(t)=k^{-1}·arg[\tilde{s}(t-1)·\tilde{s^*}(t)],*表示共轭运算
$$
​	注：arg表示复数的幅角，若$x=r(cos\theta+isin\theta)，\theta=arg(x)$

​	其中，$(t-1)\rightarrow z^{-1}$表示一个采样延迟。
$$
\begin{split}
arg[\tilde{s}(t-1)·\tilde{s^*}(t)]
&=arg[a(t-1)e^{j\varphi(t-1)}·a(t)e^{-j\varphi(t)}]\newline
&=\varphi(t-1)-\varphi(t)\newline
& \approx\dfrac{d\varphi}{dt}\newline
& =\dfrac{d(m_{FM}sin\omega_mt)}{dt}\newline
& =m_{FM}·\omega_mcos\omega_mt\newline
& =2\pi f_m·m_{FM}cos\omega_mt\newline
& =2\pi f_m·m_{FM}\dfrac{m(t)}{A_m}
\end{split}
$$
​	注：在$arg[\tilde{s}(t-1)·\tilde{s^*}(t)]$与调制信号$m(t)$之间有一个转换系数$k=\dfrac{2\pi f_m·m_{FM}}{A_m}$

### 1.4 窄带FM(NBFM)

$$
S_{FM}(t)=Acos[\omega_ct+K_{FM}\lmoustache m(\tau)d\tau]
$$

​	如果上述FM调制公式中的**最大瞬时相位偏移**$\varphi(t)=K_{FM}\lmoustache m(\tau)d\tau$**满足以下条件：**
$$
\varphi(t)=K_{FM}\lmoustache m(\tau)d\tau \ll \dfrac{\pi}{6}或0.5
$$
​	**则FM信号的频谱宽度比较窄，称为窄带调频(NBFM)，而当最大瞬时相位偏移不满足上述条件是，FM信号的频谱带比较宽，称为宽带调频(WBFM)。**

​	NBFM 和 WBFM 最大的区别**是最大瞬时相位偏移不同**。

​	NBFM 最大相偏 = 5kHz

​	WBFM 最大相偏 = 75kHz

​	直接反应到频谱上，WBFM 的频谱比 NBFM 要宽，同时 NBFM 的声音带宽会被进一步压低，而 WBFM (普通广播)的音质就会听起来好很多。

​	将单音 FM信号公式展开得到，
$$
\begin{split}
S_{FM}(t)
&=Acos[\omega_ct+K_{FM}\lmoustache m(\tau)d\tau]\newline
&=Acos\omega_ctcos(K_{FM}\lmoustache m(\tau)d\tau)-Asin\omega_ctsin(K_{FM}\lmoustache m(\tau)d\tau)
\end{split}
$$
​	当最大瞬时相位偏移远远小于 0.5 时，可有
$$
\begin{split}
&cos(K_{FM}\lmoustache m(\tau)d\tau)\approx1,\newline
&sin(K_{FM}\lmoustache m(\tau)d\tau)=K_{FM}\lmoustache m(\tau)d\tau
\end{split}
$$
​	则 NBFM 信号的时域表达式为$S_{NBFM}(t)\approx Acos\omega_ct-[AK_{FM}\lmoustache m(\tau)d\tau]sin\omega_ct$.

​	利用常见的傅里叶变换对
$$
\begin{split}
m(t)&\Leftrightarrow M(\omega)\newline
cos\omega_ct&\Leftrightarrow \pi[\delta(\omega+\omega_c)+\delta(\omega-\omega_c)]\newline
sin\omega_ct&\Leftrightarrow j\pi[\delta(\omega+\omega_c)-\delta(\omega-\omega_c)]\newline
\lmoustache m(\tau)d\tau &\Leftrightarrow  \dfrac {M(\omega)}{j\omega}
\end{split}
$$
$$
\begin{split}
&\begin{split}
傅里&叶时移性质\newline
&时移质也称为延时特性，针对连续信号f（t），在时间域上提前或者滞后时间t_0，\newline
则在&频域表现为增加一个线性相位。原始时域连续信号及其傅里叶变换为\newline
\end{split}
\newline
&f(t)\leftrightarrow F(jw)\newline
&\begin{split}
则时&移性质可表述为下式\newline
&f(t\pm t_0)\leftrightarrow e^{\pm jwt_0}F(jw)\newline
&在实际的计算机处理中，我们只能处理数字信号，而不能直接处理模拟信号，因此，\newline
针对&数字信号，时移性质可表述为\newline
\end{split}\newline
&如果\newline
&x(n)\leftrightarrow X(k)\newline
&则有\newline
&x(n\pm n_0)\leftrightarrow X(k)e^{\frac{j2\pi kn_0}{N}}\newline
&\begin{split}
傅里&叶频域性质\newline
&频移性质与时移性质类似，即在频域的频率偏移，在时域上表现为增加一个线性相位。\newline
针对&连续信号有
\end{split}\newline
&如果\newline
&f(t)\leftrightarrow F(jw)\newline
&则有\newline
&f(t)e^{\pm jw_0t}\leftrightarrow F(j(w\mp w_0))\newline
&针对数字信号有\newline
&如果\newline
&x(n)\leftrightarrow X(k)\newline
&则有\newline
&x(n)e^{\frac{j2\pi kn_0}{N}}\leftrightarrow X(k\mp k_0)\newline
\newline
&\begin{split}\newline
\newline
傅里&叶变换\newline
&直流信号的傅里叶变换是2πδ(ω)根据频移性质可得e^{j\omega_0t}的傅里叶变换是2πδ(ω-ω_0),\newline
再根&据线性性质，可得cos\omega_0t的傅里叶变换\newline
由欧&拉公式\newline
&cos\omega_0t=\frac{1}{2}(e^{j\omega_0t}+e^{-j\omega_0t})\newline
&sin\omega_0t=\frac{1}{2j}(e^{j\omega_0t}-e^{-j\omega_0t})\newline
已知&\newline
&1 \leftrightarrow 2\pi \delta(\omega)\newline
由频&移性质\newline
&1·e^{j\omega_0t}\leftrightarrow 2\pi \delta(\omega-\omega_0)\newline
&1·e^{-j\omega_0t}\leftrightarrow 2\pi \delta(\omega+\omega_0)\newline
\therefore &cos\omega_0t\leftrightarrow \frac{1}{2}[2\pi \delta(\omega-\omega_0)+2\pi\delta(\omega+\omega_0)]=\pi\delta(\omega+\omega_0)+\pi\delta(\omega-\omega_0)\newline
同理&sin\omega_0t\leftrightarrow \frac{1}{2}[2\pi \delta(\omega-\omega_0)-2\pi\delta(\omega+\omega_0)]=\pi\delta(\omega+\omega_0)-\pi\delta(\omega-\omega_0)\newline
\end{split}\newline
&若原时间信号f(t)是绝对可积的，则它的傅里叶变换是自变量jw的函数。
\end{split}
$$


​	由时域相乘，对应频域卷积的关系可得，（参考博客[关于傅里叶变换的浅谈 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/410937006)以及[关于时域乘法和频域卷积关系的浅谈-Part 1 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/413345939)）
$$
\lmoustache m (\tau)d\tau sin \omega_c\Leftrightarrow \dfrac{1}{2}[\frac{M(\omega+\omega_c)}{\omega+\omega_c}-\frac{M(\omega-\omega_c)}{\omega-\omega_c}]
$$
​	因此，可得 NBFM 信号的频域表达式为
$$
S_{NBFM}(\omega)=\pi A[\delta(\omega+\omega_c)+\delta(\omega-\omega_c)]+\dfrac{AK_{FM}}{2}[\dfrac{M(\omega-\omega_c)}{\omega-\omega_c}-\dfrac{M(\omega+\omega_c)}{\omega+\omega_c}]
$$

### 1.5 宽频FM(WBFM)

​	当FM调制公式中的最大瞬时相位偏移$\varphi=K_{FM}\lmoustache m(\tau)d\tau$不满足远远小于0.5的条件是，此时表达式不能简化，因而，也就给频谱分析带来困难。为使问题简化，我们只研究单音调制的情况。

​	假设单音调制信号为$m(t)=A_mcos\omega_ct=A_mcos2\pi f_mt$。

​	有单音调制FM信号的时域表达式为$S_{FM}(t)=Acos[\omega_ct+m_{FM}sin\omega_mt]$,利用三角公式展开得到，
$$
S_{FM}(t)=Acos\omega_ctcos(m_{FM}sin\omega_mt)-Asin\omega_ctsin(m_{FM}sin\omega_mt)
$$
​	将两个因子分别展开傅里叶级数
$$
\begin{split}
cos(m_{FM}sin\omega t)=J_0(m_{FM}+\sum^\infty_{n=1}2J_{2n}(m_{FM})cos2n\omega_mt)\newline
sin(m_{FM}sin\omega_mt)=\sum^\infty_{n=1}2J_{2n-1}(m_{FM})sin(2n-1)\omega_mt
\end{split}
$$

​	其中，$J_0(m_{FM})$是第一类n阶贝塞尔函数（why？），它是调频指数$m_{FM}$的函数。

​	利用三角公式
$$
\begin{split}
cosAcosB=\frac{1}{2}cos(A-B)+\frac{1}{2}cos(A+B)\newline
sinAsinB=\frac{1}{2}cos(A-B)-\frac{1}{2}(A+B)
\end{split}
$$
​	以及贝塞尔函数性质
$$
\begin{split}
&J_{-n}(m_{FM})=-J_n(m_{FM}),n为奇数\newline
&J_{-n}(m_{FM})=J_n(m_{FM}),n为偶数
\end{split}
$$
​	得到FM信号的级数展开式为
$$
\begin{split}
S_{FM}(t)
=&Acos\omega_ctcos(m_{FM}sin\omega_mt)-Asin\omega_ctsin(m_{FM}sin\omega_mt)\newline
=&AJ_0(m_{FM})cos\omega_ct-AJ_1(m_{FM})[cos(\omega_c-\omega_m)t-cos(\omega_c+\omega_m)t]\newline
&+AJ_2(m_{FM})[cos(\omega_c-2\omega_m)t+cos(\omega_c+2\omega_m)t]\newline
&-AJ_3(m_{FM})[cos(\omega_c-3\omega_m)t-cos(\omega+3\omega_m)t]······\newline
=&A\sum^\infty_{n=-\infty}J_n{m_{FM}}cos(\omega_c+n\omega_m)t
\end{split}
$$
​	对上式进行傅里叶变换，即得FM信号的频域表达式
$$
S_{FM}(\omega)=\pi A\sum^\infty_{-\infty}J_n(m_{FM})[\delta(\omega-\omega_c-n\omega_m)+\delta(\omega+\omega_c+n\omega_m)]
$$
​	由此可知，F**M调频信号的频谱载波分量**$\omega_c$**和无数边频**$\omega_c\pm n \omega_m$**组成**。**当$n=0$时，其幅度为**$J_0(m_{FM})$，**当$n\neq0$时，就是对称分布在载频两侧的变频分量**$\omega_c\pm n \omega_c$，**其幅度为**$J_n(m_{FM})$，**相邻边频之间的间隔是**$\omega_m$，并且，**当n是奇数时，上下边频极性相反，当n是偶数时，上下边频极性相同**。由此可见，FM信号的频谱不再是调制信号频谱的线性搬移，而是一种非线性过程。

### 1.6 调频信号的带宽

​	调频信号的频谱包含**无穷多个频率分量**，因此**理论上调频信号的频带宽度为无限宽**，但是**实际上边频幅度$J_n(m_{FM})$随着n的增大而逐渐减小**，因此**只要取适当的$n$值使边频分量小到可以忽略的程度，调频信号可近似认为具有有线频谱**。通常采用的原则是，**信号的频带宽度应包括幅度大于未调载波的10%以上的变频分量，即**$J_n(m_{FM})\geq0.1$

​	**当$m_{FM}\geq1$以后，取变频数 $n=m_{FM}+1$即可**。因为$n>m_{FM}+1$**以上的边频幅度$J_n(m_{FM})$均小于0.1，这意味着大于未调载波幅度10%以上的变频分量均被保留**。因为**被保留的上、下变频数共有$2n=2（m_{FM}+1）$个，相邻边频之间的频率间隔为$f_m$或**$\omega_m$，所以调频波的有效带宽为
$$
B_{FM}=2(m_{FM}+1)f_m=2（{\Delta f+f_m}）
$$
​	这就是广泛用于计算调频信号带宽的**卡森(Carson)公式**。

​	当$m_{FM}\ll1时$，带宽公式可近似为
$$
B_{FM}\approx2f_m
$$
​	这就是窄带调频NBFM的带宽。此时，**带宽由第一对边频分量决定，带宽值随调制信号频率$f_m$变换，而与最大频偏$\Delta f$无关**。

​	当$m_{FM}\gg1$时，带宽公式可近似为
$$
B_{FM}\approx2\Delta f
$$


​	这就是带宽调频WBFM的带宽。此时，**带宽由最大频偏$\Delta f $决定，而与调制信号频率$f_m$无关**。

​	对于多音或任意带限信号调制时的调频信号带宽仍可用卡森公式估算，即
$$
B_{FM}=2(m_{FM}+1)f_m=2(\Delta f+f_m)
$$
​	但是，这里的$f_m$是调制信号的最高频率，调频指数$m_{FM}$时最大频偏$\Delta f$与$f_m$的比值。

​	NBFM 和 WBFM 最大的区别是最大瞬时相位偏移不同。

​	NBFM 最大相偏 = 5kHz

​	WBFM 最大相偏 = 75kHz

​	例如，调频广播中规定的最大频偏$\Delta f$为75kHz，最高调制频率$f_m$为15kHz，故调频指数$m_{FM}=\frac{75}{15}=5$，由带宽公式可得此FM信号的频带带宽为180kHz。



## 2. 实验内容

### 2.1 单频FM调制

$$
\begin{split}
S_{FM}(t)
& = Acos[\omega_ct+K_{FM}A_m\lmoustache cos\omega_m\tau d\tau]\newline
& = Acos[\omega_ct+m_{FM}sin\omega_mt]\newline
& = Acos\omega_ctcos(m_{FM}sin\omega_mt)-Asin\omega_ctsin(m_{FM}sin\omega_mt)
\end{split}
$$

​	按图2搭建一个FM调制的GRC程序。

![单频FM调制GNU_Radio流图](单频FM调制GNU_Radio流图.png)

<div align = "center">图2 单频FM调制GNU Radio流图</div>

#### 2.1.1 变量定义

​	将$m_{FM}$设定为一个可调变量 （WX GUI Slider）$beta$,将调频信号频率设定为一个可调变量 $fm$，将载波信号频率设定为一个可调变量$fc$，采样率设定为变量$samp\\_rate$，并取值200000Hz。（WX GUI在GUN Radio 3.8+ 的版本中被移除，使用QT GUI时可不使用WX GUI Slider模块用QT GUI Rang 代替）

#### 2.1.2 生成调制信号

​	用 **Signal Source** 模块生成一个正弦波调制信号$sin\omega_mt$，其频率为$fm$，幅度为1。然后与$m_{FM}$相乘得到$m_{FM}sin\omega_mt$

#### 2.1.3 生成载波信号

​	分别生成$sin\omega_ct$和$cos\omega_ct$载波信号，并分别于调制信号$-sin\omega_mt$及其正交信号$cos\omega_ct$相乘，然后二者相加，得到
$$
cos\omega_ctcos(m_{FM}sin\omega_mt)-sin\omega_ctsin(m_{FM}sin\omega_mt)
$$
即为FM已调信号，调制信号波形如图3所示。

![FM单音调制_调制信号](FM单音调制_调制信号.png)

<div align = "center">图3 调制信号波形</div>

FM已调信号如图4所示。

![FM单音调制_FM已调信号](FM单音调制_FM已调信号.png)

<div align = "center">图4 FM已调信号</div>

FM已调信号的频域波形如图5所示。

![FM单音调制_FM已调信号频域波形](FM单音调制_FM已调信号频域波形.png)

<div align = "center">图5 FM已调信号的频域波形</div>

### 2.2 单频FM解调

​	按照图6搭建FM解调GRC

![FM单音解调_解调信号](FM单音解调_解调信号.png)

<div align = "center">图6 单频FM解调GNU Radio流图</div>

#### 2.2.1 定义变量

​	采样率：200000Hz

​	载波频率$fc$：0~100000Hz，默认为25000Hz

​	低通滤波器截止频率$f\\_cut\\_off$：0~50000Hz，默认为25000Hz

#### 2.2.2 生成载波信号

​	用两个**Signal Source**分别生成载波信号$cos\omega_ct$和$sin\omega_ct$。

​	并分别于FM已调信号相乘（FM已调信号为FM调制中生成并保存到文件的信号）。

​	对于$cos\omega_ct·S_{FM}(t)=cos\omega_ct·Acos[\omega_ct+m_{FM}sin\omega_mt]$

​	由$cos\alpha cos\beta=\frac{cos(m_{FM}sin\omega_ct)+cos(2\omega_ct+m_{FM}sin\omega_mt)}{2}$，可得
$$
cos\omega_ct·S_{FM}(t)=\frac{cos(m_{FM}sin\omega_mt)+cos(2\omega_ct+m_{FM}sin\omega_mt)}{2}
$$


​	对于$sin\omega_ct·S_{FM}(t)=sin\omega_ct·Acos[\omega_ct+m_{FM}sin\omega_mt]$

​	由$sin\alpha cos\beta=\frac{sin(\alpha+\beta)+sin(\alpha-\beta)}{2}$，可得

$$
sin\omega_ct·S_{FM}(t)=\frac{sin(m_{FM}sin\omega_mt)+sin(2\omega_ct+m_{FM}sin\omega_mt)}{2}
$$

​	$ cos\omega_ct·S_{FM}(t) $和$sin\omega_ct·S_{FM}(t)$分别经过低通滤波器后去除了高频分量，只剩下了$cos(m_{FM}sin\omega_mt)$或$sin(m_{FM}sin\omega_mt)$频率分量。

#### 2.2.3 生成复数信号

​	由于$I(t)=Acos(m_{FM}sin\omega_mt)$，$Q(t)=Asin(m_{FM}sin\omega_mt)$

​	则上一步得到的$cos(m_{FM}sin\omega_mt)$和$sin(m_{FM}sin\omega_mt)$通过使用**Float to Complex**模块得到复数信号$\tilde{s}(t)=I(t)+jQ(t)=A·e^{j\varphi(t)}$，$\varphi(t)=m_{FM}sin\omega_mt$。

#### 2.2.4 生成延迟信号

​	附属信号通过**Delay**模块生成延迟信号$\tilde{s}(t-1)$。

#### 2.2.5 共轭相乘

​	利用**Multiply Conjugate**模块生成$\tilde{s}(t-1)·\tilde{s^*}(t)$。

#### 2.2.6 取信号的角度

​	利用**Complex tp Arg**模块取出复数信号$\tilde{s}(t-1)·\tilde{s^*}(t)$的角度，即得到调制信号$2\pi f_m·m_{FM}\frac{m(t)}{A_m}$，其中$A_m=1，f_m=2000Hz，m_{FM}=4$。

​	经过低通滤波后的信号频谱如图7所示，FM解调后得到的调制信号的时域波形如图8所示，频谱如图9所示。

![FM单音解调_低通滤波后的频域波形](FM单音解调_低通滤波后的频域波形.png)

<div align = "center">图7 低通滤波后的信号频谱</div>

![FM单音解调后得到的调制信号的时域波形](FM单音解调后得到的调制信号的时域波形.png)

<div align = "center">图8 FM解调后得到的调制信号的时域波形</div>

![FM单音解调后得到的调制信号的频域波形](FM单音解调后得到的调制信号的频域波形.png)

<div align = "center">图9 FM解调后得到的调制信号的频域波形</div>

### 2.3 WBFM调制解调

​	按图10所示搭建一个WBFM调制解调的GRC程序。

![WBFM调制解调GNU_Radio流图](WBFM调制解调GNU_Radio流图.png)

<div align = "center">图10 WBFM调制解调流图</div>

#### 2.3.1 从电脑硬盘读取音频

​		使用**Wav File Source**模块来读取.wav文件，尽量避免使用中文名文件、英文大写为首字母的文件或过大的文件，否则会报错，如

```python
RuntimeError: is not a valid wav file
```

#### 2.3.2 WBFM调制（发送）

​	使用**WBFM Transmit**模块生成WBFM宽带FM信号。$Quadrature\ Rate$表示的是**WBFM Transmit**模块所期望的输入采样率为$480kHz$。

#### 2.3.3 重采样

​	使用**Rational Resampler**模块来调整采样率，经过**Rational Resampler**模块作用，采样率变化过程为$480kHz\rightarrow480k·\frac{200}{48}=2000kHz$。

#### 2.3.4 信道模拟

​	使用**Channel Model**来模拟信道作用。

#### 2.3.5 低通滤波

​	低通滤波的截止频率设置为$10kHz$，过渡带宽为$20kHz$，$Decimation$抽取值为1，经过此模块后的采样率不变。

#### 2.3.6 重采样

​	使用**Rational Resampler**模块来调整采样率，经过此**Rational Resampler**模块作用，采样率变化过程为$2000kHz\rightarrow2000k·\frac{48}{200}=480kHz$。

#### 2.3.7 WBFM解调（接收）

​	使用WBFM接收模块来进行WBFM解调，其中$Audio \ Decimation$为10，表示需要将采样率$480kHz$变为$\frac{480k}{10}=48kHz$，以此来适应**Audio Sink**所要求的$48kHz$。

### 2.4 使用HackRF实现WBFM调制解调

​	如图11为使用HackRF实现WBFM调制GUN Radio流图，图12为使用HackRF实现WBFM解调流图。

![通过hackrf实现WBFM调制信号](通过hackrf实现WBFM调制信号.png)

<div align = "center">图11 使用HackRF实现WBFM调制GUN Radio流图</div>

![通过hackrf实现WBFM解调信号](通过hackrf实现WBFM解调信号.png)

<div align = "center">图12 使用HackRF实现WBFM解调GUN Radio流图</div>

#### 2.4.1 HackRF接收信号

​	HackRF用**osmocom Source**模块来接收FM信号，其中采样率设置为变量$samp\_rate$，

​	**Ch0:Frequncy(Hz)**设置为变量$center\\_freq$。

​	用一个**Signal Source**产生一个频率为$center\\_freq\  -\ channel\\_freq$的余弦波来与**osmocom Source**模块的输出相乘，进行频谱搬移。

#### 2.4.2 低通滤波

​	低通滤波器的截止频率设置为$100kHz$，过渡带宽为$25kHz$，$Decimation$抽取值为100，经过此模块后的采样率由$20MHz$变为了$200kHz$。

#### 2.4.3 重采样

​	使用**Rational Resampler**模块来继续调整采样率，以此来满足后续**Audio Sink**模块需要的$48kHz$做准备。

#### 2.4.4 WBFM接收

​	使用WBFM接收模块来进行WBFM解调，其中$Audio \ Decimation $为10，表示将采样率$480kHz$要变为$\frac{480k}{10}=48kHz$，以此来适应**Audio Sink**所需要的$48kHz$。

​	$Quadrature \ Rate$表示的是**WBFM Receive**模块所期望的输入采样率为$480kHz$。

#### 2.4.5 音量调节

​	使用一个**Multiply Constant**模块来调节声音音量大小，这个数值的取值设定为一个可调节的变量$volume\\_gain$。

#### 2.4.6 收听电台

​	依据图中的流图将会听到103.915MHz的电台（北京交通广播电视台），可以通过调节$Channel \ Frequency$的值来找到当地可以听到的电台频率。可以先用gqrx找到当地能听到的电台频率值，再进一步微调。

## 3. 参考资料

1. [ GNU Radio FM调制解调实验_开源SDR实验室的博客-CSDN博客](https://blog.csdn.net/OpenSourceSDR/article/details/108902748)
2. [傅里叶时移和频移性质_寂小小寞的博客-CSDN博客_频移定理](https://blog.csdn.net/u010658002/article/details/123645966)
3. [coswt的傅里叶变换 (baidu.com)](https://baijiahao.baidu.com/s?id=1715020667080100292#:~:text=coswt%E7%9A%84%E5%82%85%E9%87%8C%E5%8F%B6%E5%8F%98%E6%8D%A2%20%E6%A0%B9%E6%8D%AE%E6%AC%A7%E6%8B%89%E5%85%AC%E5%BC%8Fcos%CF%890t%3D%20%5Bexp,%28j%CF%890t%29%2Bexp%20%28-j%CF%890t%29%5D%2F2%EF%BC%8C%E5%8F%AF%E5%BE%97exp%20%28j%CF%890t%29%E7%9A%84%E5%82%85%E9%87%8C%E5%8F%B6%E5%8F%98%E6%8D%A2%E6%98%AF2%CF%80%CE%B4%20%28%CF%89-%CF%890%29%E3%80%82)
4. [求教书中傅里叶变换中F（jw）和F（w）有什么区别？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/68402359)
5. [关于时域乘法和频域卷积关系的浅谈-Part 1 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/413345939)
6. [ 卷积运算是什么？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/339496491)
7. [卷积_百度百科 (baidu.com)](https://baike.baidu.com/item/%E5%8D%B7%E7%A7%AF/9411006)
8. [时域上的乘积等于频域上的卷积_卷积的通俗理解——从傅里叶变换到滤波器_学术入门的博客-CSDN博客](https://blog.csdn.net/weixin_28836875/article/details/112333448)
9. [第一类贝塞尔函数 - 快懂百科 (baike.com)](https://www.baike.com/wiki/%E7%AC%AC%E4%B8%80%E7%B1%BB%E8%B4%9D%E5%A1%9E%E5%B0%94%E5%87%BD%E6%95%B0?view_id=5qwsmcama5w000)
10. [ GNU Radio GRC HackRF实现FM接收_开源SDR实验室的博客-CSDN博客](https://blog.csdn.net/OpenSourceSDR/article/details/52634934)

<center></center>

![EMT](EMT.jpg)