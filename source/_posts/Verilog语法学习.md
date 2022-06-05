---
title: Verilog语法学习
mathjax: true
date: 2022-06-05 16:12:16
tags: [Verilog,语法]
categories: [Verilog]
comment: true
---

# Verilog HDL语法 

## 1.电路设计的语法

###  1.1 设计不用的语法（不可综合）

+ initial【设计不用，仿真时使用】
+ task/function【设计不用，仿真很少用】
+ for/while/repeat/forever【设计不用，仿真很少用】
+ integer【设计不用】
+ 模块内部不能有X态（不定态）、Z态（高阻态），内部不能有三态接口
+ casex/casez【设计、仿真都不用】
+ force/wait/fork【设计不用，仿真很少用】
+ #n【设计不用，仿真时使用】

### 1.2 设计使用的语法

+ reg/wire、parameter
+ assign【建议改名时使用】、always
+ 只允许使用if else和case两种条件语句
+ 算术运算符(+、-、*、/、%)【除法及求余运算电路面积较大】
+ 赋值运算符（=、<=）【时序逻辑用<=，组合逻辑用=，其他情况不存在】
+ 关系运算符（>，<，>=，<=，==，!=）
+ 逻辑运算符（&&，||，!）【为避免歧义，逻辑运算符两边必须为**1bit**信号】
+ 位运算符（~，|，^，&）
+ 移位运算符（<<，>>）
+ 拼接运算符（{}）

## 2.电路设计的结构

### 2.1 电路设计的3种结构

+ 组合逻辑

   ```verilog
   always@(*)begin
       语句
   end
   ```

+ 时序逻辑

   + 同步复位的时序电路

      ```verilog
      always@(posedge clk)begin
          if(rst_n==1'b0)begin
              语句
          end
          else begin
              语句
          end
      end
      ```

   + 异步复位的时序电路

      ```verilog
      always@(posedge clk or negedge rst_n)begin
          if(rst_n==1'b0)begin
              语句
          end
          else begin
              语句
          end
      end
      ```

### 2.2 模块介绍

+ 端口定义

+ 参数定义

+ I/O说明

+ 信号说明

+ 功能定义

  ```verilog
  //端口定义
  module module_name
  clk		,	//端口1，时钟
  rst_n	,	//端口2，复位
  dout		//其他信号，如dout
  	);
  //参数定义
      parameter DATA_W = 8;
  //I/O说明
      input	clk;	//输入信号定义
      input	rst_n;	//输入信号定义
      output	[DATA_W-1:0]	dout;	//输出信号定义
  //信号说明
      reg		[DATA_W-1:0]	dout;//信号类型
      (reg、wire)定义	reg		signal1;//信号类型
      (reg、wire)定义
  //..............以下为描述功能部分.............//
  //功能定义
  	always@(*)begin
      	语句
  	end
  endmodule
  ```

## 3. 信号类型

+ 线网类型(net type)
+ 寄存器类型(reg type)

### 3.1 信号位宽

需要知道信号的最大值

### 3.2 线网类型

通常使用**assign**

```verilog
wire [msb:lsb] wire1,wire2,...,wireN
```

+ msb和lsb定义了范围，表示位宽
+ msb和lsb必须为常数值
+ 如果没有范围，缺省值位1位
+ 没有定义信号数据类型时，缺省为wire类型
+ 注意数组类型按照降序排列方式

### 3.3 寄存器类型 reg

```verilog
reg [msb:lsb] reg1,reg2,...,regN
```

+ msb和lsb定义了范围，表示位宽
+ msb和lsb必须为常数值
+ 如果没有范围，缺省值位1位
+ 没有定义信号数据类型时，缺省为wire类型
+ 注意数组类型按照降序排列方式

### 3.4 wire 和 reg 的区别

reg型信号不一定生成寄存器，

在本模块中使用**always**设计的信号都定义为**reg**型，其他信号都定义为**wire**型 

## 4. 组合逻辑

### 4.1 程序语句

#### 4.1.1 assign语句

​	assign 语句时连续赋值语句，一般是将一个变量的值不间断地赋值给另一个变量，两个变量之间就类似于被导线连在了一起，习惯上当作连线用。

基本格式：

```verilog
assign a = b（逻辑运算符） c
```

+ 持续赋值；
+ 连线；
+ 对**wire**型变量赋值，**wire**是线网，相当于实际的连接线，如果要用**assign**直接连接，就用**wire**型变量，**wire**型变量的值随时发生变化；
+ 多条**assign**连续赋值语句之间互相独立、并行执行。

#### 4.1.2 alwyas语句

​	**always**语句是条件循环语句，执行机制是通过对一个成为敏感变量表的事件驱动来实现的。

基本格式：

```verilog
always@(敏感事件)begin
	程序语句
end
```

+ 可以用“*****”代替程序语句中所有的条件信号；
+ **possedge **上升沿；
+ **negedge **下降沿；
+ 一般情况下复位信号的优先级最高，常写为**rst_n**；
+ 组合逻辑的**always**语句中敏感变量必须写全，或者用“*****”代替；
+ 组合和逻辑器件的赋值采用阻塞赋值“=”，时序逻辑器件的赋值语句1采用非阻塞赋值“<=”。

### 4.2 数字进制

#### 4.2.1 数字表示方式

在Verilog中的数字表示方式，最常用的格式：<位宽><基数><数值>，**如4’b1011**。

**位宽**：描述常量所含位数的十进制整数，是可选项。**如4’b1011**中的 4 表示位宽，没有这一项时，可由常量的值进行推断。

**基数**：表示数值是多少进制。

| 字母 |   进制   |
| :--: | :------: |
| b/B  |  二进制  |
| d/D  |  十进制  |
| o/O  |  八进制  |
| h/H  | 十六进制 |

若没有此项，缺省默认为十进制数，**如4’b1011**可以写成十进制4’d11，也可以写成十六进制的4’hb或八进制的4’o13，还可以直接写为11。

**数值**：由基数所决定的表示常量真实值的一串ASCII码。

位宽小于数值的情况，从低位开始数 

#### 4.2.2 二进制

符号、小数表示

**常用定点小数定义**

| 二进制值 |  定义  |
| :------: | :----: |
|  3’b000  |  0.0   |
|  3’b001  | 0.125  |
|  3’b010  |  0.25  |
|  3’b011  | 0.3725 |
|  3’b100  |  0.5   |
|  3’b101  | 0.625  |
|  3’b110  |  0.75  |
|  3’b111  | 0.8725 |

可以通过增加信号位宽，增加可表示值

#### 4.2.3 不定态

X态称为不定态（即无法确定其为 0 还是 1 ），仿真中若出现不定态，分析其是否合理，建议尽量减少信号的不定态，观察不定态是否为所需要的值进行优化，减少使用

#### 4.2.4 高阻态

Z态称为高阻态，表示设计者不驱动这个信号（既不给0也不给1）

综合为三态门（目的是减少管脚）（FPGA不需要此操作，减少使用）

```verilog
assign data = (wr_en==1)?wr_data:1'bz;
assign rd_data = data;
```

### 4.3 算术运算符

+ 加法器

  ```verilog
  always@(*)begin
      C = A + B;
  end
  ```

+ 减法器

  ```verilog
  always@(*)begin
      C = A - B;
  end
  ```

+ 乘法器（移位相加）

  ```verilog
  always@(*)begin
      C = A * B;
  end
  ```

+ 除法器（转化为加法减法移位运算，占用资源大，慎用，尽量使除数为$2^n$）

  ```verilog
  always@(*)begin
      C = A / B;
  end
  ```

+ 求余器（转化为加法减法移位运算，占用资源大）

  ```verilog
  always@(*)begin
      C = A % B;
  end
  ```

#### 4.3.1 加法运算符

```verilog
assign C = A + B;
```

> 0 + 0 = 0;
>
> 0 + 1 = 1;
>
> 1 + 0 = 1;
>
> 1 + 1 = 10;

#### 4.3.2 减法运算符

```verilog
assign C = A - B;
```

> 0 - 0 = 0;
>
> 0 - 1 = 1; 同时借位
>
> 1 - 0 = 1;
>
> 1 - 1 = 0;

#### 4.3.3 乘法运算符

```verilog
assign C = A * B;
```

> 11 * 101
>
> 11 + 000 + 1100 = 1111

#### 4.3.4 除法和求余运算符

```verilog
assign C = A / B;
assign C = A % B;
```

计算过程涉及加法，减法，乘法（加法与移位）运算，规模庞大，慎重使用

#### 4.3.5 位宽问题

位宽与数值相比时不够优先保留低位，

位宽过大时进行向左补零。

#### 4.3.6 补码

为了保证加法的正确性，必须保留进位，即拓展位宽，

当期望结果中有正负之分时，可以通过增加一个符号位来区别结果的正负，

常使用最高位 0 表示正数，最高位 1 表示负数。

对二进制数：

+ 正数：保持不变
+ 负数：符号位保持不变，数值取反加 1 

即补码，以保证减法运算的正确性 

+ 预测结果的最大最小值，从而确定结果的信号位宽
+ 将加数、减数等数据，位宽拓展成结果位宽一致（补码扩位：负数高位全补 1 ，非负高位全补 0 ）
+ 将二进制加减法进行计算

### 4.4 逻辑运算符

#### 4.4.1 逻辑与【&&】

```verilog
// 1 位逻辑与
reg A,B;
always@(*)begin
    C = A && B;
end
// 多位逻辑与
reg[2:0] A,B,C;
always@(*)begin
    C = (A!=0) && (B!=0);
end
```

#### 4.4.2 逻辑或【||】

```verilog
// 1 位逻辑或
reg A,B;
always@(*)begin
    C = A || B;
end
// 多位逻辑或
reg[2:0] A,B,C;
always@(*)begin
    C = (A!=0) || (B!=0);
end
```

#### 4.4.3 逻辑非【!】

```verilog
// "!"是单目运算符，只要求有一个操作数
if (!a) begin
{
        
    }
end
```

#### 样例

```verilog
assign a = 4'b0111 && 4'b1000;
assign b = 4'b0111 || 4'b1000;
assign c = !4'b0111;
//等效为如下代码
assign a = 1'b1 && 1'b1;
assign b = 1'b1 || 1'b1;
assign c = !(1'b1);
```

#### 4.4.4 小结

+ 逻辑运算符的优先级

  逻辑运算中“**&&**”和“**||**”的优先级低于算属于算符；

  “**!**”的优先级高于双目逻辑运算符

  多使用括号区分优先级，以提高可读性

+ 逻辑运算两边对应的是 1 bit 信号

### 4.5 按位逻辑运算符

+ 一元非【~】（非门）
+ 二元与【&】（与门）
+ 二元或【|】（或门）
+ 二元异或【^】（异或门）

#### 4.5.1 单目按位与

单目按位与运算符 & ，运算符后为需要进行逻辑运算的信号，表示对信号进行每位之间相与的操作。

```verilog
reg[3:0]  A,C;
assign C =&A;
//等价于如下代码
C = A[3] & A[2] & A[1] & A[0];
//可用于判断是否为全1
```

#### 4.5.2 单目按位或

单目按位或运算符 |  ，运算符后为需要进行逻辑运算的信号，表示对信号进行每位之间相或的操作。

```verilog
reg[3:0]  A,C;
assign C =|A;
//等价于如下代码
C = A[3] | A[2] | A[1] | A[0];
//可用于判断是否为全0
```

#### 4.5.3 单目按位非

单目按位非运算符 ~  ，运算符后为需要进行逻辑运算的信号，表示对信号进行每位取反的操作。

```Verilog
reg[3:0] A,C;
assign C = ~A;
//等价于如下代码
C[3] = ~A[3], C[2] = ~A[2], C[1] = ~A[1], C[0] = ~A[0];
```

#### 4.5.4 双目按位与

双目按位与运算符 & ，信号位于运算符的左右两边，表示的是对这两个信号进行对应位相与的操作。

```verilog
reg[3:0] A,B,C;
assign C = A & B;
//等价于如下代码
C[0] = A[0] & B[0], C[1] = A[1] & B[1], C[2] = A[2] & B[2], C[3] = A[3] & B[3]; 
//如果操作数长度不相等，长度较小的操作数在最左侧添 0 补位
reg[1:0] A;
reg[2:0] B;
reg[3:0] C;
assign C = A & B;
//等价于如下代码
C[0] = A[0] & B[0], C[1] = A[1] & B[1], C[2] = 0 & B[2], C[3] = 0 & 0;
```

#### 4.5.5 双目按位或

双目按位或运算符 | ，信号位于运算符的左右两边，表示的是对这两个信号进行对应位相或的操作。

```verilog
reg[3:0] A,B,C;
assign C = A | B;
//等价于如下代码
C[0] = A[0] | B[0], C[1] = A[1] | B[1], C[2] = A[2] | B[2], C[3] = A[3] | B[3]; 
//如果操作数长度不相等，长度较小的操作数在最左侧添 0 补位
reg[1:0] A;
reg[2:0] B;
reg[3:0] C;
assign C = A | B;
//等价于如下代码
C[0] = A[0] | B[0], C[1] = A[1] | B[1], C[2] = 0 | B[2], C[3] = 0 | 0;
```

#### 4.5.6 双目按位异或

双目安慰异或运算符 ^ ，信号位于运算符的左右两边，表示的是对这两个信号进行对应位相异或的操作。

> 运算法则同上，样例略

#### 4.5.7 小结

+ 逻辑运算符和位运算符的区别

  逻辑运算符包括 && 、 || 、! ，位运算符包括 &、| 、~ 

  逻辑与运算符的运算只有逻辑真或逻辑假两种结果，即 1 或 0 

  而“&”是位运算符，用于两个多位宽数据操作。对于位运算符操作，两个数按位进行相与、相或、非。

### 4.6 关系运算符

运用比较器实现

+ 大于【>】
+ 小于【<】
+ 不小于【>=】
+ 不大于【<=】
+ 逻辑相等【==】
+ 逻辑不等【!=】

#### 样例

```verilog
always@(*)begin
    if(A==B)
        C = 1;
    else 
        C = 0;
end
```

关系操作符的结果为真（1）或假（0），如果操作数中有一位 X 或 Z ，那么结果为 X 。

### 4.7 移位运算符

+ 左移运算符【<<】
+ 右移运算符【>>】
+ 线的连接，实际占用资源极低

```verilog
reg[3:0] A;
reg[2:0] B;
always@(*)begin
    B = A >> 2;
end
//A[0]------X
//A[1]------X
//A[2]------B[0]
//A[3]------B[1]
//1'b0------B[2]
```

#### 4.7.1 左移运算符

用“ << ”表示左移运算符，一般表达式为：

```verilog
A << n;
```

A 代表要进行移位的操作数，n 代表要左移多少位。

左移操作属于逻辑移位，需要用 0 来填补移出的空位，即在低位补 0 ，左移 n 位，就要补 n 个 0 。

+ 左移操作不消耗逻辑资源
+ 左移操作需要根据位宽存储结果
+ 左移操作的操作数可以是常数，也可以是信号

#### 4.7.2 右移运算符

用“ >> ”表示右移运算符，一般表达式为：

```verilog
A >> n;
```

A 代表要进行移位的操作数，n 代表要右移多少位。

右移时需要在高位补 0 。

- 右移操作不消耗逻辑资源
- 右移操作需要根据位宽存储结果
- 右移操作的操作数可以是常数，也可以是信号

#### 4.7.3 小结

+ 通过左移进行乘法运算

  尽量使乘法乘以$2^n$，这样就可以使用左移运算实现，以减少使用的硬件资源

  ```verilog
  //a * 2 等价于 a << 1
  //a * 4 等价于 a << 2
  //a * 8 等价于 a << 3
  //...
  ```

  乘数不是$2^n$时，可以通过移位运算进行简化

  ```verilog
  assign b = a * 127;
  assign c = (a<<7)-a;
  //将乘法化为只占用一个减法器
  assign b = a * 67;
  assign c = (a<<6) + (a<<1) + a;
  // 67 = 64 + 2 + 1
  ```

  综合器会自动将常数进行优化，将前者变为后者。

+ 利用右移实现除法运算

  FPGA中尽量不使用除法，占用资源大于乘法**可能不能在一个时钟周期内得出结果**

  不得不使用除法时，应尽量使除法转化为除以$2^n$形式，便可以利用右移运算实现该除法运算，以大大减少使用的硬件资源。

  ```verilog
  //a / 2 等价于 a >> 1
  //a / 4 等价于 a >> 2
  //a / 8 等价于 a >> 3
  //...
  ```

  与左移不同的是，当除数不是$2^n$的常数时，**不能简单地通过移位运算来简化实现**，所以尽量避免在FPGA设计中使用除法。

+ 利用左移产生独热码

  独热码，也称 one-hot code，即只有 1bit 为 1，其他全是 0 的一种码制。

  可表示状态机的状态，或用于多选一的电路。

### 4.8 条件运算符

+ 选择器【case】

```verilog
//常见形式1
always@(*)begin
    case(S)
        2'b00 : C = D0;
        2'b01 : C = D1;
        2'b10 : C = D2;
        2'b11 : C = D3;
    endcase
end

//常见形式2
always@(*)begin
    C = D[S];
end

//常见形式3
always@(*)begin
    if(S==0)
        C = D0;
    else if(S==2'b01)
        C = D1;
    else
        C = D2;
end
```

#### 4.8.1 三目运算符

条件运算符“ ?: ”带有三个操作数，一般表达式为：

```verilog
条件表达式 ? 真表达式 : 假表达式;
condition_expr ? true_expr : false_expr;
```

含义为，当**条件表达式**为真（1）时，执行**真表达式**；当**条件表达式**为假时（0），执行**假表达式**。

+ 条件表达式的作用**类似于多路选择器**

+ 条件运算符可用在数据流建模中的条件赋值，这种情况下表达式作用**类似于开关**

  ```verilog
  wire[2:0] student;
  assign student = Marks >18 ? Grade_A : Grade_C;
  ```

+ 条件运算符可以嵌套使用，每个**真表达式**和**假表达式**本身就可以是一个条件表达式

#### 4.8.2 if 语句

if 语句语法如下：

```verilog
if(condition_1)
	procedural_statement_1;
{else if(condition_2)
    procedural_statement_2};
{else
    procedural_statement_3};
```

含义为，如果对 condition_1 条件满足，不管其余的条件是否满足，都执行 procedural_statement_1，而 procedural_statement_2 和 procedural_statement_3 都不执行；

如果condition_1 不满足而 condition_2 满足，则执行 procedural_statement_2，而 procedural_statement_1 和 procedural_statement_3 不执行；

如果 condition_1 不满足且 condition_2 也不满足时，执行  procedural_statement_3，而 procedural_statement_1 和  procedural_statement_2 都不执行。

+ 条件表达式需要用括号括起来
+ 若为 if - if 语句，使用块语句 begin – end 表示

#### 4.8.3 case 语句

case 语句是一个多路条件分支形式，语法如下：

```verilog
case(case_expr)
    case_item_expr{case_item_expr}: procedural_statement
        ...
    [deafult:procedural_statement]
endcase
```

case 语句下 首先对条件表达式 case_expr 求值，然后依次对各分支项求值并进行比较，执行第一个与条件表达式值相匹配的分支中的语句。可以在 1 个分支中定义多个分支项，且这些值不需要互斥。缺省分支覆盖所有没有被分支表达式覆盖的其他分支。

+ 缺省项必须写，防止产生锁存器

#### 4.8.4 选择语句

语法形式：

```verilog
vect[a +: b]
vect[a -: b]
```

vect 为变量名字，a为起始位置，**加号或减号代表着升序或者降序**，b表示进行升序或者降序的**宽度**

```verilog
vect[a : b] 等效于 vect[a : a+b-1]

vect[7 +: 3] == vect[7 : 9]
```

a 可以是一个常数也可以是一个变量，b 必须是一个常数。

#### 样例

```verilog
当cnt==0时，，将 din[7:0]赋值给 data[15:8]；当 cnt==1 时，将 din[7:0]赋值给 data[7:0]
data[15-8*cnt -: 8] <= din[7:0]
```

#### 4.8.5 小结

if 语句每个分支具有优先级（综合得到电路类似级联的结构），而 case 语句中每个分支是平等的（综合得到电路是一个多路选择器）。

多个if else - if 语句综合得到的逻辑电路延时可能比 case 语句稍大，但影响较小。

### 4.9 拼接运算符

+ 拼接运算符【{}】

将大括号内的线，按位置一对一连接

```verilog
reg[3:0] A;
reg[2:0] B;
always@(*)begin
    B={A[2],A[3],A[0]};
end
//A[1]------X
//A[0]------B[0]
//A[3]------B[1]
//A[2]------B[2]
```

拼接操作时将小表达式合并形成大表达式的操作，形式如下：

```verilog
{expr1,expr2,...,exprN};
```

拼接操作是更换组合方式，不消耗任何硬件资源。

#### 样例

```Verilog
wire[7:0] Dbus;
assign Dbus[7:4] = {Dbus[0],Dbuus[1],Dbus[2],Dbus[3]};
//以反转的顺序将低端 4 位赋给高端 4 位
assign Dbus = {Dbus[3:0], Dbus[7:4]};
//高 4 位与低 4 位交换
```

由于非定长常数的长度未知，不允许连接非定长常数。

## 5. 功能描述-时序逻辑

### 5.1 always 语句

时序逻辑一般有两种：**同步复位的时序逻辑**和**异步复位的时序逻辑**；

在同步复位的时序逻辑中复位不是立即有效，而在时钟上升沿是复位才有效，其结构如下：

```verilog
always@(posedge clk)begin
    if(rst_n==1'b0)begin
        语句
    end
    else begin
        语句
    end
end
```

在一部复位的时序逻辑中，复位立即有效，与时钟无关，其结构如下：

```verilog
always@(posedge clk or negedge rst_n)begin
    if(rst_n==1'b0)begin
        语句
    end
    else begin
        语句
    end
end
```

### 5.2 D 触发器

FPGA 中使用的触发器为 D 触发器

#### 5.2.1 D 触发器结构（略）

#### 5.2.2 D 触发器波形（略）

#### 5.2.3 D 触发器代码

```verilog
always@(posedge clk or negedge rst_n)begin
    if(rst_n==1'b0)begin
        q <= 0;
    end
    else begin
        q <= d;
    end
end
```

此代码总是在“时钟 clk 的上升沿 或 复位 rst_n 的下降沿”时执行一次

+ 复位 rst_n = 0，则 q 的值为 0
+ 复位 rst_n = 1，则将 d 的值赋给 q （前提条件是时钟上升沿的时候）

### 5.3 时钟

本次上升沿和上次上升沿之间占用的时间就是时钟周期，

时钟周期的倒数是时钟频率，

高电平占整个时钟周期的时间称为占空比。

#### 常用时钟频率及其对应时钟周期

| 时钟频率 | 时钟周期 |
| :------: | :------: |
|  100KHz  | 10,000ns |
|   1MHz   | 1,000ns  |
|   8MHz   |  125ns   |
|  50Mhz   |   20ns   |
|  100MHz  |   10ns   |
|  125MHz  |   8ns    |
|  150MHz  | 6.667ns  |
|  200MHz  |   5ns    |

### 5.4 时序逻辑代码和对应硬件（略）

> 模块之间同步执行，模块之内自上而下执行

### 5.5 阻塞赋值和非阻塞赋值

always 语句块中，支持**阻塞赋值**和**非阻塞赋值**，**阻塞赋值**使用“ **=** ”语句，**非阻塞赋值**使用“ **<=** ”语句

阻塞语句：在一个 begin–end 的多行赋值语句**，先执行当前行的赋值语句，再执行下一行的赋值语句**。

非阻塞赋值：在一个 begin–end 的多行赋值语句，**在同一时间内赋值**.

```verilog
begin
	c = a;
	d = c + a;
end
//////////////
begin
    c <= a;
    d <= c + a;// 此处 c 赋给 d 的值是旧的值
end
```

根据规范要求，**组合逻辑中应使用阻塞赋值**（**=**），**时序逻辑中应使用非阻塞赋值**（**<=**）。

# 附.FPGA音乐模块

```verilog
module		song(clk,beep);		//模块名称song		
input	    clk;				//系统时钟50MHz	
output		beep;				//蜂鸣器输出端
reg			beep_r;				//寄存器
reg[7:0] 	state;				//乐谱状态机
reg[16:0]	count,count_end;
reg[23:0]	count1;
//乐谱参数:D=F/2K  (D:参数,F:时钟频率,K:音高频率)
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
assign beep = beep_r;			//输出音乐
always@(posedge clk) begin
	count <= count + 1'b1;		//计数器加1
	if(count == count_end) begin	
		count <= 17'h0;			//计数器清零
		beep_r <= !beep_r;		//输出取反
	end
end

//曲谱 产生分频的系数并描述出曲谱
always @(posedge clk) begin
   if(count1 < TIME)             //一个节拍250mS
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
	8'D3:count_end=M_5;
	8'D4,8'D5:count_end=M_3;
	8'D6:count_end=M_3;
	8'D7:count_end=M_2;
   
	8'D8,8'D9:count_end=M_3;
	8'D10:count_end=M_3;
	8'D11:count_end=M_2;
	8'D12,8'D13:count_end=M_3;
	8'D14:count_end=L_6;
	8'D15:count_end=L_7;
	
	8'D16:count_end=M_1;
	8'D17:count_end=M_3;
	8'D18:count_end=M_2;
	8'D19:count_end=M_1;
	8'D20,8'D21:count_end=L_6;
	8'D22,8'D23:count_end=L_5;
	
	8'D24,8'D25,8'D26,8'D27,8'D28,8'D29,8'D30,8'D31:count_end=L_3;
	
	8'd32:count_end = L_6;  
	8'd33:count_end=M_1;
	8'd34:count_end=M_3;
	8'D35:count_end=M_5;
	8'D36,8'D37:count_end=M_3;
	8'D38:count_end=M_3;
	8'D39:count_end=M_2;
   
	8'D40,8'D41:count_end=M_3;
	8'D42:count_end=M_3;
	8'D43:count_end=M_2;
	8'D44,8'D45:count_end=M_3;
	8'D46:count_end=L_6;
	8'D47:count_end=L_7;
	
	8'D48:count_end=M_1;
	8'D49:count_end=M_3;
	8'D50:count_end=M_2;
	8'D51:count_end=M_1;
	8'D52,8'D53:count_end=L_6;
	8'D54,8'D55:count_end=L_5;
	
	8'D56,8'D57,8'D58,8'D59,8'D60,8'D61:count_end=L_6;
	8'D62:count_end=L_6;
	8'D63:count_end=L_7;
   default: count_end = 16'h0;
   endcase
   end
end
endmodule
```

参考网站：[FPGA从入门到精通（小白零基础速学）明德扬【FPGA至简设计原理与应用】自学FPGA必备教程-手把手教你学FPGA编程配套开发板_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1yf4y1R7gH?p=16&spm_id_from=pageDriver)

![EMT](EMT.jpg)