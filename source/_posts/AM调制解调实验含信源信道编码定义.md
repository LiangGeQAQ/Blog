---
title: AM调制解调实验含信源信道编码定义
mathjax: true
date: 2022-07-19 21:00:03
tags: [AM,GNU Radio,信源编码,信道编码,调制解调]
categories: [AM]
comment: true
---
# GNU radio AM调制解调实验

> 系统：Ubuntu 	20.04
>
> 软件：GNU Radio	3.8.1.0

## 1. 基本原理

### 1.1 实验原理

​	调制是改变高频载波信号特征来传递信号的过程，虽然理论上存在未经数据调就直接传输基带信号或信息的可能，但是将该信息条知道载波上在进行发送效率更高。

​	模拟调制和数字调制都有多种调制方法。

​	幅度调制是一种模拟调制方法，通过连续改变固定频率载波信号的幅度来表示数据。该载波信号通常是一个高频的正弦波，用来“负载”该消息包络中的信息。**正弦波有三个可变参数**——幅度$A$、频率$\omega$、相位$\varphi$，任何一个参数都可被调制或改变以此来表达信息。正弦波在数学上可用正弦或余弦函数来表示，但由于余弦函数是对称函数易于处理，因此，**一般常用余弦函数来表示载波信号**。

### 1.2 AM调制

​	幅度调制使用调制信号来控制高频正弦载波的幅度$A$，使得高频正弦载波按照调制信号的规律变化的过程。幅度调制器的一般模型如图1所示。

![幅度调制器一般模型](幅度调制器一般模型.png)

<div align = "center">图1 幅度调制器一般模型</div>

​	其中，

​	$m(t)=A_mcos(\omega_mt+\varphi)$为**调制信号（也就是信息信号）**，$\omega_m=2\pi f_m$

​	$A_0$是**外加的直流分量**：
​	$c(t)=A_c cos(\omega_ct)$是**高频载波信号**，$\omega_c=2\pi f_c$；

​	$S_{AM}(t)$是**AM调制的已调信号**；

​	$h(t)$为**滤波器的冲激响应**。

​	为了简化公式描述，通常假设载波信号$c(t)$与调制信号之间的初始相位差$\varphi=0$，外加的直流分量$A_0=1$，载波信号的幅度$A_c=1$。

​	经过AM调制，已调信号$S_{AM}(t)$就是将调制信号添加到载波信号的幅度上的结果，用数学公式为：
$$
\begin{split}
S_{AM}(t)
&=A_c[A_0+m(t)]cos\omega_ct \newline
&=(A_cA_0+A_cA_mcos\omega_mt)cos\omega_ct\newline
&=A_ccos\omega_ct+A_cA_mcos\omega_mt\newline
&=A_ccos\omega_ct+\frac{A_cA_m}{2}[cos(\omega_c-\omega_m)t+cos(\omega_ct+\omega_m)t]\newline
&=A_ccos2\pi f_ct+\frac{A_cA_m}{2}[cos2\pi(f_c-f_m)t+cos2\pi(f_c+f_m)t]
\end{split}
$$
​	从上述表达式可知，**已调信号$S_{AM}(t)$中含有三种频率成分**，即$f_c，f_c-f_m$和$f_c+f_m$。其中，通常将$f_c+f_m$称为上边带，$f_c-f_m$称为下边带。通过适当选择滤波器的特征，便可得到各种幅度调制信号，如常规双边带调幅（AM）、双边带调制（DSB）、单边带调制（SSB）、抑制载波双边带调制（DSB-SC）、单残留边带调制。

​	上述已调信号$S_{AM}(t)$公式中，并没有考虑AM调制系数（或称为调制指数）。然而，在调制技术中，调制系数是衡量调制深度的一个非常重要的指标参数。在调幅（AM）技术中，**调制系数值调制信号与载波信号幅度比，称为调幅系数**，在这里，我们用$k_a$表示调幅系数。则已调信号表示为$S_{AM}(t)=A_c[1+k_a·m(t)]cos\omega_ct$。

​	一般地，调幅系数定义为，**用A和B分别表示AM波形包络垂直方向上的最大和最小值**，则调幅系数$k_a=\frac{A-B}{A+B}$。提高调幅系数**可提高信噪比、功率利用率**。但调幅系数的提高是有限的**，太大将造成调制信号的失真，实际的调幅系统调制系数都小于1**。例如。AM广播的调制系数在0.3左右。

​	调制信号$m(t)$波形如图2所示。

![调制信号m(t)波形](调制信号m(t)波形.png)

<div align = "center">图2 调制信号波形</div>

​	载波信号$c(t)$（调幅系数为0的AM波形）波形如图3所示。

![载波信号c(t)波形](载波信号c(t)波形.png)

<div align = "center">图3 载波信号波形</div>

​	如图4所示，为调幅系数为$100\%$的信号波形，其中$A=1，B=0$。AM波形包络的摆幅达到了最大，接触到了纵轴的$0$点

![调幅系数为1的信号波形](调幅系数为1的信号波形.png)

<div align = "center">图4 调幅系数为100%的信号波形</div>

​	假设调制信号$m(t)$均值为$0$，且沿着横轴取值正负对称。如果$m(t)$的最大幅度是$ 1 $，即$A_m=1$，直流分量$A_0=1$，则AM信号的表达式可写成：
$$
S_{AM}(t)=A_c[1+k_a·m(t)]cos\omega_ct，0\leqslant k_a \leqslant 1
$$
​	假设调制信号$m(t)$的最大幅度不是$1$，直流分量$A_0=1$，则根据如下公式进行调幅归一化后的信号的幅度为$ 1 $，
$$
\hat {m(t)}=\frac{m(t)}{|m(t)|_{max}}
$$
​	

​	则此时AM信号表达式可写成：
$$
S_{AM}(t)=A_c[1+k_a·\hat{m(t)}]cos\omega_ct，0\leqslant  k_a\leqslant 1
$$

### 1.3 AM解调

​	经过AM调制后的已调信号为：
$$
S_{AM}(t)=A_c[A_0+k_a·m(t)]cos(\omega_ct+\varphi)
$$
​	其中，调制信号$m(t)=A_mcos(\omega_mt)=A_mcos(2\pi f_mt)$为了简化表述，我们假设载波初始相位$\varphi=0$，外加直流$ A_0=1$，载波信号幅度$A_c=1$，则可得：
$$
\begin{split}
S_{AM}(t)
& = A_c[1+k_a·m(t)]cos(\omega_ct)\newline
& = [1+k_a·m(t)]cos(2\pi f_ct)
\end{split}
$$
​	AM接收机需要从接收到的已调信号$S_{AM}(t)$中还原出调制信号$m(t)$。一种解决方法就是先从$S_{AM}(t)$中还原出$1+k_am(t)$，然后再减去直流分量从而得到$m(t)$。

​	因此，我们可以按照以下三步来进行AM解调：

​	1) 用载波$c(t)$乘以已调信号$S_{AM}(t)$
$$
\begin{align}
r(t)
& = S_{AM}(t)·c(t)\newline
& = A_c[1+k_a·m(t)]cos(2\pi f_ct)cos(2\pi f_ct)\newline
& = [1+k_a·m(t)][\frac{1}{2}(1+cos(1\pi f_ct))]\newline
& = \frac{1}{2}[1+k_a·m(t)]+\frac{1}{2}[1+K_a·m(t)]cos(4\pi f_ct)\newline
\end{align}
$$
​	2) 利用低通滤波器得到调制信号$ \frac{1}{2}[1+k_a·m(t)]$

​	3) 滤除直流电压后，得到$\frac{1}{2}k_a·m(t)$

## 2. 实验内容

### 2.1 AM调制

$$
S_{AM}(t)=Ac[1+k_a·m(t)]cos\omega_ct
$$

​	按照图5所示，搭建一个AM调制的GRC程序。

![AM调制GUN_Radio流图](AM调制GUN_Radio流图.png)

<div align = "center">图5 AM调制流图</div>

​	其中，包括信号源（**Signal Source**）、节流阀（**Throttle**）、乘常数（**Multiply Const**）、加常数（**Add Const**）、QT信号时域用户界面（**QT GUI Time Sink**）、QT信号频域FFT展示用户界面（**QT GUI Frequency Sink**）、文件保存（**File Sink**）等模块。

​	可使用**QT GUI Range** 模块定义一个可被用户再范围内调节的参数，此处定义$fm$（调制信号频率），$fc$（载波信号频率），$ka$（调幅系数）；**step**可简单地理解为最小单位。

​	可使用**QT GUI Tab Widget**模块将不同标签（Tab）的图形显示在一个窗口内。

​	如图6所示，不过需要注意的是，使用标签时应注意**QT GUI Tab Widget**模块的ID，应使各个图形用户界面的标号及**GUI Hint**与**QT GUI Tab Widget**模块ID对应，如此时该模块ID为：notebook，则图形用户界面应如图7设置，其余类推。

![QT_GUI_Tab_Widget使用1](QT_GUI_Tab_Widget使用1.png)

<div align = "center">图6 不同标签同窗口显示</div>

![QT_GUI_Tab_Widget使用2.png0](QT_GUI_Tab_Widget使用2.png0.png)

<div align = "center">图7 用户界面标签设置</div>

​	**Throttle**模块中的**sample_rate**设置为变量sample_rate，起主要作用是在电脑没有连接软件无线电设备时，防止GRC仿真程序占用过多的系统资源而导致系统崩溃。

​	**multiply const**模块中的**const**为变量$ka$。

​	在运行后，对波形图使用鼠标中键，再选择**control panel**，可以对探头进行调节，如图8所示。

![探头调节](探头调节.png)

<div align = "center">图8 探头调节</div>

​	调制信号$m(t)$波形图如图9所示，由图可得出其周期为$0.25ms$，即$\frac{1}{f_m}=\frac{1}{4k}s$，其频域波形图如图10所示。

![AM调制_调制信号时域波形](AM调制_调制信号时域波形.png)

<div align = "center">图9 调制信号时域波形</div>

![AM调制_调制信号频域波形](AM调制_调制信号频域波形.png)



<div align = "center">图10-1 调制信号频域波形</div>

![AM调制_调制信号频域波形放大](AM调制_调制信号频域波形放大.png)

<div align = "center">图10-2 调制信号频域波形（放大）</div>

​	载波信号$c(t)$的波形如图11所示，由图可知载波信号的周期约为$0.03125ms$,即$\frac{1}{f_c}=\frac{1}{32k}s$

![AM调制_载波波形](AM调制_载波波形.png)

<div align = "center">图11 载波信号的时域波形</div>

​	调节**QT GUI Time Sink**模块中的 **Number of Inputs**为$2$，同时显示调制信号$m(t)$和已调信号$S_{AM}(t)$的时域波形，如图12所示，由图可知已调信号的周期与载波信号$c(t)$，仍约为$0.03125ms$，调制信号的周期为$0.25ms$。已调信号的频域波形如图13所示。

![AM调制_已调信号与调制信号对比](AM调制_已调信号与调制信号对比.png)

<div align = "center">图12 调制信号与已调信号时域波形</div>

![AM调制_已调信号频域波形](AM调制_已调信号频域波形.png)

<div align = "center">图13-1 已调信号的频域波形</div>

![AM调制_已调信号频域波形放大](AM调制_已调信号频域波形放大.png)

<div align = "center">图13-2 已调信号的频域波形（放大）</div>

### 2.2 AM解调

​	按图14搭建一个AM解调的GRC程序。

![AM解调GNU_Radio流图](AM解调GNU_Radio流图.png)

<div align = "center">图14 AM解调流图</div>

​	其中，包括信源（**File Source** 和 **Signal Source**），乘（**Multiply**），节流阀（**Throttle**），低通滤波器（**Low Pass Filter**），乘常数（**Multiply Const**），直流消除器（**DC Blocker**），重采样器（**Rational Resampler**），QT信号时域用户界面（**QT GUI Time Sink**），QT信号频域用户界面（**QT GUI Frequency Sink**）等模块。

​	为了从AM已调信号中解调处调制信号，我们需要通过将已调信号乘上一个载波信号，并经过一个低通滤波器得到基带信号$1+k_am(t)$。然后基带信号$1+k_am(t)$再通过一个直流消除器后即可得到调制信号$k_am(t)$。

​	**File source**模块读取AM调制实验中保存的AM已调信号，并将**Repeat**设置为**Yes**，以获得一个持续的信号效果。

​	**Decimation**是重采样过程中的抽取操作，本例中将 **Decimation**设置成了变量$resamp\_factor=4$，表示每隔4个样本取1个样本。这样把采样频率降下来，即降采样（**downsample**）。其目的是减少数据样点，减少运算时间，也是一种在实时处理时常采用的方法。（重采样指根据一类象元的信息内插出另一类象元信息的过程，如从高分辨率遥感影像中提取出低分辨率影像）

​	**Gain**设置为1，**sample_rate**设置为变量，值为$200k$。

​	已调信号$S_{AM(t)}$的频率分为三种，$f_c-f_m=28kHz，f_c=32kHz，f_c+f_m=36kHz$，即调制信号的频率$f_m$为$4kHz$，载波信号的频率$f_c$时$32kHz$。

​	由公式
$$
\begin{split}
r(t)
& = S_{AM}(t)·c(t)\newline
& = A_c[1+k_a·m(t)]cos(2\pi f_ct)cos(2\pi f_ct)\newline
& = [1+k_a·m(t)][\frac{1}{2}(1+cos(1\pi f_ct))]\newline
& = \frac{1}{2}[1+k_a·m(t)]+\frac{1}{2}[1+K_a·m(t)]cos(4\pi f_ct)
\end{split}
$$
​	可知，已调信号$S_{AM}(t)$与载波$c(t)$相乘之后的信号的中心频率已经被分别搬移到了$\frac{1}{2}[1+k_a·m(t)]（0kHz）$和$\frac{1}{2}[1+K_a·m(t)]cos(4\pi f_ct)（64kHz） $处，我们需要的是基带信号$\frac{1}{2}[1+k_a·m(t)]$，而不需要高频信号$\frac{1}{2}[1+K_a·m(t)]cos(4\pi f_ct)$，因此，需要设置一个低通滤波器来保留基带信号，滤除高频信号，其设置参数如图15所示。

![低通滤波器参数设置](低通滤波器参数设置.png)

<div align = "center">图15 低通滤波器参数设置</div>

​	低通滤波器的输出与一个常数**Amplifier**相乘，以此来增强信号的功率强度，将其设置为一个可由用户调控的参数范围$0\ —\ 2$。

​	**DC Blocker**模块用于消除直流分量。

​	在低通滤波器中设置的抽取系数**Decimation**为$4$，因此为了能够还原信号的频率，我们需要一个重采样器来恢复原始信号的采样速率。在**Rational Resampler**模块（按有理数因子改变采样率，抽取为$m$倍，插值为$l$倍时，采样率改变为$\frac{l}{m}$，采样率大于1即提高采样率，小于1则为降低采样率）中的**Interpolation**设置为$4$，**Decimation**设置为$1$。

​	最后AM解调后得到的原始调制信号时域图如图16所示，频域图如图17所示。

![原始调制信号时域图](原始调制信号时域图.png)

<div align = "center">图16 原始调制信号时域图</div>

![原始调制信号频域图](原始调制信号频域图.png)

<div align = "center">图17-1 原始调制信号频域图</div>

![原始调制信号频域图放大](原始调制信号频域图放大.png)

<div align = "center">图17-2 原始调制信号频域图（放大）</div>

​	由图可知还原得到的调制信号频率为$4kHz$，其周期为$0.25ms$，符合原调制信号的参数。



## 3. 信源编码

### 3.1.1 概念

**信息传播过程：**信源→信道→信宿

**通信系统模型：**[信源]->[信源编码]->[信道编码]->[信道传输+噪声]->[信道解码]->[信源解码]->[信宿]

**信源：**是产生各类信息的实体。信源给出的符号是不确定的，可用随机变量及其统计特性描述。信息是抽象的，信源是具体的；也就是信息的发布者。

**信道：**信道就是信息传递的通道，是将信号进行传输、存储和处理的媒介。

**信宿：**信息的接收者。

**信源编码：**以提高通信有效性为目的而对信源符号进行的变换，或者说为了减少或消除信源冗余度而进行的信源符号变换；即针对信源输出符号序列的统计特性来寻找某种方法，把信源输出符号序列变换为最短的码字序列，使后者的各码元所载荷的平均信息量最大，同时又能保证无失真地恢复原来的符号序列。

**信源剩余度：**信源剩余度是用来衡量信源的相关性程度（有时也称为冗余度或多余度）。信源的剩余度等于1减去熵的相对率，即$\gamma=1-\frac{H_{\infty}}{H_0}$，其中$H_{\infty}$是信源的实际熵（极限熵），$H_0$是最大熵，由此可知信源符号之间依赖关系越大，实际熵越小，信源的剩余度就越大。从提高传输信息效率的观点出发，总是希望减少或去掉信源的剩余度.但从减少干扰的影响观点出发，信源的剩余度越大，消息抗干扰能力越强。剩余度$\gamma$可以用来衡量信源输出的符号序列中个符号之间的依赖程度。

**渐进等分性：**当随机变量的序列足够长时,其中一部分序列就显现出一种典型的性质：这些序列中各个符号的出现频数非常接近于各自的出现概率，而这些序列的概率则趋近于相等，且它们的和非常接近于1,这些序列就称为典型序列。其余的非典型序列的出现概率之和接近于零。序列的长度越长，典型序列的总概率越接近于1,它的各个序列的出现概率越趋于相等。

**克拉夫特不等式：**

设符号表中的原始符号为：
$$
S=\\{s_1,s_2,...,s_n\\}
$$
在大小为$r$的字符集上编码为唯一可解编码的码字长度为$\ell_1,\ell_2,...,\ell_n$

则，
$$
\sum^n_{i=1}r^{-\ell_i}\geqslant1
$$
反之，给定一个满足上述不等式的自然数集合，则在大小为$r$字符集上，存在一组唯一可解编码符合相应的码字长度。

### 3.1.2 目的

+ 提高通信有效性
+ 减少或消除信源冗余度而进行的信源符号变换
+ 数据压缩
+ 将信源的模拟信号转化成数字信号

### 3.1.3 定理

+ 信源编码定理

  ​	一定存在一种无失真编码，当把N个符号进行编码时，平均每个符号所需二进码的码长满足$\frac{1}{N}+H(U)>\bar{L}\geqslant H(U)$。

  ​	其中，$H(U)$是信源的符号熵（比特），也就是说最佳的信源编码应是与信源信息熵$H(U)$统计匹配的编码，代码长度可接近符号熵。即可按概率特性变成不等长度码。对不同类型的的信源（如离散或连续、无或有记忆、平稳或非平稳、无或限定失真等）可以构成不同的组合信源，其都存在各自的信源编码定理。

+ 离散无记忆信源的定长编码定理

  ​	对于任意给定的$\varepsilon>0$，只要满足条件$\frac{N}{M}\geqslant\frac{H(U)+\varepsilon}{logL}$

  ​	那么，当$M$足够大时，上述编码几乎没有失真；反之，若这个条件不满足，就不可能实现无失真的编码。时钟$H(U)$是信源输出序列的符号熵。通常，信源的符号熵$H(U)=K$，因此，上述条件还可以表示为$\frac{H(U)+\varepsilon}{logL}\leqslant\frac{N}{M}\leqslant\frac{logK}{logL}$

  ​	特别地，若有$K=L$，那么只要$H(U)<logK$，就可能有$N<M$，从而提高信息荷载的效率。由此可以看出$H(U)$离$logK$越远，通过编码所能获得的效率改善就越显著。实质上，定长编码方法提高信息载荷能力的关键是利用了渐进等分性，通过选择足够大的$M$，把本来各个符号概率不等（$H(U)<K$）的信源输出符号序列变换为概率均匀的典型序列，而码字的唯一可译性则由码字的定长性来解决。

+ 离散无记忆信源的变长编码定理

  ​	变长编码是指$V $的各个码字的长度不相等。只要$V$中各个码字的长度$N_i(i=1,...,||V||)$满足克拉夫特不等式。这$||V||$个码字就能唯一地正确划分和译码。

### 3.1.4 分类

+ 根据信源的性质进行分类
  + 信源统计特性已知/未知
  + 无失真/限定失真
  + 无记忆/有记忆
+ 根据编码方式进行分类
  + 分组码/非分组码
  + 等长码/变长码

​	常讨论统计特性已知条件下，离散、平稳、无失真心愿的编码，消除这类信源剩余度的主要方法有**统计匹配编码**和**解除相关性编码**。

信源编码举例

+ 不等长度分组码
  + 香农码、费诺码、赫夫曼码
+ 非分组码
  + 算术编码
+ 接触相关性编码
  + 预测编码、变换编码
+ 对限定失真的信源编码
  + 矢量量化编码
+ 统计性位置的信源编码
  + 通用编码

### 3.1.5 一般问题表述

​	减少信源输出符号序列中的剩余度、提高符号平均信息量的基本途径：

+ 使序列中的各个符号尽可能地互相独立（接触相关性）
+ 使序列中各个符号的出现概率尽可能地相等（概率均匀化）

​	$U=\\{(u_1,...,u_M)|u_m\in A,m=1,...,M\\}$

​	$V=\\{(v_1,...,v_N)|v_n\in,n=1,...,N\\}$

​	若信源的输出为长度等于$M $的符号序列集合，式中符号$A$为信源符号表，它包含着$K$个不同的符号，$A=\{\alpha k | k=1,...,K\}$,这个信源至多可以输出$KM$个不同的符号序列。

​	记$||U||=KM$。

​	所谓对这个信源的输出进行编码，就是用一个新的符号表$B$的符号序列集合$V$来表示信源输出的符号序列集合$U$。若$V$的各个序列的长度等于$N$，即式中新的符号表$B$共含$L$个符号，$B=\\{b_l|l=1,...,L\\}$。它总过可以编出$LN$个不同的码字。

​	类似地，记$||V||=LN$。

​	为了使信源的每个输出符号序列都能分配到一个独特的码字与之对应，至少应满足关系$||V||=LN\geqslant||U||=KM$或$\frac{N}{M}\geqslant \frac{logK}{logL}$。

​	假如编码符号表$B$的符号数$L$与信源符号表$A$的符号数$K$相等，则编码后的码字序列的长度$N$必须大于或等于心愿输出符号序列的长度$M$;繁殖，若有$N=M$，则必有$L\geqslant K$。只有满足这些条件，才能保证无差错地还原出原来的信源输出序列的每个符号所载荷的平均信息量（码字的唯一可译型）。可是在这些条件下，码字序列的每个码元所载荷的平均信息量不但不能高于，反而会低于信源输出序列的每个符号所荷载的平均信息量。这与编码的基本目的相矛盾，上文提到的编码定理提供了解决矛盾的方法，技能改善信息载荷效率，又能保证码字的唯一可译性。

### 3.1.6 赫夫曼编码

​	首先把信源的各个输出符号序列按概率递降的顺序排列起来，求其中概率最小的两个序列的概率之和，并把这个概率之和看作是一个符号序列的概率，再与其他序列依概率递降顺序排列（参与求概率之和的这两个序列不再出现在新的排列之中），然后，对参与概率求和的两个符号序列分别赋予二进制数字0和1。继续这样的操作,直到剩下一个以1为概率的符号序列。最后，按照与编码过程相反的顺序读出各个符号序列所对应的二进制数字组，就可分别得到各该符号序列的码字。

​	例.假设要传输的字符串为i like like like java do you like a java

+ 统计各个字符对应的个数

  d:1 y:1 u:1 j:2 v:2 o:2 l:4 k:4 e:4 i:5 a:5  :9 

+ 按照上面字符出现的次数构建一颗赫夫曼树，次数作为权值（如图18所示）

  + 从小到大排序，每个数据都是一个节点，每个节点可以看成是一棵最简单的二叉树
  + 取出根节点权值最小的两棵二叉树；
  + 组成一棵新的二叉树，该新的二叉树的根节点的权值是前面两棵二叉树根节点权值的和；
  + 再将这棵新的二叉树，一根结点的权值大小再次排序，不断重复，直到数列中所有的数据都被处理，就得到一棵赫夫曼树。

+ 根据赫夫曼树，给各个字符规定编码（前缀编码），向左的路径为，向右的路径为1

  + 编码如下
  + o:1000 u:10010 d:100110 y:100111 i:101 a:110 k:1110 e:1111 j:0000 v:0001 l:001  :01

+ 按照上面的赫夫曼编码，处理字符串

![赫夫曼树](赫夫曼树.png)

<div align = "center">图18 赫夫曼树</div>

## 4. 信道编码

### 4.1.1 概念

**信道编码器：**信道编码器是针对信道对传输信号的损伤而设置的一个功能部件，通过对信息序列进行编码的方式来提高接收机识别差错的能力，从而降低误码率以改善恢复信息的质量。它的作用有：加密；根据传播介质特点变更数字信号。

**信道编码：**通过信道编码器和译码器实现的用于提高信道可靠性的理论和方法；由于移动通信存在干扰和衰落，在信号传输过程中将出现差错，故对数字信号必须采用纠、检错技术，即纠、检错编码技术，以增强数据在信道中传输时抵御各种干扰的能力，提高系统的可靠性。对要在信道中传送的数字信号进行的纠、检错编码就是信道编码。

### 4.1.2 目的

+ 信道编码定理，从理论上解决理想编码器、译码器的存在性问题，也就是解决信道能传送的最大信息绿的可能性和超过这个最大值的传输问题。
+ 构造性的编码方法以及这些方法能达到的性能界限
+ 使系统具有一定的纠错能力和抗干扰能力，可极大地避免码流传送中误码的发生

### 4.1.3 分类

+ 分组码
+ 卷积码

### 4.1.4 纠错编码

+ [RS编码](https://blog.csdn.net/qq_41196472/article/details/114284108)
+ [卷积码](https://blog.csdn.net/zhouxuanyuye/article/details/73729754)
+ [Turbo码](https://blog.csdn.net/zhouxuanyuye/article/details/78379330?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522165823509116781790727094%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=165823509116781790727094&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-78379330-null-null.142^v32^experiment_2_v1,185^v2^control&utm_term=Turbo%E7%A0%81&spm=1018.2226.3001.4187)
+ GSM系统中的信道编码
+ IS-95系统中的信道编码
+ [交织](https://blog.csdn.net/qq_42479987/article/details/108876342?ops_request_misc=&request_id=&biz_id=102&utm_term=%E4%BA%A4%E7%BB%87&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-108876342.142^v32^experiment_2_v1,185^v2^control&spm=1018.2226.3001.4187)
+ [伪随机序列扰码](https://blog.csdn.net/HiWangWenBing/article/details/109560830?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522165823522816782390584679%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=165823522816782390584679&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-2-109560830-null-null.142^v32^experiment_2_v1,185^v2^control&utm_term=%E4%BC%AA%E9%9A%8F%E6%9C%BA%E5%BA%8F%E5%88%97%E6%89%B0%E7%A0%81&spm=1018.2226.3001.4187)

## 5. 参考资料

1. [GNU Radio AM调制解调（一）_开源SDR实验室的博客-CSDN博客](https://blog.csdn.net/OpenSourceSDR/article/details/108886301)
2. [QT GUI Tab Widget - GNU Radio](https://wiki.gnuradio.org/index.php/QT_GUI_Tab_Widget)
3. [QT GUI Time Sink - GNU Radio](https://wiki.gnuradio.org/index.php/QT_GUI_Time_Sink)
4. [重采样_百度百科 (baidu.com)](https://baike.baidu.com/item/%E9%87%8D%E9%87%87%E6%A0%B7/4949402)
5. [FM数字解调过程中为什么使用降采样？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/52541119#:~:text=%E6%94%B9%E5%8F%98%E9%87%87%E6%A0%B7%E7%8E%87%EF%BC%8C%E5%8F%AF%E4%BB%A5,%E6%98%AF%E9%99%8D%E4%BD%8E%E9%87%87%E6%A0%B7%E7%8E%87%E4%BA%86%E3%80%82)
6. [信源编码_百度百科 (baidu.com)](https://baike.baidu.com/item/%E4%BF%A1%E6%BA%90%E7%BC%96%E7%A0%81/3216745#:~:text=%E4%BF%A1%E6%BA%90%E7%BC%96%E7%A0%81%E6%98%AF%E4%B8%80%E7%A7%8D%E4%BB%A5,%E7%9A%84%E4%BF%A1%E6%BA%90%E7%AC%A6%E5%8F%B7%E5%8F%98%E6%8D%A2%E3%80%82)
7. [信源_百度百科 (baidu.com)](https://baike.baidu.com/item/%E4%BF%A1%E6%BA%90/9032775)
8. [信源剩余度_百度百科 (baidu.com)](https://baike.baidu.com/item/%E4%BF%A1%E6%BA%90%E5%89%A9%E4%BD%99%E5%BA%A6/19141008)
9. [渐近等分性_百度百科 (baidu.com)](https://baike.baidu.com/item/%E6%B8%90%E8%BF%91%E7%AD%89%E5%88%86%E6%80%A7)
10. [克拉夫特不等式_百度百科 (baidu.com)](https://baike.baidu.com/item/%E5%85%8B%E6%8B%89%E5%A4%AB%E7%89%B9%E4%B8%8D%E7%AD%89%E5%BC%8F)
11. [ 赫夫曼编码_chengqiuming的博客-CSDN博客_霍夫曼编码](https://blog.csdn.net/chengqiuming/article/details/115052522)
12. [信道编码_百度百科 (baidu.com)](https://baike.baidu.com/item/%E4%BF%A1%E9%81%93%E7%BC%96%E7%A0%81/9968814)
13. [信道编码器_百度百科 (baidu.com)](https://baike.baidu.com/item/%E4%BF%A1%E9%81%93%E7%BC%96%E7%A0%81%E5%99%A8/3990122)
14. [ RS编码过程通俗理解__Celeste_的博客-CSDN博客_rs编码](https://blog.csdn.net/qq_41196472/article/details/114284108)
15. [卷积码_百度百科 (baidu.com)](https://baike.baidu.com/item/%E5%8D%B7%E7%A7%AF%E7%A0%81/7212542)
16. [卷积码（Convolutional Code）_纸上谈芯的博客-CSDN博客_卷积码](https://blog.csdn.net/zhouxuanyuye/article/details/73729754)
17. [Turbo码（Turbo Codes）_纸上谈芯的博客-CSDN博客_turbo码](https://blog.csdn.net/zhouxuanyuye/article/details/78379330?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522165823509116781790727094%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=165823509116781790727094&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-78379330-null-null.142^v32^experiment_2_v1,185^v2^control&utm_term=Turbo%E7%A0%81&spm=1018.2226.3001.4187)
18. [通信中的“交织”技术_super尚的博客-CSDN博客_交织技术](https://blog.csdn.net/qq_42479987/article/details/108876342?ops_request_misc=&request_id=&biz_id=102&utm_term=%E4%BA%A4%E7%BB%87&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-108876342.142^v32^experiment_2_v1,185^v2^control&spm=1018.2226.3001.4187)
19. [ 星星之火-30：什么是WCDMA的伪随机码与扰码？_文火冰糖的硅基工坊的博客-CSDN博客_wcdma 扰码](https://blog.csdn.net/HiWangWenBing/article/details/109560830?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522165823522816782390584679%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=165823522816782390584679&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-2-109560830-null-null.142^v32^experiment_2_v1,185^v2^control&utm_term=%E4%BC%AA%E9%9A%8F%E6%9C%BA%E5%BA%8F%E5%88%97%E6%89%B0%E7%A0%81&spm=1018.2226.3001.4187)

<center><center/>

![EMT](EMT.jpg)