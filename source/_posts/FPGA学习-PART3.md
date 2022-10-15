---
title: FPGA学习.PART3
mathjax: true
date: 2022-10-15 21:03:24
tags: [FPGA,PS,PL,GPIO]
categories: [FPGA]
comment: true
---
# PS与PL协同设计实现GPIO

## 1. 概述

> ZYNQ7的逻辑部分PL与处理器部分PS协同工作，才能体现其强大，
>
> 在本实例中将FPGA当作一个PS处理器的外设，通过寄存器地址映射到PS的寻址空间，
>
> 在处理器中使用C程序访问这些寄存器，来实现软件和逻辑结合的协同设计效果

## 2. 实验流程

## 2.1 新建Block Design

放入ZYNQ7处理器，并导入Zedboard配置，方法见[Part2](https://www.liliaw.com/2022/10/14/FPAG%E5%AD%A6%E4%B9%A0-PART2/).

### 方法一：手动连接

本次实验中PS部分仅用到 UART1、FCLK_CLK0（配置为100M）、FCLK_RESET0、M_AXI_GP0_ACLK端口，

检采完毕后如下图所示：

<div align = "center"><img src=""  width=""  height = "" /></div>ZYNQ7.png

之后搜索（快捷键Ctrl + I）复位模块（reset），如下图所示：

<div align = "center"><img src="reset.png"  width=""  height = "" /></div>

然后是interconnect模块，其功能是将多路的AXI接口转化为多路的AXI接口（多对多，也可以是一对多）：

<div align = "center"><img src="AXI_INTERCONNET.png"  width=""  height = "" /></div>

继续添加GPIO模块：

<div align = "center"><img src="GPIO.png"  width=""  height = "" /></div>

按照下图进行连线：

<div align = "center"><img src="IP连线.png"  width=""  height = "" /></div>

双击GPIO_1进行如下配置（设置为8位），此为LED寄存器

<div align = "center"><img src="LED.png"  width=""  height = "" /></div>

同理配置GPIO_0（输入8位）

<div align = "center"><img src="SW.png"  width=""  height = "" /></div>

选择GPIO的输出端口（右侧），右键进行拓展（Make External，快捷键Ctrl + T），此时已经布局完毕，右键选择 **“Regenerate Layout”** 重新进行布局

### 方法二：自动连接

Vivado具有自动连接并放置模块的功能，我们可以只调出两个GPIO模块并拓展其输出，点击工作区上方的 **“Run Connection Automation”**，选择全部模块点击“OK”，便会自动帮我们添加AXI总线（互联）以及复位模块等.

## 2.2 修改引脚约束

### 方法一：修改TOP使其与XDC一致

完成互联后，右键工程（位于Design Sources）选择**“Create HDL Wrapper”**，因为LED自动生成的引脚会造成 XDC文件（约束文件）与TOP 文件不一致，所以此时选择 **“Copy generated wrapper to allow user edits”** 以方便我们进行编辑；

生成Verilog文件后，我们可以将代码中的端口声明 led_tri_o 换为 LED，将 sw_tri_i 换为 SW（输入输出声明处保持一致）

在声明wire类型处，添加

```verilog
assign LED = led_tri_o;
assign SW = sw_tri_i;
```

或是直接更改网络名称（就是代码最下面的那一块），最终代码如下：

```verilog
module design_1_wrapper
   (DDR_addr,
    DDR_ba,
    DDR_cas_n,
    DDR_ck_n,
    DDR_ck_p,
    DDR_cke,
    DDR_cs_n,
    DDR_dm,
    DDR_dq,
    DDR_dqs_n,
    DDR_dqs_p,
    DDR_odt,
    DDR_ras_n,
    DDR_reset_n,
    DDR_we_n,
    FIXED_IO_ddr_vrn,
    FIXED_IO_ddr_vrp,
    FIXED_IO_mio,
    FIXED_IO_ps_clk,
    FIXED_IO_ps_porb,
    FIXED_IO_ps_srstb,
    LED,
    SW);
  inout [14:0]DDR_addr;
  inout [2:0]DDR_ba;
  inout DDR_cas_n;
  inout DDR_ck_n;
  inout DDR_ck_p;
  inout DDR_cke;
  inout DDR_cs_n;
  inout [3:0]DDR_dm;
  inout [31:0]DDR_dq;
  inout [3:0]DDR_dqs_n;
  inout [3:0]DDR_dqs_p;
  inout DDR_odt;
  inout DDR_ras_n;
  inout DDR_reset_n;
  inout DDR_we_n;
  inout FIXED_IO_ddr_vrn;
  inout FIXED_IO_ddr_vrp;
  inout [53:0]FIXED_IO_mio;
  inout FIXED_IO_ps_clk;
  inout FIXED_IO_ps_porb;
  inout FIXED_IO_ps_srstb;
  output [7:0]LED;
  input [7:0]SW;

  wire [14:0]DDR_addr;
  wire [2:0]DDR_ba;
  wire DDR_cas_n;
  wire DDR_ck_n;
  wire DDR_ck_p;
  wire DDR_cke;
  wire DDR_cs_n;
  wire [3:0]DDR_dm;
  wire [31:0]DDR_dq;
  wire [3:0]DDR_dqs_n;
  wire [3:0]DDR_dqs_p;
  wire DDR_odt;
  wire DDR_ras_n;
  wire DDR_reset_n;
  wire DDR_we_n;
  wire FIXED_IO_ddr_vrn;
  wire FIXED_IO_ddr_vrp;
  wire [53:0]FIXED_IO_mio;
  wire FIXED_IO_ps_clk;
  wire FIXED_IO_ps_porb;
  wire FIXED_IO_ps_srstb;
  /*
  wire [7:0]led_tri_o;
  wire [7:0]sw_tri_i;

  assign LED = led_tri_o;
  assign SW = sw_tri_i;
*/
  design_1 design_1_i
       (.DDR_addr(DDR_addr),
        .DDR_ba(DDR_ba),
        .DDR_cas_n(DDR_cas_n),
        .DDR_ck_n(DDR_ck_n),
        .DDR_ck_p(DDR_ck_p),
        .DDR_cke(DDR_cke),
        .DDR_cs_n(DDR_cs_n),
        .DDR_dm(DDR_dm),
        .DDR_dq(DDR_dq),
        .DDR_dqs_n(DDR_dqs_n),
        .DDR_dqs_p(DDR_dqs_p),
        .DDR_odt(DDR_odt),
        .DDR_ras_n(DDR_ras_n),
        .DDR_reset_n(DDR_reset_n),
        .DDR_we_n(DDR_we_n),
        .FIXED_IO_ddr_vrn(FIXED_IO_ddr_vrn),
        .FIXED_IO_ddr_vrp(FIXED_IO_ddr_vrp),
        .FIXED_IO_mio(FIXED_IO_mio),
        .FIXED_IO_ps_clk(FIXED_IO_ps_clk),
        .FIXED_IO_ps_porb(FIXED_IO_ps_porb),
        .FIXED_IO_ps_srstb(FIXED_IO_ps_srstb),
        .led_tri_o(LED),
        .sw_tri_i(SW));
endmodule
```
修改完毕后即可保存生成比特流文件，但若这个顶层是自动生成的，则每次生成HDL Warpper的时候，都会被覆盖掉（若选择不覆盖则修改的内容无法更新），所以存在较大缺陷，这种情况下的约束文件内容为：（添加方式见[Part1](https://www.liliaw.com/2022/10/09/FPGA%E5%AD%A6%E4%B9%A0-PART1/)）

```
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

### 方法二：修改XDC使其与TOP一致

完成互联后，右键工程（位于Design Sources）选择**“Create HDL Wrapper”**，选择下方的 **“Let Vivado manage wrapper and auto-update”**，这样选择以后修改HDL Warpper的操作是无效的，

我们可以将约束文件中的 LED 全部替换为 led_tri_o，约束文件如下：

```verilog
set_property PACKAGE_PIN T22  [get_ports {led_tri_o[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[0]}]

set_property PACKAGE_PIN  T21  [get_ports {led_tri_o[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[1]}]
set_property PACKAGE_PIN U22  [get_ports {led_tri_o[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[2]}]
set_property PACKAGE_PIN U21  [get_ports {led_tri_o[3]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[3]}]
set_property PACKAGE_PIN V22 [get_ports {led_tri_o[4]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[4]}]
set_property PACKAGE_PIN W22  [get_ports {led_tri_o[5]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[5]}]
set_property PACKAGE_PIN U19  [get_ports {led_tri_o[6]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[6]}]
set_property PACKAGE_PIN U14  [get_ports {led_tri_o[7]}]
set_property IOSTANDARD LVCMOS33 [get_ports {led_tri_o[7]}]
  

set_property PACKAGE_PIN F22  [get_ports {sw_tri_i[0]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[0]}]
set_property PACKAGE_PIN G22  [get_ports {sw_tri_i[1]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[1]}]
set_property PACKAGE_PIN H22  [get_ports {sw_tri_i[2]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[2]}]
set_property PACKAGE_PIN F21  [get_ports {sw_tri_i[3]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[3]}]
set_property PACKAGE_PIN H19  [get_ports {sw_tri_i[4]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[4]}]
set_property PACKAGE_PIN H18  [get_ports {sw_tri_i[5]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[5]}]
set_property PACKAGE_PIN H17   [get_ports {sw_tri_i[6]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[6]}]
set_property PACKAGE_PIN M15   [get_ports {sw_tri_i[7]}]
set_property IOSTANDARD LVCMOS33 [get_ports {sw_tri_i[7]}]
```

SW全部替换为 sw_tri_i即可得到正确的比特流文件，如果报错的话，可以在**“Sources Design”** 右键选择 **“Generate output products”**

## 2.3 地址映射

FPGA要控制外设需要通过寄存器，寄存器需要映射入FPGA的寻址地址，若在**“Address Editor”**中没有自动关联，可以右键选中后点击**“Assign Address”.**

完成后返回**“Sources Design”** 右键选择 **“Generate output products”**，然后生成比特流文件，

生成完毕后不需要进行操作，可以选择 **“View Reports”**

## 2.4 SDK开发

**“Export Hardware”** 后 **“Launch SDK”**，

<div align = "center"><img src="LED和SW地址.png"  width=""  height = "" /></div>

可以从图中看出，LED与SW的地址与我们映射的地址是保持一致的.

我们需要新建一个 **“Application Project”**，选项为 **“Perihperal Tests”** 以进行外设测试，

如下图所示：

<div align = "center"><img src="外设测试.png"  width=""  height = "" /></div>

点击左侧工作区中项目的 **“src -> trestperiph.c”** 对c文件进行编辑,

仅需要保留GpioInput与GpioOutput相关代码，

进入Gpio的函数中可以看到，输入状态时要在寄存器中全部置0，

GPIO的框图设计如下：

<div align = "center"><img src="AXI_GPIO.png"  width=""  height = "" /></div>

可以看出其三态门的架构，当寄存器中全部置1时，三态门为输入模式，而当寄存器被清空全部为0时，三态门为输出模式（看数据手册再结合实验收获满满），LED的基地址存储在一个查找表的结构体中，在xparameters.h文件中进行了定义：

```c
#define XPAR_LED_BASEADDR 0x41210000
```

然后再将其写入GpioOutput中.

我们需要进行的操作是，写LED灯，读拨码开关.

寄存器地址如图所示：

<div align = "center"><img src="寄存器地址.png"  width=""  height = "" /></div>

由于已经在框图中设置了led为输出，sw为输出，所以不需要再配置GPIO_TRI的方向，

所以我们只需要将读到的拨码开关的寄存器写入LED的寄存器中，

通过指针来读取地址：（volatile意思是防止指针被优化）

```
( volatile unsigned int * )0x4121000
```

又要从地址中取数所以取其指针：（SW同理）

```
( * ( volatile unsigned int * )0x4121000)
```

所以可以将main函数进行修改：（注意地址为八位不要少写0，0少写了也会读不出来）

```c
#define LED (*( volatile unsigned int * )0x41210000) //volatile为防止优化，
#define SW  (*( volatile unsigned int * )0x41200000) //volatile为防止优化
int main()
{
	while(1)
	{
		LED = SW;
	}
	return 0;
}
```

## 2.5 烧录

在保存后（会自动进行编译），

在终端页面添加串口后可以保存文件并准备烧录（Program FPGA），操作见[Part2](https://www.liliaw.com/2022/10/14/FPAG%E5%AD%A6%E4%B9%A0-PART2/).

由于此次时PS与PL相互协作完成，所以在Program时需要选择比特流文件的地址，如下图

<div align = "center"><img src="比特流文件地址.png"  width=""  height = "" /></div>

下载完毕后即可进行调试，右键工程 “ **Run as -> Launch on Hardware（GDB）**”

## 2.6 运行结果

运行结果是符合预期的，就是拍视频的时候一只手不太方便有点点遮挡视线…不过现象还是比较明显的.

<div align = "center"><img src="LED_SW.gif"  width=""  height = "" /></div>





折腾了一天终于搞出来了…接下来几天搞电赛培训了，还有卡了我好几天的Dijkstra算法…（准备好删除重开了），事情好多…明天写篇近况理一下…

<div align = "center"><img src="lucy.gif"  width=""  height = "" /></div>