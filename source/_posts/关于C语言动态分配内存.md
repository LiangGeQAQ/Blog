---
title: 关于C语言动态分配内存
mathjax: true
date: 2022-03-10 20:36:49
tags: [C,malloc,动态分配]
categories: C语言
comment: true
---
# 关于C语言动态分配内存

## 传统数组的缺点

1.  数组长度必须事先指定，只能是常量，不能是变量；
2.  长度不能再函数运行的过程中动态地扩充或缩小；
3.  数组所占内存空间程序员无法手动编程释放；

即静态内存问题

## malloc函数的使用

malloc 为一个系统函数，它是 memory allocate 的缩写。

其中 memory 是 内存 的意思，

allocate 是 分配 的意思，

即 分配内存 。

```c
# include <stdlib.h>
void *malloc(unsigned long size);
```

malloc 函数只有一个形参，并且是整型。该函数的功能是在内存的动态储存空间即堆中分配一个长度为 size 的连续空间。

函数的返回值是一个指向所分配内存空间起始地址的指针，类型为 void* 型。

malloc 函数的返回值是一个地址，这个地址就是动态分配的内存空间的起始地址。如果此函数未能成功地执行，

如内存空间不足，则返回空指针 NULL 。

静态变量（关键字为 static）与全局变量一样，都是在 “静态存储区” 中分配的。此区域在程序编译时就已经分配好了，且在程序的整个运行期间都存在；

而静态内存是栈中分配的，比如及局部变量。

**使用方法**

```c
int *p = (int *)malloc(4);
```

请求系统分配4字节的内存空间，并返回第一字节的地址，然后赋值给指针变量p。当用malloc分配动态内存之后，上面这个指针变量p就被初始化了。

由于malloc返回值类型为 void* 型，所以需要进行<u>类型强制转换</u>，==C语言中，void* 型可以不经转换（系统自动转换）地直接赋给任何类型的指针变量（函数指针变量除外）==。

## void和void*

void* 是定义一个无类型的指针变量，它可以指向任何类型的数据。

任何类型的指针变量都可以直接赋给 void* 型的指针变量，无需进行强制类型转换。

不能对 void* 型的指针变量进行运算操作，

原因是，int* 型的指针变量加 1 就是移动 4 个单元，因为 int* 型的指针变量是 int 型数据；但是 void* 型可以指向任何数据类型的数据，所以无法知道 “1” 所表示的是几个内存单元。

>   int *p = (int *)malloc(4);

如上使用方法中，指针变量 p 是静态分配的。

动态分配的内存空间都有一个标志，即都是用一个系统的动态分配函数实现的。

而指针变量 p 使用传统的方式定义的，所以是静态分配的内存空间。

而 p 所指向的内存是动态分配的。



一个简单的木马程序：内存泄漏

```c
# include <stdio.h>
# include <stdlib.h>  //malloc()的头文件
int main(void)
{
    while (1)
    {
        int *p = malloc(1000);   
    }
    return 0;
}
```

当内存全部使用完成后，会启动虚拟内存，

即把硬盘里的一块区域当成内存来使用，

当虚拟内存都用完了，整个系统就死机了。

若为*int*类型时，为增强程序的可移植性，应当如下写法

```c
int *p = malloc(sizeof(int));
```

sizeof 的后面可以紧跟类型，也可以直接跟变量名。如果是变量名，那么就表示该变量在内存中所占的字节数。所以 \*p 是 int 型的，那么 sizeof*p 就表示 int 型变量在内存中所占的字节数。

```c
int *p = malloc(sizeof*p);
```

## free函数的使用

```c
# include <stdlib.h>
void free(void *p);
```

free 函数无返回值，它的功能是释放指针变量 p 所指向的内存单元。

此时 p 所指向的那块内存单元将会被释放病患给操作系统，不再归它使用。

操作系统可以重新将它分配给其他变量使用。

释放并不是指清空内存空间，而是指将该内存空间标记为“可用状态”，使操作系统在分配内存时可以将它重新分配给其他变量使用。

指针变量 p 被释放后，任然指向那块内存空间，只是那块内存空间已不属于它。

为避免造成错误，在指针变量被释放后，要立刻把它的指向改为 NULL 。

## 总结

malloc与ffree一定要成对存在，一一对应。

静态内存是不能用free释放的。



## 使用malloc创建动态数组

```c
a = (double *) malloc(n * sizeof(double));		
```

我们用malloc()创建一个数组。除了用malloc()在程序运行时请求一块内存，还需要一个指针记录这块内存的位置。



```c
double * a;
a = (double *) malloc(30 * sizeof(double));
```

malloc()和free()配套使用
free()将内存归还内存池
malloc()和free()的原型都在stdlib.h头文件中
使用malloc()，程序可以在运行时才确定数组大小。如下：

```c
#include <stdio.h>
#include <stdlib.h>			// 为malloc(), free()提供原型

int main(void)
{
	double * a;
	int max;
	int number;
	int i = 0;
	printf("What is the maximum number of type double entries?\n");
	if(scanf("%d", &max) != 1)
	{
		printf("Number not correctly entered -- bye.\n");
		exit(EXIT_FAILURE);
	}
	a = (double *) malloc(max * sizeof(double));
	if(a == NULL)
	{
		printf("Memory allocation failed. Goodbye.\n");
		exit(EXIT_FAILURE);
	}
	// a 现在指向有max个元素的数组
	printf("Enter the values (q to quit):\n");
	while(i < max && scanf("%lf", &a[i]) == 1)
		++i;
	printf("Here are your %d entries:\n", number = i);
	for(i = 0; i < number; i++)
	{
		printf("%7.2f ", a[i]);
		if(i % 7 == 6)
			printf("\n");
	}
	if(i % 7 != 0)
		printf("\n");
	printf("Done.\n");
	free(a);

	return 0;
}

```







参考网站：

[C语言 用malloc()创建动态数组](https://blog.csdn.net/weixin_43760909/article/details/87936133)

[动态内存分配，C语言动态内存分配详解 ](http://c.biancheng.net/view/223.html)