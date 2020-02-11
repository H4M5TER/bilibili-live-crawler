const axios = require("axios");
const fs = require("fs");
const store = require("./db").store;

//读取配置文件
fs.readFile("config.json", "utf8", (err, data) => {
	//错误处理
	if (err) {
		//检测初始化
		if (err.code === "ENOENT") {
			console.log("config.json doesn't exist.\nIt will be created later.\nPlease edit it and start the crawler again.");
			const config = {
				"uid": [
					123456
				]
			};
			fs.writeFile("config.json", JSON.stringify(config, null, "\t"), "utf8", (err) => {
				if (err) {
					console.error(err);
					console.error("Create config.json failed.");
				}
			})
		}
		else {
			console.error(err);
		}
		return;
	}
	else
		const config = JSON.parse(data);
	// monitoring用于记录uid是否监视
	let monitoring = new Map();
	for (let i of config.uid)
		monitoring.set(i, false);
	// 定时检查监视用户是否开播 1分钟一次
	setInterval(() => {
		// 如果全部已经开播 跳过本次检查
		let flag = true;
		for (let i of monitoring) {
			if (i[1] === false) {
				flag = false;
				break;
			}
		}
		if (flag)
			return;
		// 获取直播列表 检查监视用户是否开播
		axios.get("https://vup.darkflame.ga/api/online").then((response) => {
			return response.data; //axios的response和原生的response接口不同
		}).then((data) => {
			data.list.forEach((streamer) => {
				// 如果开播
				if (monitoring.has(streamer.uid) && !monitoring.get(streamer.uid)) { //TODO: 或许有更优雅的写法
					// 获取网站要求的token 连接websocket
					axios.post("https://vup.darkflame.ga/roomHub/negotiate?roomId=" + streamer.uid.toString() + "&negotiateVersion=1").then((response) => {
						let ws = new WebSocket("wss://vup.darkflame.ga/roomHub?roomId=" + streamer.roomId.toString() + "&id=" + response.data.connectionToken);
						ws.onopen = (event) => {
							ws.send('{"protocol":"json","version":1}\u001e');
							// websocket连接时 把当前uid记为已经监视
							monitoring.set(streamer.uid, true);
							// 开始发送网站应用层的心跳包 15秒一次
							setInterval(() => {
								ws.send('{"type":6}\u001e');
							}, 15 * 60 * 1000);
						}
						ws.onmessage = (event) => {
							// 拆开合并的数据包
							event.data.split("\u001e").forEach((data) => {
								let data = JSON.parse(data);
								// 排除心跳包和空包
								if (data.type !== 1)
									return;
								// 交给与数据库交互的部分处理
								store(streamer.uid, streamer.uname, data.arguments[1], streamer.participantDuring10Min);
							})
						}
						ws.onclose = (event) => {
							// websocket关闭时 把当前uid记为停止监视
							monitoring.set(streamer.uid, false);
						}
					}).catch((err) => {
						//错误处理
						console.error("Open websocket failed.")
						return console.error(err);
					})
				}
			})
		}).catch((err) => {
			console.error("Check online failed.");
		})
	}, 60000)
})
