---
title: 创建并调用处理器外设的IP核
mathjax: true
date: 2023-01-30 22:34:10
tags: [FPGA,IP核]
<<<<<<< HEAD
updated: 2023-03-01 15:59:59
=======
>>>>>>> parent of 4e04eaf (uptate)
categories: [FPGA]
comment: true
---
# FPGA学习.PART4

## 1. 概述

> Vivado自带了一些处理器外设，如PART3中调用的GPIO核；
>
> 我们实际应用中要创建自己的外设挂在处理器总线上，将寄存器映射到处理器得寻址空间，达到软件软件和逻辑的真正结合。
>
> ZYNQ7互联使用的是AXI总线。
>
> + 什么是IP核？
>
>   IP核（Intellectual Property core）是一段具有特定电路功能的硬件描述语言程序。
>
>   利用IP核设计电子系统，引用方便，修改基本元件的功能容易。
>
>   可以将其理解为封装的模块。

## 2. 实验流程

### 2.1 新建工程

IP核工程由如下层级构成

+ USER_IP
  + creat_ip -> 建立IP得项目
  + IP_Core  -> 生成的IP核
  + IP_TEST -> 演示如何添加IP到当前项目以及例化调用

首先选择 USER_IP\creat_ip 路径，再次路径下创建 RTL Project，选择Zynq-7000 Boards（选择芯片型号）；

### 2.2 创建IP核

左上角工具栏选择 Tool -> Create and Package New IP，

选择如下图 AXI4外设，路径则选择 USER_IP\IP_Core
<div align = "center"><img src="创建AXI4.png"  width=""  height = "" /></div>

Interface Mode 设置为 Slave ，当我们需要主动读取数据时则需要将其设置为 Master 模式。

最后选择 Edit IP 进入编辑，此时会打开一个新的窗口。

### 2.3 编辑IP核

在窗口左上角 Sources 窗口，选择如下文件并打开，

<div align = "center"><img src="IP_Sources.png"  width=""  height = "" /></div>

我们需要将所用到的参数由外向内进行引入，

首先引入输入输出，在输入输出部分添加

```verilog
input [7:0] sw,
output [7:0] led,
```

之后在总线实例化部分加入如下代码，如下图所示

```verilog
.led(led),
.sw(sw),
```

<div align = "center"><img src="AXI_inst.png"  width=""  height = "" /></div>

然后再在内存中写入输入输出，如下图所示，先在 Sources 中打开此文件再进行添加，注意需要将端口正确添加在预留出的 add ports 处；

<div align = "center"><img src="USER_ports.png"  width=""  height = "" /></div>

此文件主要为AXI总线时序内容。如下时序表示寄存器的读取，在其中添加我们需要添加的端口，将其映射到一个寄存器上，此处选择reg0；

```verilog
// Implement memory mapped register select and write logic generation
// The write data is accepted and written to memory mapped registers when
// axi_awready, S_AXI_WVALID, axi_wready and S_AXI_WVALID are asserted. Write strobes are used to
// select byte enables of slave registers while writing.
// These registers are cleared when reset (active low) is applied.
// Slave register write enable is asserted when valid address and data are available
// and the slave is ready to accept the write address and write data.
assign slv_reg_wren = axi_wready && S_AXI_WVALID && axi_awready && S_AXI_AWVALID;

//添加映射
assign led = slv_reg0 [7:0];
//添加代码结束
always @( posedge S_AXI_ACLK )
begin
	if ( S_AXI_ARESETN == 1'b0 )
	  begin
	    slv_reg0 <= 0;//led
	    slv_reg1 <= 0;
	    slv_reg2 <= 0;
	    slv_reg3 <= 0;
	  end 
	else begin
	  if (slv_reg_wren)
	    begin
	      case ( axi_awaddr[ADDR_LSB+OPT_MEM_ADDR_BITS:ADDR_LSB] )
	        2'h0:
	          for ( byte_index = 0; byte_index <= (C_S_AXI_DATA_WIDTH/8)-1; byte_index = byte_index+1 )
	            if ( S_AXI_WSTRB[byte_index] == 1 ) begin
	              // Respective byte enables are asserted as per write strobes 
	              // Slave register 0
	              slv_reg0[(byte_index*8) +: 8] <= S_AXI_WDATA[(byte_index*8) +: 8];
	            end  
	        2'h1:
	          for ( byte_index = 0; byte_index <= (C_S_AXI_DATA_WIDTH/8)-1; byte_index = byte_index+1 )
	            if ( S_AXI_WSTRB[byte_index] == 1 ) begin
	              // Respective byte enables are asserted as per write strobes 
	              // Slave register 1
	              slv_reg1[(byte_index*8) +: 8] <= S_AXI_WDATA[(byte_index*8) +: 8];
	            end  
	        2'h2:
	          for ( byte_index = 0; byte_index <= (C_S_AXI_DATA_WIDTH/8)-1; byte_index = byte_index+1 )
	            if ( S_AXI_WSTRB[byte_index] == 1 ) begin
	              // Respective byte enables are asserted as per write strobes 
	              // Slave register 2
	              slv_reg2[(byte_index*8) +: 8] <= S_AXI_WDATA[(byte_index*8) +: 8];
	            end  
	        2'h3:
	          for ( byte_index = 0; byte_index <= (C_S_AXI_DATA_WIDTH/8)-1; byte_index = byte_index+1 )
	            if ( S_AXI_WSTRB[byte_index] == 1 ) begin
	              // Respective byte enables are asserted as per write strobes 
	              // Slave register 3
	              slv_reg3[(byte_index*8) +: 8] <= S_AXI_WDATA[(byte_index*8) +: 8];
	            end  
	        default : begin
	                    slv_reg0 <= slv_reg0;
	                    slv_reg1 <= slv_reg1;
	                    slv_reg2 <= slv_reg2;
	                    slv_reg3 <= slv_reg3;
	                  end
	        endcase
	    end
	end
end    
```

其中如下代码 +: 为简写，这两句表示意义相同；

```verilog
slv_reg0[(byte_index*8) +: 8] <= S_AXI_WDATA[(byte_index*8) +: 8];
slv_reg0[(byte_index*8) + 7 : (byte_index*8) + 0] <= S_AXI_WDATA[(byte_index*8) + 7 : (byte_index*8) + 0];
```

再找到从寄存器中读取数据的时序，将其读到 reg1 寄存器时的数据更改为 sw ，最后将读取的数据传送给总线读取到的数据；

```verilog
// Implement memory mapped register select and read logic generation
// Slave register read enable is asserted when valid address is available
// and the slave is ready to accept the read address.
assign slv_reg_rden = axi_arready & S_AXI_ARVALID & ~axi_rvalid;
always @(*)
begin
	// Address decoding for reading registers
	case ( axi_araddr[ADDR_LSB+OPT_MEM_ADDR_BITS:ADDR_LSB] )
	  2'h0   : reg_data_out <= slv_reg0;
        2'h1   : reg_data_out <= {24'b0 ,sw[7:0]};//slv_reg1;修改此处
	  2'h2   : reg_data_out <= slv_reg2;
	  2'h3   : reg_data_out <= slv_reg3;
	  default : reg_data_out <= 0;
    endcase
end
// Output register or memory read data
always @( posedge S_AXI_ACLK )
begin
  if ( S_AXI_ARESETN == 1'b0 )
  	begin
	  axi_rdata  <= 0;
	end 
  else
	begin  
	  // When there is a valid read address (S_AXI_ARVALID) with 
	  // acceptance of read address by the slave (axi_arready), 
	  // output the read dada 
	  if (slv_reg_rden)
	    begin
	      axi_rdata <= reg_data_out;     // register read data
	    end   
	end
end  
```

### 2.4 打包IP核

点击左上角工作区的运行按钮进行代码检查；

完成后点击 PROJECT MANAGER 下的 Package IP 以进行IP核的打包；

在有更改的部分进行更新（不匹配或未确认的内容左侧将没有绿色的 √ ），

若有更改可以点击右侧上方的 Maerge changes from File Groups Wizard 进行更新；之后可以看到我们所做的更改与之匹配，则为操作正确；

最后所有的操作完成后点击左侧 Review and Package 点击 Re-package IP 进行重新打包。

### 2.5 调用IP核

上面的操作创建IP核以后将会将其自动加入 creat_ip 这个工程中，所以我们需要新建一个 IP_TEST 工程调用我们刚才创建的IP核；

首先建立一个块设计（PART2中提及，此处不再赘述），

点击左侧 IP Catalog 进入界面 右击空白处选择 Add Repository 选择我们需要调用的IP核路径，如下图所示；

<div align = "center"><img src="ip_catalog.png"  width=""  height = "" /></div>

成功调用后我们就可以在设计中找到此IP核，如下图所示；

<div align = "center"><img src="block.png"  width=""  height = "" /></div>

至此此次关于IP核的创建与调用操作结束。

<div align = "center"><img src="宵宫.png"  width=""  height = "" /></div>