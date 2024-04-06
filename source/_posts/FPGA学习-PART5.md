---
title: Vivado下的逻辑仿真实验
mathjax: true
date: 2023-03-01 15:58:19
tags:  [FPGA,逻辑仿真]
updated: 2023-03-06 00:42:50
categories: [FPGA]
comment: true
---

# FPGA学习.PART5

## 1. 概述

> 在此次实验中仅使用FPGA的PL部分，适用于所有可以在Vivado中使用的FPGA
>
> FPGA设计至少包含两部分文件：硬件描述文件、引脚约束文件；
>
> 逻辑仿真旨在通过生成激励信号，观察输出是否符合预期，
>
> 并进一步分析模块设计的合理性；

## 2. 实验步骤

### 2.1 新建工程（略）

### 2.2 创建硬件描述文件

文件代码如下，一个简易的38译码器，将 1 左移 SW 位，并输出左移后的八位 LED 寄存器；

```verilog
module dec38(
    input [2:0] SW,
    output [7:0]LED
    );
    assign LED = 1 << SW;
endmodule
```

### 2.3 创建引脚约束文件

文件代码如下，很冗杂手敲容易出错，

```verilog
#set_property PACKAGE_PIN Y9 [get_ports {clk}]
#set_property IOSTANDARD LVCMOS33 [get_ports {clk}]

set_property PACKAGE_PIN T22 [get_ports {LED[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[0]}]
set_property PACKAGE_PIN T21 [get_ports {LED[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[1]}]
set_property PACKAGE_PIN U22 [get_ports {LED[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[2]}]
set_property PACKAGE_PIN U21 [get_ports {LED[3]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[3]}]
set_property PACKAGE_PIN V22 [get_ports {LED[4]}
set_property IOSTANDARD LVCMOS33 [get_ports {LED[4]}]
set_property PACKAGE_PIN W22 [get_ports {LED[5]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[5]}]
set_property PACKAGE_PIN U19 [get_ports {LED[6]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[6]}]
set_property PACKAGE_PIN U14 [get_ports {LED[7]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[7]}]

set_property PACKAGE_PIN F22 [get_ports {SW[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[0]}]
set_property PACKAGE_PIN G22 [get_ports {SW[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[1]}]
set_property PACKAGE_PIN H22 [get_ports {SW[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {SW[2]}]
```

### 2.4 创建仿真激励文件

文件代码如下，从 0 到 7更改寄存器 sw 中的值，

```verilog
`timescale 1ns / 1ps //时间标尺 时间单位/精度

module decoder38_top;
reg [2:0] sw;
wire [7:0] led;

initial begin
     sw = 0;
#100 sw = 1;//经过100个时间单位，即100ns，其中精度为1ps，将sw寄存器值设置为1
#100 sw = 2;
#100 sw = 3;
#100 sw = 4;
#100 sw = 5;
#100 sw = 6;
#100 sw = 7;
#100;
    
$stop;//仿真激励停止
    
end
//模块例化，类比放置元件，引出输入输出
dec38 u1 (
    .SW(sw),
    .LED(led)
);
endmodule
```

### 2.5 进行仿真

左侧工作区，RTL Analysis -> Elaborated Design 展开，选择 Schematic 即可生成原理图；

如下图所示，

<div align = "center"><img src="生成原理图.png"  width=""  height = "" /></div>

左侧工作区，SYNTHESIS -> Open Synthesized Design展开，选择 Schematic 即可生成综合后的原理图，如下图所示，

<div align = "center"><img src="综合后的原理图.png"  width=""  height = "" /></div>

左侧工作区，SIMULATION -> Run Simulation 选择 Run Post-Implementation Timing Simulation即执行后的时序仿真，也是最接近真实的时序波形；

相比较之下，其他几个选项分别对应：

+ behavioral simulation	行为级仿真，也就是功能仿真
+ Post-Synthesis Function Simulation  综合后的功能能仿真
+ Post-Synthesis Timing Simulation     综合后带时序信息的仿真
+ Post-Implementation Function Simulation  布线后的功能仿真

行为仿真如下图，明显无延迟，为功能性仿真；

<div align = "center"><img src="行为仿真.png"  width=""  height = "" /></div>

实现后的时序仿真如下图，

<div align = "center"><img src="时序仿真.png"  width=""  height = "" /></div>

存在较为明显的时延与跳变，综合而言能够符合设计预期，

是一个能够正常进行工作的38译码器。

### 2.6 上板观察现象

左侧工作区，PROGRAM AND DEBUG -> Open Hardware Manager 打开硬件管理，自动连接设计好的文件，烧录文件观察现象。拨动 开关 0 ~ 3 LED 的亮灭符合我们的预期。（较为简易，视频/GIF就不放了）

<div align = "center"><img src="EMT.jpg"  width=""  height = "" /></div>