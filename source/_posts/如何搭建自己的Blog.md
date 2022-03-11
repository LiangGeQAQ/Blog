---
title: 如何搭建自己的Blog
mathjax: true
date: 2022-03-10 22:34:51
tags: [Hexo,Github,Vercel,Blog]
categories: [Hexo]
comment: true
---

# #前言

>   本文旨在将搭建本**Blog**的流程记录下来，并且让更多比我还小白的小白能看得明白
>
>   （也方便以后自己更改调试这些页面...），本文作者相关的基础也还在学习中，
>
>   有错误欢迎大家指正，文中出现的参考网站等，将会写在文末。

# 0. 简介

## 0.1 What is GitHub Pages？

**GitHub Pages** 是 **Github** 官方提供的免费的静态站点托管服务，通过 **GitHub 仓库** 托管与发布我们的静态网站页面，这样我们基本不用操心维护的问题。

这种方式的缺点就是，在国内访问 **Github** 的速度有点 ... 

[Know More](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

在不运用 **Vercle** 的时候我们使用此种方法。

本篇文章将着重讲三者（**GitHub + Hexo +Vercel**）同时使用的配置流程。

## 0.2 What is Hexo？

**Hexo** 是一个静态博客框架，基于 **Node.js** 运行，可以将我们撰写的 **Markdown** 文档（.md）解析渲染成静态的 **HTML** 网页，我所使用的写 **Markdown** 软件是 **Typora**。	

[Know More](https://hexo.io/zh-cn/)

## 0.3 What is vercel？

**Vercel** 是一家提供静态网站托管的云平台，能从 **Github** 仓库中拉取代码，能够有效地提升我们访问网站的速度。

[Know More](https://vercel.com/)

## 0.4 How they work？

本地撰写好 **Markdown** 格式文章后，通过 **Hexo** 解析文档，渲染生成各类主题样式的 **HTML** [静态网页](https://baike.baidu.com/item/%E9%9D%99%E6%80%81%E7%BD%91%E9%A1%B5/6327183)，再上传到 **GitHub** **Repo** 中，**Vercel** 通过拉拉取 **GitHub** **库** 中的数据以供访客访问。

<img src = 'https://s3.bmp.ovh/imgs/2022/03/40038a04b8da3713.png' />

----------------------

# 1. 基础准备

## 1.1 环境搭建

安装**Node.js** + 安装**Git**

[Node.js](https://nodejs.org/zh-cn)

[Git](https://git-scm.com/downloads)

安装完成后，用**Win** + **R** 键输入 **cmd** 并打开，

在命令框内输入 **node -v** 如果出现版本号则表示安装成功，

<img src = 'https://i.bmp.ovh/imgs/2022/03/182b37ed66fe4298.png' />

输入 **npm install -g yarn** 安装 **yarn**，

完成后同理检查版本已确认安装。

使用 **git --version** 完成检查。

## 1.2 账号注册

**Github**账号 + **vercel**账号 

## 1.3 域名准备

这个环节可有可无，感兴趣可以自己买一个域名...

这样就可以不用 **Vercel** 给出的。

------------------------------

# 2. 搭建步骤

## 2.1 连接GitHub

新建一个名为“**Blog**”的文件夹，

如果出现如下类似问题（即误操作权限等问题），

![](https://s3.bmp.ovh/imgs/2022/03/2b93afa21cdfea92.jpg)

分别给 **Node**、Git 与 我们创建的 **Blog** 文件夹管理员权限。

在文件夹内右键打开 “**Git Bash Here**”，

不然在创建<u>SSH密钥</u>时很可能出现 “**unknown key type -rsa**” 的错误。

在控制台内一次输入以下命令，

`git config --global user.name "GitHub 用户名"`
`git config --global user.email "GitHub 邮箱"`

## 2.2 SSH密钥

### 2.2.1 创建密钥

输入 `ssh-keygen -t rsa -C "GitHub 邮箱"`

之后只需要摁4次回车就🆗；

## 2.2.2 添加密钥

通过资源管理器进入如下目录 **[C:\Users\用户名\\.ssh]** （此处记得勾选“隐藏的项目”），

用记事本打开公钥 **id_rsa.pub** 文件 **Ctrl + A** 选择全部，复制内容。

登录**GitHub**，进入 **Settings** 界面，选择左栏的 **SSH and GPG  keys**，

选择 **New SSH key** ，**Title** 随便填写，

将 **id_rua.pub** ，将内容复制进 “**Key**”，

<img src = 'https://s3.bmp.ovh/imgs/2022/03/be87470507217303.png' />

这步以后，会出现一长串 **SSH** 密钥 ，在之后我们会用上。

## 2.3 进行连接

右键桌面空白部分，选择打开 **Git Bash** ，输入

`ssh -T git@github.com`

出现 “Are you sure......”等字样，输入 **yes**  回车确认。

显示“You’ve successfully......”等字样即连接成功。

## 2.3 创建Git Repo

在**GitHub**界面点击如下图所示 “**new repository**” 新建仓库，

![](https://i.bmp.ovh/imgs/2022/03/75160d297ca82600.png)

填写方式如下，

**README.md **可以不用勾选。

<img src = 'https://s3.bmp.ovh/imgs/2022/03/88161a9d9dbd2cfa.png' />

## 2.4 Hexo配置

### 2.4.1 安装 Hexo

使用 **npm** 安装程序

```text
npm install -g hexo
```

等待其安装完毕，时间也许会有点久...耐心等一下...

### 2.4.2 初始化

输入指令初始化，

`hexo init`

这时我们创建的**Blog**文件夹内会出现**Hexo**的各种文件，

结构如下

+   \_config.yml		# 配置文件
+   package.json       		# 应用程序信息
+   scaffolds		          # 模板
+   source 			        # 存放用户资源，文档等
    +   \_drafts
    +   \_posts
+   themes 			       # 主题文件夹
+   public			       # 网站文件

输入如下指令，生成静态网页，

`hexo g`

输入如下指令，可以访问 http://localhost:4000 在本地预览页面，

`hexo server`

按 **Ctrl + C** 关闭服务器。

## 2.5 上传至GitHub Repo

这部分属于**Git**的用法，本篇文章仅展示流程。

（我也不是理解的特别透彻，就不班门弄斧了🙏）

[Learn more]((https://zhuanlan.zhihu.com/p/21193604))

初始化**Git**

`git init`

选择当前文件夹所有的文件，

`git add .`

将选择追踪的文件全部加入<u>缓冲区</u>，

注释随意填写但不能为空，

`git commit -am “注释（代码提交信息）”`

创建**main**分支，

`git branch -M main`

<u>链接</u>即为自己**GitHub Repo**的<u>SSH</u>，如下图，

![](https://i.bmp.ovh/imgs/2022/03/c4fb128a4b566dcd.png)

确定连接至**Github** **Repo** ，

`git remote add origin “链接”`

这步结束以后会要求我们输入我们的 <u>SSH私钥</u>，

<img src="https://s3.bmp.ovh/imgs/2022/03/2940c32df77479f1.png" />

上传缓冲区的文件至**GitHub Repo**中的**main**分支，

`git push -u origin main`

这一步千万千万不要上传到**master**！！！

<center>千万不要！！！<center/>

## 2.6 Vercel配置

![](https://s3.bmp.ovh/imgs/2022/03/d0ec96c7463c99b2.png)

选择 “**Browse All Templates**” -> 选择 “**Hexo**” 模板

![](https://s3.bmp.ovh/imgs/2022/03/fe3685a4793c1cbc.png)

在此页面选择 “**Import a different Git Repository**”

选择我们最开始创建的 **GitHub Repo** 点击 “**Import**”

点击 “**Deploy**” 完成部署，

最后可通过图中连接进行访问我们的主页。

![](https://s3.bmp.ovh/imgs/2022/03/56d9cee4ac785336.png)

------------------------------------

# 3. 后期运营

我们搭建 **Blog** 在此就已经大体上搭建好了，

后期就是我们自己上传文章、配置各类文件或者使用主题进行美化等等。

## 3.1 新建文章

使用以下命令新建文章，

`hexo new post 文章名`

文章的模板储存在 “**scaffolds**” 文件夹中，可以更换里边的模板，

以更改我们创建的初始文章格式。

## 3.2 新建页面

使用以下命令新建页面，

`hexo new page 页面名`

模板储存同上。

## 3.3 上传页面

在我们在本地更新完页面以后，

文章储存在“**Blog\source\\_posts**” 中，

当我们更新完文件并生成静态页面以后，

依次使用

`git add .`

`git commit -am “注释”`

`git push -u origin main`

进行上传，**vercel** 将会自动部署。

## 3.4 清除页面

修改并部署后没有效果，

使用如下指令进行清除，然后再重新生成部署，

`hexo clean`

## 3.5 主题下载

在[Themes | Hexo](https://hexo.io/themes/)可以选择自己喜欢的主题，并在 **Blog** 文件夹页面，通过 **Git Bash Here** 进行下载，在相关的主题介绍内有其具体详细的介绍，在此就不多赘述。

---------------------------

# *4. 域名更换

## *4.1 Vercel配置

如果我们购买了自己的域名，我们可以在

菜单栏中的 **Domain** 中点击 **Add**

选择我们要绑定的项目（即**Blog**），

点击 **Continue** ，

输入我们的 **域名 + 后缀** ，

添加完毕后会显示如下图的界面。

![](https://s3.bmp.ovh/imgs/2022/03/c44c3ef8c7d90e50.png)

## *4.2 DNS解析

进入我们的域名管理界面，

选择 “**DNS 解析**“ -> ”**域名解析**“，



![](https://s3.bmp.ovh/imgs/2022/03/daf5d128c5a5cfb1.png)

如图进行添加，我们就能够通过我们自己的域名访问**Blog**了。

--------------------------------------

# #结语

总的来说全程都是免费的，不花一分钱....这种方式并没有用到**GitHub Pages**，如果对这种方式该兴趣的可以看看参考网站的第一个。

这种方式写博客较为稳定，但是上传的过程会略显麻烦，却能在过程中学到很多的东西。

本篇文章也许有些地方还不够详尽，欢迎大家提出进行进一步修改，共同进步。

<img src="bg.png"  width="360"  height = "450" />











参考网站：

[使用 Hexo+GitHub 搭建个人免费博客教程（小白向） - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/60578464)

[静态网页 ](https://cn.bing.com/search?q=%E9%9D%99%E6%80%81%E7%BD%91%E9%A1%B5&cvid=d95f1ce54fda4d2dbdadf30305e9e274&aqs=edge..69i57.2690j0j1&pglt=171&FORM=ANNTA1&PC=ASTS)

[About GitHub Pages - GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

[Hexo](https://hexo.io/zh-cn/)

[vercel](https://vercel.com/)

[git - 入门指南 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/21193604)

[Vercel绑定个人域名 | Aymeticの小窝](https://aymetic.com/post/935c9419)