# bilibili-live-crawler

## 简介

一个b站直播数据爬虫，使用InfluxDB进行存储。

## 部署

### 1. 安装Node.js

<https://nodejs.org/en/download/>

### 2. 获取程序

```bash
npm install @h4m5ter/bilibili-live-crawler
```

### 3. 安装数据库

<https://portal.influxdata.com/downloads/>  
<https://docs.influxdata.com/influxdb/v1.7/introduction/installation/>

### 4. 配置和运行

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
		"writeRate": 60000,          程序累计存储多久数据后打包写入数据库 毫秒
		"host": "localhost",         默认没有特殊需求不需要改动 如果数据库服务器在云端 需要和数据库的设置同步改动
		"port": 8086                 同上 如果端口冲突 需要和数据库的设置同步改动
	}
}
```

### 5. 其他配置

如果需要开机启动、记录日志等功能 请自行配置pm2、systemd等  
如果需要配置InfluxDB 请参阅
<https://docs.influxdata.com/influxdb/v1.7/administration/config/>

## TODO

### 重构

目前的实现是爬取一个提供b站vtuber/vup直播数据监控但是不提供历史数据的站点，  
未来应自行实现爬取b站直播数据的功能。

### bin

命令行参数启动
