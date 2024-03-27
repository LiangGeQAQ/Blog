---
title: vector的用法
comment: false
mathjax: true
date: 2024-03-27 17:41:35
tags: [c++,vector]
updated: 2024-03-27 17:41:35
categories: [c++]
---

# vector 的用法

> 今天做的题目
>
> 写出一个程序，接受一个由字母、数字和空格组成的字符串，和一个字符，然后输出输入字符串中该字符的出现次数。（不区分大小写字母），数据范围：$1\leq n \leq 1000$
>
> 刚开始是用的把字符串长度写死的方法，但是这么写太浪费内存了，感觉不够优雅，然后查了查有没有更优雅的方式来解决；

## 1. 动态数组

最开始的写法是：

```c++
#include <array>
#include <iostream>
using namespace std;

int main() {
    std::array<string, 1000> Buffer;
    char flag;
    int cnt = 0,B_cnt = 0;
    int i = 0;
    while (cin >> Buffer[i]) { // 注意 while 处理多个 case
        i++;
    }
    for(B_cnt = i - 1; i > 0; i--)
    {
        for(int j = 0; j < Buffer[i - 1].length(); j++)
        {
            //Input cap
            if(Buffer[B_cnt][0] >= 65 && Buffer[B_cnt][0] <= 90)
            {
                if(Buffer[B_cnt][0] == Buffer[i - 1][j] || Buffer[B_cnt][0] + 32 == Buffer[i - 1][j])
                    cnt++;
            }
            //Input lower
            else if(Buffer[B_cnt][0] >= 97 && Buffer[B_cnt][0] <= 122)
            {
                if(Buffer[B_cnt][0] == Buffer[i - 1][j] || Buffer[B_cnt][0] - 32 == Buffer[i - 1][j])
                    cnt++;
            }
            else if(Buffer[B_cnt][0] == Buffer[i - 1][j])
                cnt++;

            
        }
    }
    if(cnt > 0)
        cnt--;
    cout << cnt << endl;
}
```

但是这么写发现如果输入的字符串中没有空格的话就等于浪费了 998 个字符串的空间，所以首先想到的是能不能开辟一块动态数组，

于是使用了 new 的方式来用动态数组进行内存分配，其格式为

```c++
int size = 1000;                        
int* Dynamic_Arr = new int[size];        //未初始化
int* Dynamic_Arr2 = new int[size]();     //默认的初始化；
string* Dynamic_Arr3 = new string[size]{"aa", "bb","cc", "dd", string(2, 'e') };      //显式的初始化
delete [ ] Dynamic_Arr；					//释放动态数组
```

释放一个动态数组时，或者说是指向数组的指针时，空括号是必须的。它告诉编译器，指针指向一个数组的第一个元素；使用动态数组时，一定要记得显式的释放内存，否则很容易出错。

这样这道题的版本就变成了：

```c++
#include <iostream>
using namespace std;

void main() {
    int size = 1000;
    string* Buffer = new string[size]();


    char flag;
    int cnt = 0, B_cnt = 0;
    int i = 0;
    while (cin >> Buffer[i]) { // 注意 while 处理多个 case
        i++;
    }
    for (B_cnt = i - 1; i > 0; i--)
    {
        for (int j = 0; j < Buffer[i - 1].length(); j++)
        {
            //Input cap
            if (Buffer[B_cnt][0] >= 65 && Buffer[B_cnt][0] <= 90)
            {
                if (Buffer[B_cnt][0] == Buffer[i - 1][j] || Buffer[B_cnt][0] + 32 == Buffer[i - 1][j])
                    cnt++;
            }
            //Input lower
            else if (Buffer[B_cnt][0] >= 97 && Buffer[B_cnt][0] <= 122)
            {
                if (Buffer[B_cnt][0] == Buffer[i - 1][j] || Buffer[B_cnt][0] - 32 == Buffer[i - 1][j])
                    cnt++;
            }
            else if (Buffer[B_cnt][0] == Buffer[i - 1][j])
                cnt++;


        }
    }
    if (cnt > 0)
        cnt--;
    cout << cnt << endl;
    delete[] Buffer;
}
```

但是尽管是动态的，但实质上还是在未知长度的情况下不能进行最大程度的空间利用，

有没有一种办法是，每读一次字符串就写入，如果后续还有再进行读入呢；

## 2. STL vector

此时就想到了 vector ，一种可以自动改变数组长度的数组，

### 2.1 vector 的定义

vector 是向量类型，是 STL 中的一种重要的容器，使用时应当包含头文件 \<vector\>

```c++
#include <vector>
using namespace std;
```

其定义格式为：

```c++
vector<类型名> 变量名;
```

类型名可以是int、double、char、struct，也可以是STL容器；

常见的初始化方式有：

```c++
vector<int> a(10); //定义了10个整型元素的向量（尖括号中为元素类型名，它可以是任何合法的数据类型），但没有给出初值，其值是不确定的。

vector<int> a(10,1); //定义了10个整型元素的向量,且给出每个元素的初值为1

vector<int> a(b); //用b向量来创建a向量，整体复制性赋值

vector<int> a(b.begin(),b.begin+3); //定义了a值为b中第0个到第2个（共3个）元素

int b[7]={1,2,3,4,5,9,8};
vector<int> a(b,b+7); //从数组中获得初值
```

### 2.2 vector 容器内元素的访问

主要有两种访问方式：

- 下标访问

类似于直接使用数组的下标访问其内部元素；

- 迭代器访问

迭代器（iterator）可以理解为指针：

```c++
vector<类型名>::iterator 变量名;
```

### 2.3 vector 常用函数

```c++
push_back()
```

在 vector 的最后一个向量后插入一个元素，其值为括号内的元素；因此要处理不定长数组进行内存分配的问题，只需要 push_back() 就好了；

```c++
pop_back()
```

删除 vector 的最后一个元素；

```c++
size()
```

返回 vector 中元素的个数，时间复杂度为O(1)；

```c++
clear()
```

用于清空 vector 中的所有元素**，**时间复杂度为O(N) ，其中N为 vector 中元素的个数；

```c++
back()
```

返回 vector 的最后一个元素；

```
front()
```

返回 vector 的第一个元素；

```
capacity()
```

返回 vector 在内存中总共可以容纳的元素个数；

```
swap()
```

将 vector 中的元素和括号中的元素进行整体性交换；可用于与空 vector 交换以释放内存；

```c++
insert()

a.insert(a.begin()+1,5); //在a的第1个元素（从第0个算起）的位置插入数值5，如a为1,2,3,4，插入元素后为1,5,2,3,4
a.insert(a.begin()+1,3,5); //在a的第1个元素（从第0个算起）的位置插入3个数，其值都为5
a.insert(a.begin()+1,b+3,b+6); //b为数组，在a的第1个元素（从第0个算起）的位置插入b的第3个元素到第5个元素（不包括b+6），如b为1,2,3,4,5,9,8，插入元素后为1,4,5,9,2,3,4,5,9,8
```

根据指定位置在 vector 中插入元素；

```c++
erase()

erase(a.begin()+1,a.begin()+3); //删除a中第1个（从第0个算起）到第2个元素，也就是说删除的元素从a.begin()+1算起（包括它）一直到a.begin()+3（不包括它）
```

删除指定位置的元素；



其他常用函数举例：

```c++
a.assign(b.begin(), b.begin()+3); //b为向量，将b的0~2个元素构成的向量赋给a
a.assign(4,2); //是a只含4个元素，且每个元素为2

a[i]; //返回a的第i个元素，当且仅当a[i]存在,此处若不存在将导致程序崩溃，在使用时需要注意是否访问越界

a.resize(10); //将a的现有元素个数调至10个，多则删，少则补，其值随机
a.resize(10,2); //将a的现有元素个数调至10个，多则删，少则补，其值为2

a.reserve(100); //将a的容量（capacity）扩充至100，也就是说现在测试a.capacity();的时候返回值是100.这种操作只有在需要给a添加大量数据的时候才显得有意义，因为这将避免内存多次容量扩充操作（当a的容量不足时电脑会自动扩容，当然这必然降低性能） 

a==b; //b为向量，向量的比较操作还有!=,>=,<=,>,<
```



## 3.  总结

最终的用 vector 来实现的代码如下，最终三者的运行结果是一致的，但是第三种写法能够容纳更长的输入字符串，其程序鲁棒性也更强（总的来说感觉更优雅一点…）。

```c++
#include <vector>
#include <iostream>
using namespace std;

void main() {
    std::vector<string> Buffer;
    string tmp;
    int cnt = 0, B_cnt = 0;
    int i = 0;
    while (cin >> tmp) { // 注意 while 处理多个 case
        Buffer.push_back(tmp);
        i++;
    }
    for (B_cnt = i - 1; i > 0; i--)
    {
        for (int j = 0; j < Buffer[i - 1].length(); j++)
        {
            //Input cap
            if (Buffer[B_cnt][0] >= 65 && Buffer[B_cnt][0] <= 90)
            {
                if (Buffer[B_cnt][0] == Buffer[i - 1][j] || Buffer[B_cnt][0] + 32 == Buffer[i - 1][j])
                    cnt++;
            }
            //Input lower
            else if (Buffer[B_cnt][0] >= 97 && Buffer[B_cnt][0] <= 122)
            {
                if (Buffer[B_cnt][0] == Buffer[i - 1][j] || Buffer[B_cnt][0] - 32 == Buffer[i - 1][j])
                    cnt++;
            }
            else if (Buffer[B_cnt][0] == Buffer[i - 1][j])
                cnt++;


        }
    }
    if (cnt > 0)
        cnt--;
    cout << cnt << endl;
    std::vector<string>().swap(Buffer);
}
```

参考网页：

1. [C++ vector的用法（整理）-CSDN博客](https://blog.csdn.net/wkq0825/article/details/82255984)
2. [【C++】标准模板库（STL）：超快入门！算法竞赛必看！ - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/344558356)
3. [【C++】细说C++中的数组之动态数组_c++动态数组-CSDN博客](https://blog.csdn.net/u013921430/article/details/79601429)