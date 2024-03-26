---
title: 【STM32学习记录】第二节-寄存器
mathjax: true
date: 2022-03-24 09:09:52
tags: [STM32,寄存器]
updated: 2022-03-24 09:21:31categories: [STM32] 
comment: true
---

+   相关说明

    本系列文章仅为个人学习记录，若有错误欢迎指出，相关的参考文章会在本文末进行列出，主要参考视频为**Blibili**[@正点原子官方](https://space.bilibili.com/394620890?from=search&seid=13393056502650554081&spm_id_from=333.337.0.0)，以及**Blibili**[@野火_firege](https://space.bilibili.com/356820657?from=search&seid=6957304932395919416&spm_id_from=333.337.0.0)。

    +   相关的可参考文件：

    [STM32 中文参考手册](http://www.stm32er.com/zb_users/upload/2021/01/202101191611046723128863.pdf)

    [STM32 选型手册 2021](https://www.stmcu.com.cn/upload/Selection_Guide.pdf)

    [STM32F103C8T6 ](https://pdf1.alldatasheetcn.com/datasheet-pdf/view/201596/STMICROELECTRONICS/STM32F103C8T6.html)
    
# 第三节 寄存器

## 1. 什么是寄存器

给有特定功能的内存单元取一个别名，这个别名就是常说的寄存器；

[STM32F103C8T6 数据手册](https://pdf1.alldatasheetcn.com/datasheet-pdf/view/201596/STMICROELECTRONICS/STM32F103C8T6.html)

数据手册第四节“**Memory mapping**”查看寄存器的地址；

中文参考手册

+   第2.3节“**存储器映像**”
+   第8.2节“**GPIO寄存器描述**”
    +   偏移地址、复位值······

### 1.1 存储器映射

存储区本身不具有地址信息，**<u>它的地址是由芯片厂商或用户分配</u>**，给**存储器分配地址的过程**成为存储器映射。

![](https://s3.bmp.ovh/imgs/2022/03/eb22994c2a44d2ee.png)

### 1.2 寄存器映射

通过绝对地址访问内存单元时，需对“地址”进行强制类型转换、更改类型为指针。

```c
//实现GPIOB 端口全部输出高电平
*(unsigned int*)(0x40010C0C) = 0xFFFF
```

通过寄存器别名方式访问内存单元

```c
#define GPIOB_ODR (unsignedint*)(0x40010C0C)
* GPIOB_ODR = 0xFF;
```

为方便操作，把指针操作“*****”也定义到寄存器别名里面

```
#define GPIOB_ODR *(unsignedint*)(0x40010C0C)
GPIOB_ODR = 0xFF;
```

外设从**APB1**总线开始

![](https://s3.bmp.ovh/imgs/2022/03/877665911bd6a46d.png)

![](https://s3.bmp.ovh/imgs/2022/03/01c329f6f4e8492e.png)

![](https://s3.bmp.ovh/imgs/2022/03/0199c29362773467.png)

定义各个寄存器为**结构体**成员，每个端口的[基地址赋值给结构体](#1.5 使用结构体封装寄存器列表)，

根据**总线地址**与**偏移地址**可以得到寄存器的**绝对地址**

### 1.3 GPIO端口置位/复位寄存器说明

**(GPIOx BSRR)(x=A...E)** 意为该寄存器名为“**GPIOx BSRR**”其中“**x**”可以为**A-E**，也就是说这个寄存器说明适用于**GPIOA**、**GPIOB**至**GPIOE**，这些GPIO端口都有这样的一个寄存器。

| 位说明 |   模式   |
| :----: | :------: |
|   r    |   可读   |
|   w    | 可读可写 |

|   总线   |
| :------: |
|  $AHB$   |
| $APB_2$  |
| $ APB_1$ |

+   找到总线的基地址
+   加上某个外设的偏移地址，可找到某个外设的基地址
    +   偏移地址在参考手册8.2中有标出
+   找到寄存器相对于外设基地址的偏移地址
+   用C语言的指针操作访问寄存器的绝对地址

### 1.4 总线和外设基址宏定义

```c
/*外设基地址*/
#define PERIPH_BASE		((unsigned int)0x40000000)

/*总线基地址*/
#define APB1PERIPH_BASE	PERIPH_BASE
#define APB2PERIPH_BASE	(PERIPH_BASE + 0x00010000)
#define AHBPERIPH_BASE	(PERIPH_BASE + 0x00020000)

/*GPIO外设基地址*/
#define GPIOA_BASE	(APB2PERIPH_BASE + 0x0800)
#define GPIOB_BASE	(APB2PERIPH_BASE + 0x0C00)
#define GPIOC_BASE 	(APB2PERIPH_BASE + 0x1000)
#define GPIOD_BASE	(APB2PERIPH_BASE + 0x1400)
#define GPIOE_BASE	(APB2PERIPH_BASE + 0x1800)
#define GPIOF_BASE	(APB2PERIPH_BASE + 0x1C00)
#define GPIOG_BASE 	(APB2PERIPH_BASE + 0x2000)

/*以GPIOB为例的寄存器基地址*/
#define GPIOB_CRL	(GPIOB_BASE+0x00)
#define GPIOB_CRH	(GPIOB_BASE+0x04)
#define GPIOB_IDR	(GPIOB_BASE+0x08)
#define GPIOB_ODR	(GPIOB_BASE+0x0C)
#define GPIOB_BSRR	(GPIOB_BASE+0x10)
#define GPIOB_BRR	(GPIOB_BASE+0x14)
#define GPIOB_LCKR	(GPIOB_BASE+0x18)
```

```c
/*让 PB0 输出高/低电平*/
#define PERIPH_BASE		((sunsigned int)0x40000000)
#define APB2PERIPH_BASE	(PERIPH_BASE + 0x00010000)
#define GPIOB_BASE		(APB2PERIPH_BASE + 0x0C00)
#define GPIOB_ODR		*(unsignedint*)(GPIOB_BASE+0x0C)

// PB0输出 输出低电平
GPIOB_ODR &= ~(1<<0);

// PB0输出 输出高电平
GPIOB_ODR |=(1<<0);
```

![](https://s3.bmp.ovh/imgs/2022/03/db0b701329e4e6b4.png)

```c
/*
~ 符号表示 取反 
| 符号表示 或
& 符号表示 与
*/

/*若要使上图10位 置1而其他位置0*/
GPIOB_ODR |= (1<<10);

/*若要使上图10位 置0而不改变其他位*/
GPIOB_ODR &= ~(1<<10);
```

运用“或”运算进行相加，

使得之前的位不会得到改变。

给第10位赋1，取反后，第10位为0其他位为1，

进行与运算，0&0=0，1&0=1，使其他位不变。

### 1.5 使用结构体封装寄存器列表

```c
/*使用结构体对 GPIO 寄存器组的封装*/
typedef unsigned		int uint32_t /*无符号32位变量*/
typedef unsigned short	int uint16_t /*无符号16位变量*/
    
/* GPIO 寄存器列表 */
typedef struct {
	uint32_t CRL	/*GPIO端口配置低寄存器	地址偏移：0x00*/
	uint32_t QRH	/*GPIO端口配置高寄存器	地址偏移：0x04*/
	uint32_t IDR	/*GPIO数据输入寄存器	 地址偏移：0x08*/
	uint32_t QDR	/*GPIO数据输出寄存器	 地址偏移：0x10*/
	uint32_t BSRR	/*GPIO位设置/清楚寄存器	地址偏移：0x14*/
	uint32_t LCKR	/*GPIO端口配置锁定寄存器	地址偏移:0x18*/
}GPIO_TypeDef
```

```c
/*通过结构体指针访问寄存器*/
GPIO_TypeDef * GPIOx;	//定义一个GPIO_TypeDef型结构体指针GPIOx
GPIOx = GPIOB_BASE;		//把指针地址设置为宏GPIOH_BASE地址
GPIOx->IDR = 0xFFFF;
GPIOx->ODR = 0xFFFF;

uint32_t temp
temp = GPIOx->IDR;		//读取GPIOB_IDR寄存器的值到变量temp中
```

### 1.6 定义GPIO端口基地址指针

```c
/*使用GPIO_TypeDef把地址强制转换成指针*/
#define GPIOA		((GPIO_TypeDef *)GPIOA_BASE)
#define GPIOB		((GPIO_TypeDef *)GPIOB_BASE)
#define GPIOC		((GPIO_TypeDef *)GPIOC_BASE)
#define GPIOD		((GPIO_TypeDef *)GPIOD_BASE)
#define GPIOE		((GPIO_TypeDef *)GPIOE_BASE)
#define GPIOF		((GPIO_TypeDef *)GPIOF_BASE)
#define GPIOG		((GPIO_TypeDef *)GPIOG_BASE)
#define GPIOH		((GPIO_TypeDef *)GPIOH_BASE)

/*使用定义好的宏直接访问*/
/*访问GPIOB端口的寄存器*/
GPIOB->BASRR = 0xFFFF;	//通过指针访问并修改GPIOB_BSRR寄存器
GPIOB->CRL = 0xFFFF;		//修改GPIOB_CRL寄存器
GPIO->ODR = 0xFFFF;		//修改GPIOB_ODR寄存器

uint32_t temp;
temp = GPIOB->IDR;		//读取GPIOB_IDR寄存器的值到变量temp中

/*访问GPIOA端口的寄存器*/
GPIOA->BSRR = 0xFFFF;
GPIOA->CRL = 0xFFFF;
GPIOA->ODR = 0XFFFF;

uint32_t temp;
temp = GPIOA->IDR		//读取GPIOA_IDR寄存器的值到变量temp中
```






参考网站：

[【单片机】野火STM32F103教学视频 (配套霸道/指南者/MINI)【全】(刘火良老师出品) (无字幕)_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1yW411Y7Gw)

<center>暂时就这样，持续更新ing...<center/>

![EMT](EMT.png)