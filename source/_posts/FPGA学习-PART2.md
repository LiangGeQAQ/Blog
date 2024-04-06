---
title: PS部分HELLO_WORLD
mathjax: true
date: 2022-10-14 20:17:31
tags: [FPGA,PS,SDK]
<<<<<<< HEAD
updated: 2023-03-03 16:13:09
=======
>>>>>>> parent of 4e04eaf (uptate)
categories: [FPGA]
comment: true
---
# FPGA学习.PART2

## 1. 概述

> PS是Processer system的缩写，即处理器系统，此次实验将ZYNQ7当作一个ARM处理器进行设计。
>
> 先在Vivado中配置处理器，再在SDK中设计软件。

## 2. 实验流程

### 2.1 新建工程

新建工程步骤见[Part1](https://www.liliaw.com/2022/10/09/FPGA%E5%AD%A6%E4%B9%A0-PART1/).

### 2.2 创建IP核

点击如图按钮，创建块设计

<div align = "center"><img src="ip核.png"  width=""  height = "" /></div>

再点击加号新建设计，搜索“ZYNQ7”，选择 “ZYNQ7 Processing System”

<div align = "center"><img src="新建block_design.png"  width=""  height = "" /></div>

点击此工作区上方的“Run Block Automation”，导入新建工程时选择的 Zedboard 的预设参数，

导入成功后，双击模块，将不需要使用的引脚进行关闭（否则需要进行相应处理操作），

所以只需要留下UART 1引脚，而将其他所有引脚关闭，完成点击ok后如下图所示：

<div align = "center"><img src="仅开启UART.png"  width=""  height = "" /></div>

### 2.3 生成输出文件

在左上角工作区，点击 “Source” 右键我们创建的设计文件，选择“Generate Output Products”，进行生成.

### 2.4 创建模块

为了方便顶层文件设计调用，还可以右键点击 “Create HDL Wrapper” ，生成模块

### 2.5 导入SDK

若除 PS 外还另有 PL 设计，则生成相应的比特流文件(方法见[Part1](https://www.liliaw.com/2022/10/09/FPGA%E5%AD%A6%E4%B9%A0-PART1/)），

点击 “File -> Export -> Export Hardware for SDK”，然后再启动SDK.

PS通过 c 、tcl 文件等 写寄存器进行进行初始化、检采等配置

### 2.6 新建SDK文件

“File -> New ->  Applicationg Project”，默认状态下即可继续，选择“Hello world”，并结束确认。

右键项目“Run As -> Launch on Hardware(GDB)”，

在运行之前需要将比特流文件写入 FPGA 中，“Xilinx -> Program FPGA”选择 .hex 的路径

### 2.7 烧录并观察现象

在工作区（SDK）下方，选择 “SDK Terminal”，点击加号，添加串口，波特率设置为115200，点击运行，可以观察到串口的输出如下图

<div align = "center"><img src="串口Hello.png"  width=""  height = "" /></div>



<div align = "center"><img src="lucy4.jpg"  width=""  height = "" /></div>