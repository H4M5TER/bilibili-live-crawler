const axios = require("axios");
const WebSocket = require("ws");
const Database = require("./db");
const getConfig = require("./conf").getConfig;
//读取配置 使用配置获得数据库
getConfig().then(config => Database.create(config)).then((temp) => {
	let config = temp[0];
	let database = temp[1];
	// monitoring用于记录uid是否监视
	let monitoring = new Array(config.uids.length).fill(false);
	// 定时检查监视用户是否开播 1分钟一次
	setInterval(() => {
		// 如果全部已经开播 跳过本次检查
		if (!monitoring.includes(false))
			return;
		// 获取直播列表 检查监视用户是否开播
		console.log("Getting online list.");
		axios.get("https://vup.darkflame.ga/api/online").then((response) => {
			return response.data.list; //axios的response和原生的response接口不同 response是一次性的
		}).then((list) => {
			console.log("Checking online list.");
			list.forEach((streamer) => {
				let index = config.uids.findIndex(uid => uid === streamer.uid);
				// 如果uid在监视列表内 且之前未开播
				if (index !== -1 && !monitoring[index]) {
					// 获取网站要求的token 连接websocket
					axios.post("https://vup.darkflame.ga/roomHub/negotiate?roomId=" + streamer.uid.toString() + "&negotiateVersion=1").then((response) => {
						let ws = new WebSocket("wss://vup.darkflame.ga/roomHub?roomId=" + streamer.roomId.toString() + "&id=" + response.data.connectionToken);
						ws.onopen = (event) => {
							ws.send('{"protocol":"json","version":1}\u001e');
							// websocket连接时 把当前uid记为已经监视
							monitoring[index] = true;
							console.log(streamer.uname + " is online.\nWebSocket opened.")
							// 开始发送网站应用层的心跳包 15秒一次
							setInterval(() => {
								ws.send('{"type":6}\u001e');
							}, 15 * 60 * 1000);
						}
						ws.onmessage = (event) => {
							// 拆开合并的数据包
							event.data.split("\u001e").filter(str => str).forEach((data) => { // 去除split最后的空串
								data = JSON.parse(data);
								// 排除心跳包和空包
								if (data.type !== 1) {
									console.log("Heartbeat reveived.")
									return;
								}
								// 交给与数据库交互的部分处理
								Database.store(database, data.arguments[1], streamer.uid, streamer.uname, streamer.participantDuring10Min); //TODO: 或许有更优雅的写法
							})
						}
						ws.onclose = (event) => {
							// websocket关闭时 把当前uid记为停止监视
							monitoring[index] = false;
						}
						ws.onerror = (event) => console.error(event.error());
					}).catch((error) => {
						//错误处理
						return console.error("Open websocket failed.\n" + error)
					});
				}
			});
		}).catch((error) => {
			return console.error("Check online failed.\n" + error);
		})
	}, 60000);
}).catch(error => {
	return console.error(error);
});
