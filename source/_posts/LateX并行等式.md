---
title: LateX并行等式
mathjax: true
date: 2022-07-08 14:53:50
tags: [LateX,换行]
categories: [LateX]
comment: true
---

```latex
\begin{split}
S_{PM}(t)
& = Acps[\omega_ct+K_{PM}m(t)]\\
& = Acos[\omega_ct+m_{PM}cos\omega_mt]\\
\end{split}
```


$$
\begin{split}
S_{PM}(t)
& = Acps[\omega_ct+K_{PM}m(t)]\\
& = Acos[\omega_ct+m_{PM}cos\omega_mt]\\
\end{split}
$$

> ​	上述方法在通过hexo转化成静态网页后会变成一长串，可以使用 \newline 来进行换行，虽然其在LateX中的含义相同，但这样数学公式插件转换后才是显示正确的。
>
> ​	不过需要注意的是 \newline 只能在块间使用，即形如
>
> ```latex
> \begin{xxx}
> xxx\newline
> xxx
> \end{xxx}
> ```
>
> ​	如上才能正确地使用，否则将会报错。

```latex
\begin{align}
S_{PM}(t)
& = Acps[\omega_ct+K_{PM}m(t)]\newline
& = Acos[\omega_ct+m_{PM}cos\omega_mt]\newline
\end{align}
```


$$
\begin{align}
S_{PM}(t)
& = Acps[\omega_ct+K_{PM}m(t)]\newline
& = Acos[\omega_ct+m_{PM}cos\omega_mt]\newline
\end{align}
$$


<center><cneter/>
​	下图是在Typora中看到的数学公式，两者显示相同。

![LateX并行等式](LateX并行等式.png)