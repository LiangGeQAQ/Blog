---
title: CST仿真半波偶极子天线
mathjax: true
date: 2024-04-06 19:18:06
tags: [CST,半波偶极子天线]
updated: 2024-04-06 19:18:06
categories: [CST]
comment: true
---

# CST 仿真半波偶极子天线

> 文中使用了两种参数来实现 2.724GHz 天线，一种是文内步骤图中所使用的参数（此种方式天线间隙需自行调整得小一些，并且计算式并未考虑间隙），一种是实验原理中提供的计算方式所得出的参数（但未在步骤图中与结果体现，可以自行更改参数重新运行仿真观察结果）；

## 1. 实验目的

+ 熟悉 CST Studio Suite 的使用；
+ 完成半波偶极子天线的仿真。

## 2. 实验原理

​	半波偶极子天线由两根直径和长度都相等的直导线组成，每根导线的长度为 1/4 工作波长。导线的直径远小于工作波长，在中间的两个端点上由等幅反相的电压激励，中间端点之间的距离远小于工作波长，可以忽略不计，其结构如图1所示，

<div align = "center"><img src="半波偶极子天线结构.png"  width=""  height = "" /></div>

<div align = "center"><b>图1 半波偶极子天线结构图</b></div>

这个结构可以看成是由终端开路的双线传输线张开而成的，平行双线传输线上的导行波在开路终端出将形成全反射，其电流沿线呈驻波分布，在开路终端处电流总为 0.

仿真参数计算方式：（单位：mm、GHz）
频率f，波长wv，天线长度L，天线半径r，端口距离gap，

+ f = 2.724;
  wv = 300 / f;
  L = 0457 * wv;
  r = wv / 200;
  gap = L / 200;         
+ 设置 外径 = r，Zmin = gap / 2， Zmax = gap / 2 + L / 2；
+ 由于振子导体有一定直径，末端分布电容增大（称为末端效应），末端电流实际不为零，这等效于振子长度增加，因而造成波长缩短。振子导体越粗，末端效应越显著，波长缩短越严重。所以半波偶极子天线长度略小于半个波长。

## 3. 实验步骤

1. 新建工程，运行 CST 并创建工程模板，在“New and Recent”界面选择“New Template”，如图2所示，

![创建工程](创建工程.png)

<div align = "center"><b>图2 新建工程样例</b></div>

2. 选择应用领域，选择微波与射频/光学应用点击“MICROWAVES & RF/OPTICAL”，再选择天线应用“Antennas”，如图3所示，

![applicationg_area](applicationg_area.png)

<div align = "center"><b>图3  选择应用领域</b></div>

3. 选择工作流，选择线结构“Wire”，如图4所示，

![workflow](workflow.png)

<div align = "center"><b>图4  选择工作流</b></div>

4. 设置求解器类型为时域求解器，选择“Time Domain”，如图5所示，

![时域求解器](时域求解器.png)

<div align = "center"><b>图5  选择求解器</b></div>

5. 设置单位，此步基本不用作更改，直接前往下一步，如图6所示，

![单位设置](单位设置.png)

<div align = "center"><b>图6  单位设置</b></div>

6. 扫频设置，设置频率范围为 2 ~ 4 GHz，如图7所示，

![频率设置](频率设置.png)

<div align = "center"><b>图7  扫频设置</b></div>

7. 点击“Finishi”完成工程创建。

8. 左下角3D工作区，双击空白添加变量，用以计算半波偶极子天线的长度，

    其中设置 

    lambda = 100，length = 0.25 * lambda，

    rad = 0.005 * lambda， dis = 1，如图8所示，

![设置变量](设置变量.png)

<div align = "center"><b>图8  设置变量</b></div>

9. 上方工作区“Moduling”，选择天线振子，模型选择圆柱体，如图9所示，

![选择圆柱体](选择圆柱体.png)

<div align = "center"><b>图9  选择圆柱体</b></div>

双击工作区，以放置圆柱体，直到跳出圆柱体参数设置窗口，
设置

“Outer radius”为 rad，“Inner radius”为0.0，

“Xcenter”为0，“Ycenter”为0，

“Zmin”为dis/2，“Zmax”为length，

“Segments”为0，“Material”为PEC，如图10所示，

<div align = "center"><img src="参数设置.png"  width=""  height = "" /></div>

<div align = "center"><b>图10  参数设置</b></div>

此时能正常生成一个单振子；

10. 另一个振子可以使用镜像来生成，上方工作区“Moduling”，选中刚才生成的振子，选择“Transform”中的“Mirror”，如图11所示，

![镜像生成](镜像生成.png)

<div align = "center"><b>图11  镜像生成</b></div>

设置窗口中，勾选“Copy”，Z轴参数设置为1，点击“Preview”，如图12所示，

<div align = "center"><img src="镜像参数.png"  width=""  height = "" /></div>

<div align = "center"><b>图12  镜像参数设置</b></div>

最终便能生成偶极子天线模型，如图13所示，

![偶极子天线模型](偶极子天线模型.png)

<div align = "center"><b>图13  偶极子天线模型</b></div>

11. 设置激励方式，选择离散端口馈电模式，上方工作区“Moduling”，“Pick Points”中选择“Pick Face Center”，分别选择两个天线相对的面的圆心点，如图14所示，

![选择面心](选择面心.png)

<div align = "center"><b>图14  选择面心</b></div>

若觉得操作困难可以右键选择查看模型方式选择“Rotate”，旋转模型，以选择两个面，如图15所示，

![设置两个中点](设置两个中点.png)

<div align = "center"><b>图15  设置两个中点</b></div>

12. 选择离散端口，上方工作区“Simulation”，选择“Discrete Port”中的“Discrete Port”，如图16所示，

<div align = "center"><img src="离散端口.png"  width=""  height = "" /></div>

<div align = "center"><b>图16  选择离散端口</b></div>

参数设置，阻抗为73.2Ω，如图17所示，

<div align = "center"><img src="阻抗设置.png"  width=""  height = "" /></div>

<div align = "center"><b>图17  阻抗设置</b></div>

13. 设置求解器，上方工作区“Simulation”，选择“Setup Solver”，如图18所示，设置完毕后（这里默认即可）点击“Start”，

![setup_solver](setup_solver.png)

<div align = "center"><b>图18  设置求解器</b></div>

14. 要查看远场结果，需要设置监视器，上方工作区“Simulation”，选择“Field Monitor”，如图19所示，

![监视器](监视器.png)

<div align = "center"><b>图19  设置监视器</b></div>

“Type”选择“Farfield/RCS”远场区，点击“OK”后，再次运行求解器，如图20所示，

<div align = "center"><img src="设置监视器.png"  width=""  height = "" /></div>

<div align = "center"><b>图20  监视器设置</b></div>

## 4. 仿真结果

1. 左侧工作区，点击“1D Results”再点击“S-Parameters”，即可看到天线的S参数，如图21所示，可以看到该天线在2.724GHz时工作效率最高，

![S参数](S参数.png)

<div align = "center"><b>图21  S参数</b></div>

2. 上方工作区“1D Plot”，点击“Z Smith Chart”，点击“Curve Markers”可添加标记，双击标记设置频率为 2.724GHz，如图22所示，

![Z史密斯圆图](Z史密斯圆图.png)

<div align = "center"><b>图22 史密斯圆图</b></div>

可以看出此时，特性阻抗为73.2Ω；

3. 左侧工作区，选择“VSMR”以观察分析电压驻波比，设置标记点 2.724GHz，如图23所示，

![电压驻波比](电压驻波比.png)

<div align = "center"><b>图23 电压驻波比</b></div>

4. 左侧工作区，“Farfield”中选择图表，勾选上方工作区中的“Show Structure”，可显示天线模型及其方向图，如图24所示，

![天线辐射图](天线辐射图.png)

<div align = "center"><b>图24 天线辐射图</b></div>

5. 上方工作区，点击“1D”可观察二位方向图，如图25所示，

![二维方向图](二维方向图.png)

<div align = "center"><b>图25 切换二维方向图</b></div>

![phi二维方向图](phi二维方向图.png)

<div align = "center"><b>图26 Phi=90截面二维方向图</b></div>

6. 上方工作区“Farfield Plot”，选择“Resolution and Scaling”中的“Constant”设置为“Theta”，即可得到另一个截面上的二维方向图，如图27所示，

![theta二维方向图](theta二维方向图.png)

<div align = "center"><b>图27 Theta=90截面二维方向图</b></div>

## 5. 结果

从仿真数据中可以看出，此次仿真设计了一个工作在2.724GHz的半波偶极子天线，符合实验要求与预期。可以尝试仿真另一个在原理中提到的实验数据，其工作效率更高，数据如图28、图29所示。

<div align = "center"><img src="计算数据设置.png"  width=""  height = "" /></div>

<div align = "center"><b>图28 实验数据</b></div>

<div align = "center"><img src="模型设置.png"  width=""  height = "" /></div>

<div align = "center"><b>图29 模型数据</b></div>

参考：

1. [半波偶极子天线——CST仿真（1）-CSDN博客](https://blog.csdn.net/m0_57263863/article/details/129324442)
2. [CST仿真半波偶极子天线学习笔记_cst天线仿真-CSDN博客](https://blog.csdn.net/qq_36521926/article/details/131504513)
3. [CST微波工作室学习笔记—14.天线设计实例_天线臂长度-CSDN博客](https://blog.csdn.net/qq_41542947/article/details/108036919)

