---
title: C++序列去重排序
comment: true
mathjax: true
date: 2024-04-01 19:36:36
tags: [C++,string2int,优先队列]
updated: 2024-04-01 20:02:30
categories: [C++]
---

# C++序列去重排序

> 明明生成了 N 个 1 到 500 之间的随机整数。请你删去其中重复的数字，即相同的数字只保留一个，把其余相同的数去掉，然后再把这些数从小到大排序，按照排好的顺序输出。
>
> 数据范围：$1≤n≤1000 $ ，
>
> 输入的数字大小满足 $1≤ val ≤500$ 

> 解题思路：先处理输入，再去除重复，再排序；

## 1. 字符串处理为int类型

为了更好的处理大数，将输入的字符串处理为 int 类型更方便，如果不使用预先设定的函数可以读单个字符串，判断长度再单独计算每一个字符串对应的数值，

> Tips: 字符 0 对应的十进制值为 48，A - 64，a - 97.

此处介绍使用 C++ 自带的函数：

```c++
#include <cstring>
//将字符串转化为 int 类型
stoi() 	//参数是 const string* 类型
atoi()	//参数是 const char* 类型
//将数字常量（int,double,long等）转换为字符串（string），返回转换好的字符串
to_string()
```

- stoi() 会对转化后的数进行检查，判断是否会超出 int 范围，如果超出范围就会报错；
- atoi() 不会对转化后的数进行检查，超出上界，输出上界，超出下界，输出下界；

如果使用 atoi 对字符串 string 进行转化的话，就需要 **c_str()** 函数**将 const string\* 类型 转化为 cons char* 类型；**

c_str() 就是将 C++ 的 string 转化为 C 的字符串数组，生成一个 const char* 指针，指向字符串的首地址，

需要注意的是，此函数转换后返回的为一个临时指针，不能对其进行操作，

因为在c语言中没有string类型，必须通过string类对象的成员函数 c_str() 把 string 转换成c中的字符串样式；

## 2. 优先队列排序

去重的操作只需要新建一个空数组，用来比对原数组，将唯一一个值写入即可，此处不多赘述，

排序方法很多[（冒泡，选择，插入，希尔，归并，快速，堆……）](https://www.runoob.com/w3cnote/ten-sorting-algorithm.html)，单讲排序肯定在一篇内讲不完，此处针对做题讲一种偷懒的写法，即使用优先队列（二叉堆）；

- 二叉堆：特殊的完全二叉树（叶子只出现在最后2层，且最后一层叶子都靠左对齐），父结点值比子结点值大/小
- 最小堆：父结点值比子结点值都小
- 最大堆：父结点值比子结点值都大

```c++
priority_queue<类型，容器方式，比较方法> q;
priority_queue<int, vector< int>, greater< int> > q; //最小堆
priority_queue<int, vector< int>, less< int> > c; //最大堆
```

大小堆排序方法参考堆排序，此处只讲用法，通过将元素 push 进二叉堆，元素会在容器中自己执行排序操作，增加了做题的效率，

<video loop="loop" controls="controls" src="堆排序.mp4"></video>


- push()
  - push(x) 将令 x 入队，时间复杂度为 O(logN)，其中 N 为当前优先队列中的元素个数。
- top()
  - 可以获得队首元素（即堆顶元素），时间复杂度为 O(1) 。
- pop()
  - 令队首元素（即堆顶元素）出队，时间复杂度为 O(logN)，其中 N 为当前优先队列中的元素个数。
- empty()
  - 检测优先队列是否为空，返回 true 则空，返回 false 则非空。时间复杂度为 O(1)。
- size()
  - 返回优先队列内元素的个数，时间复杂度为 O(1)。

更多进阶用法可以参看[1.4 A*算法实现](https://www.liliaw.com/2024/03/16/%E5%AF%BB%E8%B7%AF%E7%AE%97%E6%B3%95/)内的代码注释(47 ~ 84行)；

最终使元素逐一出队即可得到排序后的结果，代码如下：

```c++
#include <iostream>
#include <bits/stdc++.h>	// 万能头
using namespace std;

int main() {
    vector<int> Buffer; 	// 输入数组
    vector<int> Buffer_tmp; // 比对数组
    string tmp;
    int temp = 0;
    bool flag = true;
    priority_queue<int,vector<int>, greater<> > out;
    while (cin >> tmp) {
        temp = stoi(tmp);// 处理为int
        Buffer.push_back(temp);
    }
    Buffer_tmp.push_back(Buffer[1]);
    for(int i = 1; i < Buffer.size(); i++)
    {
        // 遍历数组寻找雷同
        for(int j : Buffer_tmp)
        {
            if(Buffer[i] == j)
                flag = false;
        }
        // 寻找唯一的值与重复但第一次出现的值，写入对比数组
        if(flag)
        {
            Buffer_tmp.push_back(Buffer[i]);
        }
        else 
        {
            flag = true;
        }

    }
    // 排序
    for(int & j : Buffer_tmp)
    {
        out.push(j);
    }
    // 输出
    while(!out.empty())
    {
        printf("%d\n",out.top());
        out.pop();      
    }
    // 释放
    priority_queue<int,vector<int>, greater<> >().swap(out);
    vector<int>().swap(Buffer);
    vector<int>().swap(Buffer_tmp);
}
```

代码中使用了一种 C++11 支持的用法，

```
for(int j : tmp)
for(int & j : tmp)
```

表示的对数组/容器（包括 string 类型）的每个元素执行相同的操作，j 表示第一个元素下标，不断循环，直到最后一个元素；

需要注意的是，若要对循环内容的数值进行更改需要使用 & 运算符。

参考网页：

1. [C++中stoi()，atoi() ，to_string()使用技巧-CSDN博客](https://blog.csdn.net/YXXXYX/article/details/119955817)
2. [C++中的 c_str() 函数-CSDN博客](https://blog.csdn.net/YXXXYX/article/details/119957061?spm=1001.2014.3001.5502)
3. [for (char c : s)这种循环方式的使用_for(char c:s)-CSDN博客](https://blog.csdn.net/wuxiecsdn/article/details/114589773)
4. [c++ STL二叉堆(优先队列)_c++堆stl-CSDN博客](https://blog.csdn.net/okok__TXF/article/details/120722582)
5. [1.0 十大经典排序算法 | 菜鸟教程 (runoob.com)](https://www.runoob.com/w3cnote/ten-sorting-algorithm.html)
6. [C++ 语言中 priority_queue 的常见用法详解 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/478887055)