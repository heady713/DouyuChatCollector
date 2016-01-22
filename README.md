##斗鱼主播界面弹幕采集chrome插件##

解析**主播名称**，**当前在线人数**和**弹幕内容**。

本来是想做一些数据研究。。

写好之后发现挖不出个啥。。  **呵呵哒**

## 使用说明 ##

**打包和安装参考**
https://developer.chrome.com/extensions/getstarted#unpacked

**使用方法**
打开斗鱼主播页面，插件的**页面按钮**将显示在地址栏中，默认为灰色，点击则开始抓取弹幕，默认1分钟（Chrome API支持的最短周期）抓取1次。支持多个tab页同时抓取。

**数据存储**
>C:\Users\%USERNAME%\AppData\Local\Google\Chrome\UserData\Default\databases\chrome-extension_{extension_id}\

文件请使用SQLite工具打开。
