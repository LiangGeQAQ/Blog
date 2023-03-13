---
title: FPGA学习.PART8
mathjax: true
date: 2023-03-13 21:05:38
tags: [FPGA,PS,PL.PLED]
categories: [FPGA]
comment: true
---

# 综合分析PS和PL部分对OLED驱动进行加速

## 1. 概述

> + 本节展示软硬件协调性设计的加速方法分析与实现，使软件PS部分和PL部分合理分工；
> + 本节实验基于[上节](https://www.liliaw.com/2023/03/03/FPGA%E5%AD%A6%E4%B9%A0-PART7/)的代码进行优化与分析；

## 2. 实验步骤

### 2.1 打开项目

打开上节中的OLED项目，启动SDK，针对软件部分进行优化；

### 2.2 函数分析

首先看到如下的函数，

```c
//向SSD1306写入一个字节的命令。
void write_cmd(u8 data)
{
	u8 i;
	Clr_OLED_DC;

	for(i=0;i<8;i++)
	{
		Clr_OLED_SCLK;
 
		if(data&0x80)//如果最高位为1
			Set_OLED_SDIN;//设置为1
		else
			Clr_OLED_SDIN;//反之设置为0
		Set_OLED_SCLK;//创造上升沿
		data<<=1;
	}

}
```

C语言中此函数为模拟时序，因为在单片机中无法控制硬件的逻辑如此操作为迫不得已的，而在 FPGA 中，可以将此部分独立出来写一个加速器；

### 2.3 硬件描述

OLED 写入时序如下图所示，

<div align = "center"><img src="OLED四线串口模式下的写操作.png"  width=""  height = "" /></div>

我们可以通过 Verilog 硬件描述语言进行实现，

SPI 通信协议主要有两根线进行数据传输，一个是 SCLK 时钟线，一个是 SDIN 数据线，

在SCLK 的上升沿时，设备对 SDIN 数据线进行一次采样，

所以，SDIN 的电平持续时间应当尽量为，前一个脉冲的下降沿到后一个时钟的下降沿，

这样与 SCLK 的上升沿刚好形成半个周期的时延，

其 Verilog 代码如下，

```verilog
`define DELAY_HI_BIT  2 

module send_db(
	input clk,rst,//clk为AXI总线时钟频率
	input [7:0] din ,
	input write,
	output  busy,//写入时向外界发送忙信号
	output reg  SCK,SDIN
);

    reg [7:0] dinr = 0 ;  //创建寄存器保存din
    always @(posedge clk) //在wirte信号有效时，保存din，写入dinr
        if (write)dinr<=din ;

    reg [`DELAY_HI_BIT-1:0] delay_cntr ; //循环延时计数器
    always @(posedge clk )
        delay_cntr  <=(rst)?0:( delay_cntr +1) ;

	wire step_move =  delay_cntr == 1 << `DELAY_HI_BIT - 1 ;//每循环一次

	reg [4:0]   cntr  ;

	always @(posedge  clk )  //计数器
		if (rst)cntr<=0;else 
		begin 
            if ( write ) cntr <= 1 ;//每当write有效，计数器 + 1 
            else if (( cntr !=0 ) && (step_move) ) //step_move > 1 即循环演示循环一次及以上
                cntr <= (cntr==19)? 0 :(cntr + 1) ; //计数器cnt计数到19时清零，其他时候若满足上条件则计数器 + 1
//将一个序列的时钟持续时长视为 0 ~ 19，从0开始一个周期持续时长为2
		end 

    always @(posedge  clk )//SCLK
		case ( cntr ) 
			3,5,7,9,11,13,15,17 :  SCK <= 1 ;//对应上述将单个序列的时钟量化的数值，在单数时为高电平，产生共8个上升沿
			default SCK <= 0 ; 
		endcase 


	always @(posedge  clk )//SDIN
        case ( cntr ) //与 SCLK 存在半个周期的延时
			2  : SDIN <= dinr[7] ;
			4  : SDIN <= dinr[6] ;
			6  : SDIN <= dinr[5] ;
			8  : SDIN <= dinr[4] ;
			10 : SDIN <= dinr[3] ;
			12 : SDIN <= dinr[2] ;
			14 : SDIN <= dinr[1] ;
			16 : SDIN <= dinr[0] ;
		endcase 

	assign busy = cntr != 0 ; //计数器不等于0时，状态为忙，计数器在write有效时才 + 1

endmodule 


//仿真代码
`timescale 1ns / 1ps
 
module top ; 
reg clk,write,rst ;
reg [7:0]din;
wire SCK,SDIN,busy;

send_db  U1 (
 .clk(clk) ,
 .rst(rst),
 .din(din) ,
 .write(write),
 .busy(busy),
 .SCK(SCK) ,
 .SDIN(SDIN)
);

always #5 clk=~clk;
//初始化时钟，写信号，数据信号，复位信号
initial begin 
clk = 0 ; write = 0 ; din='haa ;rst=1;
#100 rst = 0 ;//复位使能
#200  
//时钟上升沿产生写信号
@(posedge clk) ;
write = 1 ;
//时钟上升沿写信号拉低
@(posedge clk) ;
write = 0 ;

end


endmodule
```

### 2.4 加速器仿真

左侧 “IP INTEGRATOR” -> “Open Block Design” 打开块设计，选中我们创建的 IP 核，进行编辑（Edit in IP Packager），

在新打开的窗口添加上述代码，左上角 “Sources” 中点击加号新建，或者是将 .v 文件放置至 IP 核目录下 hdl 文件夹再添加路径即可；

点击综合分析代码错误，若未提示有误，则可进入仿真，

首先将 top （也就是我们新建的文件）设置为顶层，

左侧工作区，点击 “Run Simulation” 选择行为仿真，

仿真结果如下图，

<div align = "center"><img src="加速器功能仿真.png"  width=""  height = "" /></div>

在 write 信号出现后，busy 跳为高电平，内部开始计数，

SCK 产生上升沿，读取 SDIN 数据，将其写入寄存器中，

八次读取数据为 8’b1010 1010，即给的输入 din 的值 aa，（一次读取 din 的一位，由高位到低位）

左上角工作区 “top” -> “U1”，可以右击将 cntr 也列入波形视窗中观察其变化，

添加完成后点击 “Relunch Simulation” 即可，如下所示，

<div align = "center"><img src="cntr功能仿真.png"  width=""  height = "" /></div>

计数器由0开始计数一直到19再清零，可以看出模块的功能能够得以实现

### 2.5 将加速器写入 IP 核

打开左上角工作区 “Soureces” -> “Design Sources” -> “my_OLED_ip_v1_0” -> “my_OLED_ip_v1_0_S00_AXI_inst:my_OLED_ip_v1_0_S00_AXI”,

大约在120行左右位置我们曾添加了

```verilog
assign {OLED_DC, OLED_RES, OLED_SCLK, OLED_SDIN, OLED_VBAT, OLED_VDD} = slv_reg0[5:0];
```

为了使 OLED 能够通过加速器传递信号，而非都通过 PS 部分，所以要将其分离，

我们要将 DC，SCLK，SDIN 拿出将其加速，所以进行如下修改，

```verilog
assign { OLED_VBAT, OLED_VDD } = slv_reg0[1:0];
assign {  OLED_RES } = slv_reg0[4];
//OLED_DC,        ,OLED_SCLK, OLED_SDIN,   
```

在写信号出现时，数据开始写入寄存器，由于第0个寄存器最开始用于控制每一个bit，

现在可以用其他的寄存器来存储数据，

例如可以将 write 定义为，要对第二个寄存器进行写入的标志，

我们可以找到写入寄存器部分的描述，在大约220行附近，在前面添加我们新增的代码，

```verilog
//将写命令放入寄存器1，写数据放入寄存器2，并产生 write 信号
wire wr_cmd = ( slv_reg_wren == 1 ) && ( axi_awaddr[ADDR_LSB+OPT_MEM_ADDR_BITS:ADDR_LSB] == 1 );
//在写入地址为第1个寄存器时，写指令有效
wire wr_data = slv_reg_wren && (axi_awaddr[ADDR_LSB+OPT_MEM_ADDR_BITS:ADDR_LSB] == 2);
//写入的数据存入第2个寄存器
wire do_write = wr_cmd | wr_data;
//每当上述指令发生，使 write 操作发生一次，通过 DC 信号进行区分

//调用加速器模块
send_db(
.clk( S_AXI_ACLK ),//使用总线时钟
.rst( ~S_AXI_ARESETN ),//使用系统复位，但系统复位为0有效，我们的代码模块为1有效，需要取反
.din( S_AXI_WDATA[7:0] ),//写入寄存器的值，仅需要低八位
.write( do_write ),//写信号为do_write
.busy( busy ),//busy过程中，OLED不再接收处理器发送的写请求
.SCK( OLED_SCLK ),//OLED时钟线接入
.SDIN( OLED_SDIN )//OLED数据线接入
);

//使DC区分命令与数据
reg OLED_DCR ;
always@(posedge S_AXI_ACLK )begin
    if(wr_cmd) //写命令时DC为0
        OLED_DCR <= 0;
    else if(wr_data)//写数据时DC为1
        OLED_DCR = 1;
end
assign OLED_DC = OLED_DCR;
```

160行附近， axi_awready 信号表示写地址就绪，

200行附近， axi_wready 信号表示写就绪，

处理器在写寄存器之前需要知道寄存器是否就绪，需要两个信号都变为 1 时，才能进行写入，否则进行等待，所以可以让 busy 信号挂在这上面，所以在前边定义一个 

```verilog
wire busy;
```

在调用两个信号之前，

在160行附近，将写地址就绪改为 busy 取反的判断，

当 busy 为 1 时证明正在写入，所以 axi_awready 为 0 以表示寄存器未就绪，

```verilog
	      if (~axi_awready && S_AXI_AWVALID && S_AXI_WVALID && aw_en)
	        begin
	          // slave is ready to accept write address when 
	          // there is a valid write address and write data
	          // on the write address and data bus. This design 
	          // expects no outstanding transactions. 
	          axi_awready <= (~busy)?1:0;//1'b1;
	          aw_en <= 1'b0;
	        end
```

同理，200行附近的写地址就绪信号同样需要进行更改，

```verilog
	      if (~axi_wready && S_AXI_WVALID && S_AXI_AWVALID && aw_en )
	        begin
	          // slave is ready to accept write data when 
	          // there is a valid write address and write data
	          // on the write address and data bus. This design 
	          // expects no outstanding transactions. 
              axi_wready <=  (~busy)?1:0;//1'b1;
	        end
```

修改完毕后，保存并进行分析检查语法错误；

分析完毕后 Re-Package IP 核进行重封装即可；

### 2.6 在SDK内进行更改

更新顶层设计中的 IP 核，生成比特流文件，接下来进入SDK进行改动，

主要对 write_cmd 与 write_data 进行更改，

32位总线类型，4字节，也就是8位，所以寄存器 2 所对应的及地址应该 + 8，

同理，写命令为 + 4，

所以函数为：

```c
void write_cmd(u8 data)
{
	Xil_Out32(OLED_BASE_ADDR + 4, data );
}
void write_data(u8 data)
{
	Xil_Out32(OLED_BASE_ADDR + 8, data );
}
```

将比特流文件与PS端文件写入 FPGA.

### 2.7  问题记录

烧录PS端出现问题：（但PL端能够正常烧录，通过其他实验验证芯片并未出现问题）

```
Error while launching program: 
Memory write error at 0x100000. APB AP transaction error, DAP status f0000021
```

以及，

```
ERROR: 
no targets found with "name =~"APU*" && jtag_cable_name =~ "Digilent Zed 210248707507"". available targets:
  1  DAP (JTAG port open error. AP transaction error, DAP status 30000021)
  2* xc7z020
```

有时还会存在，

```
Error while launching program:  
Memory write error at 0x100000. APB AP transaction error, DAP status
```

有的时候烧录不报错但运行的结果很显然不符合预期；

导致原因可能有

+ 调试接口不正常
+ 目标板供电不足
+ DDR3配置有误，原理图DDR3为两块16位的 MT41K128M16JT-125:K
+ PL资源改动未及时export到SDK
+ 跳线帽未正常切换

检查了上面的情况均未成功运行，还尝试过的解决方案

+ 配置DDR3型号与原理图一致
+ DDR3的起止地址为 0x00100000 ~ 0x1FFFFFFF 并未存在问题
+ 换调试接口（但是没有JTAG线，之前的实验烧录PS端也是通过usb线完成的）
+ 重开一次项目，使用 Vivado 的自动配置配置 ZYNQ7 的 IP核
+ Copy 了资料中的 .v 文件，并将其与工程文件适配
+ 更改 Run Configurations ,勾选 Reset entire system

### 2.8 问题解决

烧录的问题问了问大佬学长(´。＿。｀)，先是晶振的频率设置出了点问题，在之前找原因改的时候把 33.333333 MHz 改成了 50 MHz，导致驱动不起来…

然后学长又表演了一手单核程序的固化，帮俺解决了不能烧录的问题，（我太菜了，非常非常感谢学长(´。＿。｀)，但是研究生实验室压迫感满满直接逃跑…），单核固化程序的记录会在下一P。

### 2.9 运行结果

运行结果如下图，

<div align = "center"><img src="结果.jpg"  width=""  height = "" /></div>



## 3. 总结

+ 加速的过程会让软件部分节省多条指令，但在运行的过程中仍有可能造成写入时处理器一直等待写完毕而造成无操作挂起的状态，导致速度受到限制；

+ 在接口上进行优化，或者使 DELAY_HI_BIT 循环计数器尽可能小，也能使速度提升；

+ 本质上加速的方法：加入 FIFO （先入先出队列），将要写入的队列写入 FIFO ，便可不再进行等待，直接返回，以协调处理器使其不会挂起；

+ 导入sdk的时候最好直接把sdk整个文件夹扬了再导入一次，记得备份已经写好的函数；

+ 生成比特流文件的时候，将 Number of jobs 改为 16

  <div align = "center"><img src="生成比特流文件.png"  width=""  height = "" /></div>

> <div align = "center">菜就多练😕</div>





<div align = "center"><img src="EMT.jpg"  width=""  height = "" /></div>

