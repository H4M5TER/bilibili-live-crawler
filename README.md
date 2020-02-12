# bilibili-live-crawler

## 简介

一个b站直播数据爬虫，使用InfluxDB进行存储。

## 部署

### 1. 下载

clone或下载本项目到本地

### 2. 准备环境

在工作目录执行

```bash
npm install
```

### 3. 安装数据库

根据您服务器的系统参考下方网站  
<https://portal.influxdata.com/downloads/>  
<https://docs.influxdata.com/influxdb/v1.7/introduction/installation/>

### 4. 创建数据库

打开InfluxDB的CLI 键入

```InfluxQL
CREATE DATABASE *数据库名字*
```

没有输出即为创建成功 数据库名字需要填入程序设置

### 5. 配置和运行

在工作目录执行

```bash
npm start
```

程序将会启动并生成config.json 修改配置后再次启动即可

```JSON
{
	"uid": [
		123,                         在这里填写监视的主播uid(而不是房间号)
		321
	],
	"database": {
		"name": "dbname",            在这里填写数据库名字
		"host": "localhost",         默认没有特殊需求不需要改动 数据库服务器在云端 需要和数据库的设置同步改动
		"port": 8086                 同上 如果端口冲突 需要和数据库的设置同步改动
	}
}
```

### 6. 其他配置

如果需要开机启动、记录日志等功能 请自行配置pm2、systemd等  
如果需要配置InfluxDB 请参阅
<https://docs.influxdata.com/influxdb/v1.7/administration/config/>

## TODO

### 重构

目前的实现是爬取一个提供b站vtuber/vup直播数据监控但是不提供历史数据的站点，  
未来应自行实现爬取b站直播数据的功能。

### 发布

发布到npm/docker 便于部署

### 优化

优化数据库操作方式 分批存储数据
