---
title: Verilog分频器设计
mathjax: true
date: 2023-03-06 21:36:41
tags: [FPGA,分频,Verilog]
categories: [Verilog]
comment: true
---

# Verilog分频器设计

## 1. 概述

> 通常在FPGA中一个时钟源的频率是非常高的，就我们这学期将会使用的 DE1-SoC 这块板子来说，就有4个50MHz的时钟源以及2个25MHz时钟源，而我们在使用流水灯等类似的需要一些肉眼可见的地刷新率的频率时，就需要使用分频模块，将高频率给降下来；
>
> 在大一下学期的时候涉及到了一些分频器的设计，是依赖 74HC390 搭建的各类分频(模100，模5，模2)，当时刚刚入门 Verilog ，涉及到自己写分频模块的时候，还是很迷茫，不知道该怎么下手，所以今天就专门针对硬件描述语言的分频模块来进行学习与讨论。

## 2. 分频数与分频系数

> 分频数是指信号的频率除以分频器的输出频率，//  输入  /  输出
>
> 而分频系数是分频器输出频率与输入频率的比值.//  输出  /  输入

我们拿大一时那个数字时钟中所使用的音乐模块的部分代码来进行相关的阐述，

首先是模块输入输出，以及各类寄存器的定义，这里不作过多的解释（也没啥好解释的），

```verilog
module		song(clk,beep);		//模块名称song		
input		clk;			//系统时钟50MHz	
output		beep;			//蜂鸣器输出端
reg		beep_r;			//寄存器
reg[7:0] 	state;			//乐谱状态机
reg[16:0]	count,count_end;
reg[23:0]	count1;
```

然后是比较重头戏的关于频率数值的赋值，在讲这段代码赋值由来之前，我们需要知道模块内将对这些值进行怎样的操作，所以我们先看后面部分的代码，再反过来回推这些值，

下面时序部分总的来讲分为两部分：频率计数、乐谱状态计数，

其功能分别是：

- 频率计数
  - 每收到一个时钟脉冲，计数器 + 1，
  - 若计数器计数到了当前乐谱状态的分频系数，则清零，并让输出取反
- 乐谱状态计数
  - 若计数器小于音长的分频系数，每收到一个时钟脉冲，计数器 + 1，
  - 若计数器达到音长的分频系数，则乐谱状态 + 1，进入下一个状态，其对应的分频系数也随之改变

```verilog
assign beep = beep_r;//输出音乐
always@(posedge clk) begin
	count <= count + 1'b1;//计数器加1
	if(count == count_end) begin	
		count <= 17'h0;//计数器清零
		beep_r <= !beep_r;//输出取反
	end
end

//曲谱 产生分频的系数并描述出曲谱
always @(posedge clk) begin
   if(count1 < TIME)//一个节拍250mS
      count1 = count1 + 1'b1;
   else begin
      count1 = 24'd0;
      if(state == 8'd63)
         state = 8'd0;
      else
         state = state + 1'b1;
   case(state)
    	8'd0:count_end = L_6;  
		8'd1:count_end=M_1;
		8'd2:count_end=M_3;
		default: count_end = 16'h0;
   endcase
   end
end
endmodule
```

在了解模块的基础运行逻辑之后，我们再回来看这段关于频率的赋值，

比如在 state = 0 这个状态下，低音6的分频系数 L_6 被赋值给了 count_end 也就是频率计数中的分频系数，

在输入时钟脉冲为 50MHz 的条件下，每计数 56818 次信号产生一次反转，所以产生的信号的反转频率为：50000000 / 56818 = 880 Hz ，

而反转的频率是输出信号频率的两倍，所以需要将其除以二，

则最终分出的频率为：50000000 / 56818 / 2 = 440 Hz，这个频率正好就是低音6的频率，

所以我们能够得出一个公式：
$$
f=\dfrac{\dfrac{F}{K}-2}{2}
$$
其中，$f$是分频数的一半，$F$是系统时钟频率，$K$是所需要的输出频率，而 - 2 是因为从 0 开始计数计数器初始值要 - 1.

（以前的代码就没有 - 1，因为当时还没有认识到这个问题，其实在实现上差别不大，关于模块的设计可以去看看当时的设计思路，在报告的[5.2.2 设计思路](https://www.liliaw.com/2022/06/20/FPGA%E5%AE%9E%E9%AA%8C%E6%8A%A5%E5%91%8A/)）

而关于音长的计算我们也可以参考这个逻辑，在系统时钟为 50MHz 的条件下，我们需要一个250ms 也就是 0.25s 的时长，所以 TIME 的分频数需要能够使这个值分到 1 秒内的 0.25s，即四分之一，所以有 $50Mhz \div 4\approx 12MHz$，这样就能使单次计数持续约为 0.25s.

```verilog
//乐谱参数:f=F/2K  (f:参数,F:时钟频率,K:音高频率)
parameter   L_3 = 17'd75850,  	//低音3
            L_5 = 17'd63776,  	//低音5
            L_6 = 17'd56818,	//低音6
	    L_7 = 17'd50618,	//低音7
	    M_1 = 17'd47774,	//中音1
	    M_2 = 17'd42568,	//中音2
	    M_3 = 17'd37919,	//中音3
	    M_5 = 17'd31888,	//中音5
	    M_6 = 17'd28409,	//中音6
	    H_1 = 17'd23889;	//高音1			
parameter	TIME = 12000000;	//控制每一个音的长短(250ms)
```

## 3. 偶数分频与奇数分频

偶数分频时可以直接进行操作，因为偶数其分频数必然是二的倍数，
所以可以利用要给计数器计数到分频数的一半减一，（从零开始计数初始值需要 -1）
令这一段计数时的电位为高，令另一半电位为低，

或者直接在计时结束后使信号取反；

（我个人更喜欢后者，因为更简洁，偶数分频使用的便是取反，奇数分频则使用了前一半计数为高电平，后一半计数为低电平的方法进行设计）

下面进行一个举例，输入时钟为 50MHz ，分频数为 100 ，则输出信号的频率为 0.5MHz ，

```verilog
module Even_div(
	input clk,//输入时钟
    input rst_n,//复位
    output reg clk_out//输出时钟
    // 在 always 模块内被赋值的每一个信号都必须是 reg 类型，
    //昨天自己敲代码就是犯了这个错误然后去找 ChatGPT 玩
);//分号别忘了
	parameter div = 100;//分频数
	reg [7:0]cnt = 8'b0;//一个8位计数器
	always@(posedge clk or negedge rst_n)begin
    	if(!rst_n)begin//复位时
        	cnt <= 8'b0;//计数器清零
     	    clk_out <= 1'b0;//输出为低电位
  	  	end
   	  	else if (cnt == (div / 2 - 1))begin//计数到分频数的一半减一时
     	  	clk_out = ~clk_out;//反转
    	    cnt <= 8'b0;//计数器清零
 		end
   	 	else
        	cnt <= cnt + 1;//若没计数到指定数值，则继续累加
	end
endmodule
```

仿真文件如下：

```verilog
`timescale 1ns/1ps //时间单位 / 时间精度
module tb_Even_Div;
//输入
  reg clk;
  reg rst_n;
  
//输出
  wire clk_out;
  
//信号初始化
  initial begin
    clk = 0;
	 rst_n = 1'b0;
	 #20
	 rst_n = 1'b1;
  end
 
//生成激励
  always #10 clk = ~clk;

//例化待测模块
  Even_Div divider(
	.clk(clk),
	.rst_n(rst_n),
	.clk_out(clk_out)
  );
  
endmodule
```

最后的波形图如下图所示，

<div align = "center"><img src="偶数分频.png"  width=""  height = "" /></div>

数了半天确实是每五十个周期产生一次翻转（奇数分频就不用这么大的了…），

其中一个输入时钟周期是 1 / 50MHz = 0.02us，

则分频后的周期为 0.02us * 100 = 2us，

其频率也就是 1 / 2us = 0.5MHz，

所以偶数分频模块的设计是正确的；

> 【一个题外话：昨天因为在 output 处把 reg 写错成了 wire，看了半天还没发现，一时兴起把代码发给 ChatGPT 让他看看，居然让我把计数初始值改成 -1，其实也有一定道理（bushi），但是在 reg 寄存器中只能放无符号的数，要带符号的话需要使用 reg signed，挂挂[同学关于ChatGPT使用的一篇文章 ](https://www.b70.buzz/2023/03/03/ChatGPT%E6%B3%A8%E5%86%8C%E5%8F%8AChatGPT-QQ%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B/)】
>
> **Tips：**assign 语句只能对 wire 型赋值，在 always 块中只能对 reg 型赋值.

奇数分频要保持一个时钟信号的50%占空比，则不能像偶数分频那样直接在分频数的一半时使电平反转。

所以需要利用输入时钟的上升沿和下降沿来进行设计，

同一周期内的上升沿与下降沿相差了半个周期（50%的占空比的条件下），

所以可以分别设计一个时序，最后进行或操作进行输出，得到奇数分频；

下面进行一个举例，输入时钟为 50MHz，分频数为5，则输出信号的频率为 10MHz，

```verilog
module Odd_Div(
	input clk,//输入时钟
	input rst_n,//复位
	output wire clk_out//输出信号
);
	parameter div = 5;//分频数
	reg [7:0]cnt_P;//上升沿计数器
	reg [7:0]cnt_N;//下降沿计数器
	reg clk_P,clk_N;//上升沿脉冲与下降沿脉冲
    
    //上升沿计数
    always@(posedge clk or negedge rst_n)begin
        if(!rst_n)//复位时
            cnt_P <= 0;//计数器清零
        else if(cnt_P < div - 1)//若未计数到分频数 - 1
            cnt_P <= cnt_P + 1'b1;//计数器 + 1
        else//若计数到分频数
            cnt_P <= 0;//计数器清零
    end
    //上升沿计数到半分频数翻转脉冲clk_P
    always@(posedge clk or negedge rst_n)begin
        if(!rst_n)//复位时
            clk_P <= 1'b1;//脉冲为高电平
        else if(cnt_P < (div / 2))//未计数到半分频数时
            clk_P <= 1'b1;//脉冲为高
        else//计数到半分频数
            clk_P <= 1'b0;//脉冲为低
    end
    
    //下降沿计数
    always@(negedge clk or negedge rst_n)begin
        if(!rst_n)//复位时
            cnt_N <= 1'b0;//计数器清零
        else if(cnt_N < (div - 1))//若未计数到分频数 - 1
            cnt_N <= cnt_N + 1'b1;//计数器 + 1
        else//若计数到分频数
            cnt_N <= 1'b0;//计数器清零
    end
    //下降沿计数到半分频数翻转脉冲clk_N
    always@(negedge clk or negedge rst_n)begin
        if(!rst_n)//复位时
            clk_N <= 1'b1;//脉冲拉高
        else if(cnt_N < div / 2)//若未计数到半分频数
            clk_N <= 1'b1;//电平拉高
        else//若计数到半分频数
            clk_N <= 1'b0;//电平拉低
    end
    
    //输出信号为上升沿计数脉冲与下降沿计数脉冲相或
    assign clk_out = clk_N | clk_P;
endmodule
```

仿真文件对偶数分频的激励文件稍加更改即可，如下所示，

```verilog
`timescale 1ns/1ps //时间单位 / 时间精度
module tb_Odd_Div;
//输入
  reg clk;
  reg rst_n;
  
//输出
  wire clk_out;
  
//信号初始化
  initial begin
    clk = 0;
	 rst_n = 1'b0;
	 #20
	 rst_n = 1'b1;
  end
 
//生成时钟
  always #10 clk = ~clk;

//例化待测模块
  Odd_Div divider(
	.clk(clk),
	.rst_n(rst_n),
	.clk_out(clk_out)
  );
  
endmodule
```

最后的波形图如下所示，

<div align = "center"><img src="奇数分频.png"  width=""  height = "" /></div>

由于分频数很小所以很轻易就能看出，输出脉冲的周期等于五个系统时钟周期，

但是输出脉冲的上升沿对应的使系统时钟的下降沿，

反观偶数分频当中，则是上升沿对应上升沿，

这是因为下降沿计数与上升沿计数相或导致下降沿计数的脉冲比上升沿计数的脉冲快了半个系统时钟周期，而在输出脉冲需要产生低电平跳变的时候，由于这半个周期的延迟，使得整个输出又延长了半个周期，

所以，提前的半个周期与延迟的半个周期，使得输出脉冲的周期比 分频数 / 2 多一个周期（这句话里的周期都指系统时钟周期）；

至于为什么要多这一个周期，是因为计算机在用计数作除法时会向下取整，导致少 1，所以我们通过这种方式将其加回来。

## 4.  利用分频器生成任意占空比信号

若要产生任意占空比的信号，则不能再使用前文提到的取反操作，而要采用前段时间拉高，后段时间拉低的方法，所以代码我们就不再设计，这里只提计算方式。

首先我们明确占空比的概念：

<div align = "center">高电平在一个周期之内所占的时间比率</div>

占空比的计算方式：
$$
D=\dfrac{t}{T}
$$
其中，$D$为占空比，$t$为高电平持续时间，$T$为周期，

所以我们设占空比$D$，分频数$f$为已知量，高电平占分频数的比率也就是占空比，

所以拉高的计数频次就是$f\times D$，剩余的计数到一个周期结束都是低电平，

结合任意频率的分频器，我们就可以完成占空比为$D$的分频器设计。

## 5. 总结

这学期我们专业又有一门 FPGA 的课程，发了 DE1-Soc 的板子，由于是使用 Quatus II来进行操作的，所以这学期是要 Vivado + Quatus II 双线程跑了…

总的来说，学会仿真很重要，不然半天都折腾不出来，激励文件的基本格式：

```verilog
`timescale 1ns/1ps //时间单位 / 时间精度
module tb_仿真模块文件名;//一般以tb开头
//输入
  reg 输入;
  reg 输入;
  
//输出
  wire 输出;
  
//信号初始化
  initial begin 
    信号数据初始化;
	 复位拉低;
	 #20//一点延时
	 复位信号拉高;
  end
 
//生成时钟
  always #10 clk = ~clk;//每隔10个时间单位产生一次翻转，还有更多用法

//例化待测模块
  模块文件名称 模块命名(
    .端口名(接线名),
	.端口名(接线名),
	.端口名(接线名)
  );
  
endmodule
```

需要注意的是，复位信号一定要先拉低，不然时序会产生问题导致仿真失败（实践出真知），

在使用 Quartus II 的时候推荐单独下载并安装 ModelSim，使用 17.1 以上版本自带的配置起来很麻烦，弄了半天也没跑出来…

关于 ModelSim 的破解也是玄学了半天，最后是关掉除 WiFi 以外的网卡再破解才成功的（仅供学习，并非提倡使用盗版软件🫠），软件安装流程就不挂了，大家可以自己去找找，网上资源还是很丰富的。





参考文章：

[一文搞懂FPGA的Verilog分频](https://codeantenna.com/a/j2k3bexYAC)





<div align = "center"><img src="emt.jpg"  width=""  height = "" /></div>