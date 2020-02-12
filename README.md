# bilibili-live-crawler

## 简介

一个b站直播数据爬虫，使用InfluxDB进行存储。

## 部署

### 1. 下载

clone或下载本项目到本地

### 2. 准备环境

在项目目录执行

```bash
npm install
```

### 3. 安装数据库

根据您服务器的系统参考下方网站  
<https://portal.influxdata.com/downloads/>  
<https://docs.influxdata.com/influxdb/v1.7/introduction/installation/>

### 4. 启动程序

在项目目录执行

```bash
npm start
```

或

```bash
node app.js
```

### 5. 开机启动

...

## TODO

### 重构

目前的实现是爬取一个提供b站vtuber/vup直播数据监控但是不提供历史数据的站点，  
未来应自行实现爬取b站直播数据的功能。

### 发布

发布到npm/docker 便于部署
