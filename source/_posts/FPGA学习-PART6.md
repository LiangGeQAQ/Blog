---
title: FPGA学习.PART6
mathjax: true
date: 2023-03-01 19:15:24
tags: [FPGA,探针,VIO]
categories: [FPGA]
comment: true
---
# 学习和使用VIO_IP

## 1. 概述

> VIO是 Virtual Input/Output 的缩写，是Vivado提供的一个IP核；
>
> 可以用于驱动FPGA的内部信号，并监测其内部特征，
>
> 也就是实时监测FPGA内部信号，并输出FPGA的控制到其他模块，或者是直接是输出到管脚上。

## 2. 实验步骤

### 2.1 新建工程

之前我们在选芯片型号时一直都是直接选用的版型，因为其预含了芯片的型号等，我们也可以直接通过筛选来进行选择，如下图所示；

<div align = "center"><img src="选择芯片.png"  width=""  height = "" /></div>

### 2.2 新建块设计

左侧工作区IP Integrator -> Create Block Design，如下图位置

<div align = "center"><img src="新建块设计.png"  width=""  height = "" /></div>

新建块设计后，添加IP核，搜索 VIO 调用此IP核，如下图所示

<div align = "center"><img src="调用VIO.png"  width=""  height = "" /></div>

双击打开IP核，如下图所示，其中 Input Probe Count 为输入探针数，最多可以有0 ~ 256组输入，每组输入最多有1 ~ 256位，其中 Activity Detectors 为活跃检测，修改输入输出探针数各为1，位宽为8，将输入初始值改为 0x0F ，使高四位为0，低四位为1，

<div align = "center"><img src="IP核参数.png"  width=""  height = "" /></div>

如下所示，点击端口使用快捷键，Crtl + T即可引出引脚，

<div align = "center"><img src="快捷键.png"  width=""  height = "" /></div>

### 2.3 封装设计

保存文件后，进入左上角工作区，选中保存后的块设计，如下图所示，并右键选择 Create HDL Wrapper，

<div align = "center"><img src="hdl_wrapper.png"  width=""  height = "" /></div>

若要对顶层文件进行修改，一定要选择上方的选项，即 Copy generated wrapper to allow user edits，若选择下方的选项，则修改文件无法生效.

我们将输入输出名称更改为我们所需要的，并同时在例化代码处进行更改，代码如下

```verilog
`timescale 1 ps / 1 ps

module design_1_wrapper
   (clk,
    SW,
    LED );
  input clk;
  input [7:0]SW;
  output [7:0]LED;


  design_1 design_1_i
       (.clk(clk),
        .probe_in0_0(SW),
        .probe_out0_0(LED));
endmodule
```

### 2.4 新建约束文件

引脚约束文件如下，

```verilog
set_property PACKAGE_PIN Y9 [get_ports {clk}]
set_property IOSTANDARD LVCMOS33 [get_ports {clk}]

set_property PACKAGE_PIN T22  [get_ports {LED[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[0]}]

set_property PACKAGE_PIN  T21  [get_ports {LED[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[1]}]
set_property PACKAGE_PIN U22  [get_ports {LED[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[2]}]
set_property PACKAGE_PIN U21  [get_ports {LED[3]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[3]}]
set_property PACKAGE_PIN V22 [get_ports {LED[4]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[4]}]
set_property PACKAGE_PIN W22  [get_ports {LED[5]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[5]}]
set_property PACKAGE_PIN U19  [get_ports {LED[6]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[6]}]
set_property PACKAGE_PIN U14  [get_ports {LED[7]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[7]}]

set_property PACKAGE_PIN F22  [get_ports {SW[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[0]}]
set_property PACKAGE_PIN G22  [get_ports {SW[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[1]}]
set_property PACKAGE_PIN H22  [get_ports {SW[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[2]}]
set_property PACKAGE_PIN F21  [get_ports {SW[3]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[3]}]
set_property PACKAGE_PIN H19  [get_ports {SW[4]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[4]}]
set_property PACKAGE_PIN H18  [get_ports {SW[5]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[5]}]
set_property PACKAGE_PIN H17   [get_ports {SW[6]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[6]}]
set_property PACKAGE_PIN M15   [get_ports {SW[7]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[7]}]
```

### 2.5 生成比特流文件

左侧工作区 PROGRAM AND DEBUG -> Generate Bitsteram，生成比特流文件时 Vivado 会进行分析、综合、实施、debug 等一系列操作，省去了我们一步一步点的步骤。

### 2.6 烧录调试以及探针的使用

FPGA 上电，连接电脑，左侧工作区打开 Hardware Manager ，点击 Auto connect 进行连接，右键选择要进行调试的 FPGA ，点击 Program Device ，其中下方的 Debug

 probes file 为调试的探针文件，如下图

<div align = "center"><img src="烧录调试.png"  width=""  height = "" /></div>

左上角 Hardware 工作区出现 hw_vio_1 的选项，如下图

<div align = "center"><img src="调试.png"  width=""  height = "" /></div>

右键能够查看其属性，并能进一步进行操作，选择 Dashboard -> New Dashboard，仅选择VIO，点击加号添加探针，将 in 与 out 加入监测，如下图

<div align = "center"><img src="添加探针.png"  width=""  height = "" /></div>

此时我们观察 FPGA 上的亮灯情况，如下图，为高四位LED灭，低四位LED亮，

<div align = "center"><img src="运行结果.jpg"  width=""  height = "" /></div>

此时探针的值如下图所示，与板上LED亮灭所对应，

<div align = "center"><img src="探针值.png"  width=""  height = "" /></div>

针对某一Value可以右键将其设置为文本显示高低电平或是以LED的形式展示高低电平，如下图中将低电平设为灰色LED，高电平设为红色LED，我们拨动开关可以看到Vivado中数值发生的变化，以LED的形式展现出来，

同时我们能够更改输出值，以使 FPGA 上的 LED 灯亮灭发生改变，分别如下两张图片所示

<div align = "center"><img src="LED显示电平.png"  width=""  height = "" /></div>

<div align = "center"><img src="更改输出值.jpg"  width=""  height = "" /></div>

右键输出值，选择 Active-High Button，可以使我们按下按钮时，输出高电平，抬起时为0，或是 Toggle Button 使其变为开关式按钮，在按下时改变状态，以便于调试（此处展示省略，主要是懒得拍视频…( •̀ ω •́ )✧）

同时我们还能添加探针，显示 XADC 也就是核心板的各项数据，如温度，核心电压等，如下图所示，

<div align = "center"><img src="显示核心板数据.png"  width=""  height = "" /></div>

## 3. 总结模块作用

+ 作为激励作为外部模块的输入
+ 协助调试
+ 初始化输出可视为跳线使用

> 关于模块使用，应当阅读其文档介绍，了解其特性以及常见作用，以快速的了解并上手新的模块。

<div align = "center"><img src="EMT.jpg"  width=""  height = "" /></div>