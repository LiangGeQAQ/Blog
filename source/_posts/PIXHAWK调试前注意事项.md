---
title: PIXHAWK调试前注意事项
mathjax: true
date: 2024-03-04 21:34:41
tags: [PIXHAWK,调试]
updated: 2024-03-05 19:19:57categories:  [PIXHAWK]
comment: true
---

# PIXHAWK调试前注意事项

> 拿到PIXHAWK飞控后，需根据情况刷对应飞机的固件，有的tb店出厂默认刷好四轴固件。

地面站下载：http://firmware.ardupilot.org/Tools/MissionPlanner/MissionPlanner-latest.msi

## 1.上传FMUV3固件

如图选择四旋翼固件，进行升级，

<div align = "center"><img src="固件升级.png"  width=""  height = "" /></div>

此处 **Platform** 选择 **fmuv3**，此时的操作请确保 **PIXHAWK** 已经连接好电脑，稍后会提示将设备拔出后再重新接入，

<div align = "center"><img src="fmuv3.png"  width=""  height = "" /></div>

> 注意事项：
>
> + 若提示“Is this a CubeBlack”，此时需要选择 No，若将固件刷新成 CubeBlack[请点我](http://pix.1yuav.com/wen-ti-ji-jin/shua-cuo-gu-4ef6-shua-cheng-cubeblack-gu-jian-ru-he-jie-jue.html)。
> + 若提示下载 chibiOS 时，请选择 No。
>   + 只有win10正本版系统才能刷此系统固件，否则会遇到驱动问题；
>   + 若使用win7刷完固件可能会导致驱动无法识别；
>   + Nuttx 支持 win10及以下的系统；
>   + chibiOS只支持部分 win7 pro正版系统、win10正版系统；
>   + 两者在使用和性能上无区别；
>   + 4.0以后的固件，均只有chibiOS固件。

## 2.接口说明

<div align = "center"><img src="详情图.jpg"  width=""  height = "" /></div>

<div align = "center"><img src="pix接线图.jpg"  width=""  height = "" /></div>

> 注意：
>
> + 飞控箭头方向与GPS箭头方向始终保持一致，朝向无人机的正前方；

电调接线如下图所示，

<div align = "center"><img src="BEC-jiexian.jpg"  width=""  height = "" /></div>

## 3.常规四旋翼接线图

<div align = "center"><img src="四旋翼接线图.png"  width=""  height = "" /></div>

多轴安装：

+ 电机编号与APM输出通道一一对应；
+ 电机旋转方向以图中的箭头方向通过调换电机的任意两根线确定；
+ 桨叶的安装根据电机的旋转方向选择对应迎角的桨叶。

## 4.飞控调试顺序

> 使用地面站软件连接飞控前请确保
>
> + SD卡插入飞控；
> + 飞控中间的RGB LED灯闪烁（不能红灯常亮，也不可LED灯不亮）；
> + 端口波特率选择正确。

1. 按照需求刷对应的固件；
2. 选择正确的机架类型；
3. 校准加速度，成功后飞控断电，重新连接，飞控放平，校准水平；
4. 校准罗盘，成功后飞控断电重新连接；
5. 校准遥控器；
6. 解锁。

> 注意：
>
> + 飞控接入电脑后，等待飞控启动 BootLoader 端口后再启动飞控程序端口，最好等待大灯的红蓝闪烁完成后再点击连接；
> + 若连接电脑后红灯常亮，将飞控断电，重新插好SD卡；
> + 若RGB LED灯不亮，可能是如下原因：
>   + 刷错固件；
>   + 在刷固件页面插入飞控，应在飞行数据页面进行连接；
>   + SD卡未插好。



参考网页：

1. [调试前，务必阅读 · GitBook (1yuav.com)](http://pix.1yuav.com/diao-shi-qian-ff0c-wu-bi-yue-du.html)

2. [接口说明 · GitBook (1yuav.com)](http://pix.1yuav.com/jie-kou-shuo-ming.html)
3. [飞控调试顺序 · GitBook (1yuav.com)](http://pix.1yuav.com/wen-ti-ji-jin/fei-kong-diao-shi-shun-xu.html)
4. [配件接线 · GitBook (1yuav.com)](http://pix.1yuav.com/pei-jian-jie-xian.html)
5. [飞控连接地面站 · GitBook (1yuav.com)](http://pix.1yuav.com/fei-kong-lian-jie-di-mian-zhan.html)

<div align = "center"><img src="emt.png"  width=""  height = "" /></div>