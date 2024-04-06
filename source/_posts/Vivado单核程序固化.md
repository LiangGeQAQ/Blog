---
title: Vivado单核程序固化
mathjax: true
date: 2023-03-13 22:54:38
tags: [FAPG,Vivado,固化]
updated: 2023-03-13 22:59:25
categories: [FPGA]
comment: true
---
# Vivado单核程序固化

> By Vivado 2018.3
>
> On Zedboard

## 1. 配置 QSPI FLASH 接口

打开 ZYNQ7 的 Re-customize IP，进行如下配置，

<div align = "center"><img src="QSPI FLASH.png"  width=""  height = "" /></div>

QSPI 频率默认为 200 需要改为 125，还有系统晶振不要配置错了，

<div align = "center"><img src="clock.png"  width=""  height = "" /></div>

## 2. 新建 FSBL 工程

更改完毕后，生成比特流文件，export 到 SDK 内，新建工程文件

File -> New -> Application Project

<div align = "center"><img src="新建FSBL.png"  width=""  height = "" /></div>

工程名称为 FSBL ，将类型选为 Zynq FSBL，

<div align = "center"><img src="新建FSBL_1.png"  width=""  height = "" /></div>

<div align = "center"><img src="新建FSBL_2.png"  width=""  height = "" /></div>

## 3. 生成 *.bin 文件

选择要固化的工程，生成 *.bin 文件，

右键需要固化的工程，点击 Create Boot Image ，

<div align = "center"><img src="生成bin.png"  width=""  height = "" /></div>

在新建的窗口中出现 FSBL.elf 、 *.bit 、 *.elf 三个文件用于制作镜像文件，点击 Create Image 即可完成 Boot.bin 的创建，可用于 SD 卡启动文件 和 SPI 启动文件，

<div align = "center"><img src="CreateImage.png"  width=""  height = "" /></div>

## 4. 添加环境变量

从 Vivado 2017.4 开始， Xilinx 官方为了使 Zynq-7000 和 Zynq UltraScale + 实现流程相同，在 QSPI FLASH 上做了变化，使 Zynq-7000 变成需要指定的 “fsbl”，这个 fsbl 用于初始化系统（主要使运行ps7_init()），Xilinx 官网中 Xilinx Answer70548 和 Xilinx Answer 70148 提供了 Vivado 17.3 QSPI FLASH 下载方法；

首先新建环境变量，

由于本人使用的是 Win11 ，此处提供 Win 11 操作方式，其他系统类似，

打开设置，点击 ‘系统“ ，滑到最底部，点击 ”系统信息“ -> “高级系统设置”

<div align = "center"><img src="环境变量.png"  width=""  height = "" /></div>



”高级“ -> ”环境变量“，添加如下变量到系统变量中

```
变量名：XIL_CSE_ZYNQ_UBOOT_QSPI_FREQ_HZ
变量值：10000000
```

<div align = "center"><img src="添加环境变量.png"  width=""  height = "" /></div>

## 5. 生成加载 QSPI FLASH 的 fsbl 文件

新建一个 FSBL 工程，工程文件命名为 zynq_fsbl ；

流程同 #2. 新建 FSBL 工程；

打开 zynq_fsbl 的 main.c 文件 ，在此处添加

```c
BootModeRegister = JTAG_MODE;
```

<div align = "center"><img src="修改mode.png"  width=""  height = "" /></div>

## 6. 烧录固化

将跳线帽改为 QSPI 启动模式，

跳线帽模式如下表所示，

<div align = "center"><img src="zedboard跳线帽设置.png"  width=""  height = "" /></div>

开发板上电，Xilinx -> Program Flash ，

<div align = "center"><img src="programFLASH.png"  width=""  height = "" /></div>

选择刚才的 BOOT.BIN 和 zynq_fsbl.elf ，分别在需要固化文件目录下的 \\bootimage\\BOOT.bin 和 \\zynq_fsbl\\Debug\\zynq_fsbl.elf ，记得把下面的 Blank check after erase 和 Venify after flash √上

<div align = "center"><img src="烧录.png"  width=""  height = "" /></div>

最后 Program 等待就ok了，这样板子掉电以后仍能运行我们烧写的程序。





<div align = "center"><img src="EM.jpg"  width=""  height = "" /></div>