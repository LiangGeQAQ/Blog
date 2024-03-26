---
title: cin的iostate
comment: true
mathjax: true
date: 2024-03-26 20:20:45
tags: [C++,cin]
updated: 2024-03-26 20:20:45
categories: [C++]
---

# cin的iostate

> 今天在做机考题的时候看到了一种把 cin 写进 while 括号里的写法，而在练习平台能运行，在本地却会被一直要求进行输入，有点好奇原理是什么，所以就查阅了一下 cin >> x 的返回值

题目是获取字符串最后一个单词的长度，

```c++
#include <iostream>
#include <string>
using namespace std;

int main() {
    string Buffer;
    int len = 0;
    while (cin >> Buffer)
    {
        len = Buffer.length();
    }
    cout << len << endl;
}
```

这里并不能说 cin 的返回值，而是输入操作符 “>>”，cin 作为 C++ 的标准输入流，本身是一个对象，

io 流有四种条件状态：

- eofbit          已到达文件尾
- failbit          非致命的输入/输出错误，可挽回
- badbit         致命的输入/输出错误,无法挽回
- goodbit       正常，可继续使用

当一个 cin 对象作为条件选择、循环等的控制表达式时，编译器会将其转换为真值表达式，如果 cin 的 iostate 为 goodbit，则为真，反之为假；

所以在这种情况下，要正常退出就要对程序输入一个 EOF 表示流输入结束即可，

在 Windows 中输入 Ctrl+z，Linux 中输入 Ctrl+d，以模拟产生 EOF，

所以并不是程序有错，而是练习平台输入了 EOF，而在本地编辑器运行时没有输入 EOF ，在正常输入后再按下 Ctrl+z 便能正常运行。



参考网页：

1. [新手关于C++ cin 的返回值 - 索智源 - 博客园 (cnblogs.com)](https://www.cnblogs.com/suozhiyuan/p/11932985.html)
2. [C++笔记——io流条件状态_c++的io条件状态-CSDN博客](https://blog.csdn.net/CreateUserName_Keep/article/details/78831687)
3. [C++ cin>>n 的返回值_std::cin >> n-CSDN博客](https://blog.csdn.net/wx1458451310/article/details/88380713)