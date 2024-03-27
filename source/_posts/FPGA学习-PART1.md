---
title: 使用PL创建一个流水灯
mathjax: true
date: 2022-10-09 22:37:45
tags: [FPGA,ZedBoard,流水灯] 
updated: 2022-10-14 20:36:30
categories: [FPGA]
comment: true
---
# FPGA学习.PART1

## 1.1 概念

> PL 即 Programmable Logic 的缩写，意为可编程逻辑部分，此部分即将**ZYNQ7**当作一个单纯的FPGA来使用.

## 1.2 新建项目

新建项目时需要注意的事项：

+ 项目路径中不能包含中文

+ <div align = "center"><img src="新建项目选择语言.png"  width="800"  height = "600" /></div>

  选择项目语言为**Verilog**

+ 选择板子时可在此界面选**Boards**便可直接找到**ZedBoard**

  <div align = "center"><img src="选择ZedBoard.png"  width="800"  height = "600" /></div>

  或是按如下方法进行筛选找到所需要的芯片：

  <div align = "center"><img src="芯片选择.png"  width="800"  height = "600" /></div>

## 1.3 文件组成

FPGA工程文件主要存在两种：

+ 逻辑部分（Design Sources）
+ 约束部分（Constrains）（即引脚对应文件）

## 1.4 创建文件

右键**Design Sources**选择最底部的**Add sources**，之后再**Create File**；

创建完毕后放回主界面，打开新建的文件可以在应用右上角进行预览；

之后就是敲代码的部分了；

## 1.5 亮灯程序

亮灯程序如下所示：

```verilog
module PL_LED(
 input clk,
 input rst,
 output	reg [7:0]LED
);
reg [31:0]	cntr;
always @ (posedge clk)
    if ( rst ) 
		cntr <= 0;
	else 
		cntr <= cntr + 1;
always @ (posedge clk)
	LED <= cntr[24:17] ;
endmodule

```



## 1.6 添加引脚文件

引脚文件代码如下：

```verilog
set_property PACKAGE_PIN Y9 [get_ports {clk}]
set_property IOSTANDARD LVCMOS33 [get_ports {clk}]

set_property PACKAGE_PIN N15 [get_ports {rst}]
set_property IOSTANDARD LVCMOS18 [get_ports {rst}]

set_property PACKAGE_PIN T22 [get_ports {LED[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[0]}]

set_property PACKAGE_PIN T21 [get_ports {LED[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[1]}]

set_property PACKAGE_PIN U22 [get_ports {LED[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[2]}]

set_property PACKAGE_PIN U21 [get_ports {LED[3]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[3]}]

set_property PACKAGE_PIN V22 [get_ports {LED[4]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[4]}]

set_property PACKAGE_PIN W22 [get_ports {LED[5]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[5]}]

set_property PACKAGE_PIN U19 [get_ports {LED[6]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[6]}]

set_property PACKAGE_PIN U14 [get_ports {LED[7]}]
set_property IOSTANDARD LVCMOS33 [get_ports {LED[7]}]
```

**IOSTANDARD LVCMOS33** 意为电平标准为3.3V，

这一部分数据需要参考原理图得出；

**附.LED在板上的引脚对应表格**

<div align = "center"><img src="LEDS_PINS.png"  width=""  height = "" /></div>

## 1.7 烧录文件

点击下图按钮以生成比特流文件，要是编译出错了指定是那个地方代码抄错了，回去再看看

<div align = "center"><img src="生成比特流文件.png"  width=""  height = "" /></div>

编译完成以后会出现弹窗，此时选择如图所示的**Open Hardware Manager**

<div align = "center"><img src="编译完成弹窗.png"  width=""  height = "" /></div>

之后显示**No hardware**时，点击**Open target**添加硬件版，

若**HW**中找不到硬件版，是由于任务管理器的进程中，hw_server.exe一直在执行，需要将其关掉，若还不可检测到硬件版，只需要重启电脑；

如果还没有，看一下是不是接线接少了…我在这个部分卡了半个小时，试遍了所有方式发现我**PROG**这个接口没有接线！（是的，蠢到我了…！）接线如下图所示

<div align = "center"><img src="接线.jpg"  width="500"  height = "800" /></div>

成功找到硬件后**HW**会如图所示：

<div align = "center"><img src="成功找到硬件.png"  width=""  height = "" /></div>

其中，**arm_dap_0**为32位arm即PS部分，而**xc7z020**为PL部分，

关联文件路径则在下方窗口中能够找到，右键此部分点击**Program Device**即可将程序写入板子中

<div align = "center"><img src="关联文件路径.png"  width=""  height = "" /></div>

最后的运行如下所示：

<div align = "center"><img src="PL_LED.gif"  width=""  height = "" /></div>

参考网站：

1. [ Vivado+Zedboard之流水灯例程](https://blog.csdn.net/weixin_42639919/article/details/81130581)



<div align = "center">Lucy！！！</div>

<div align = "center"><img src="lucy3.jpg"  width="500"  height = "900" /></div>

