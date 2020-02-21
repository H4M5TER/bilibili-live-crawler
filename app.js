const axios = require("axios");
const WebSocket = require("ws");
const Database = require("./db");
const getConfig = require("./conf").getConfig;
//初始化函数 读取配置 使用配置获得数据库
let intialize = async () => {
	let config = await getConfig();
	return {
		"uids": config.uids,
		"writeRate": config.database.writeRate,
		"influxServer": await Database.connect(config.database)
	};
}

intialize().then((config) => {
	// monitoring用于记录uid是否监控
	let monitoring = new Array(config.uids.length).fill(false);
	// 定时检查监控用户是否开播 1分钟一次
	setInterval(async () => {
		// 如果全部已经开播 跳过本次检查
		if (!monitoring.includes(false))
			return;
		// 获取直播列表 检查监控用户是否开播
		let online;
		try {
			online = (await axios.get("https://vup.darkflame.ga/api/online")).data.list;
		} catch (error) {
			console.error("Can't get online list.");
			throw error;
		}
		online.forEach(async streamer => { // forEach会并行调用所有的callback 而不是await阻塞串行调用
			let index = config.uids.findIndex(uid => uid === streamer.uid);
			// 如果uid不在监控列表内
			if (index === -1)
				return;
			// 如果uid已经开播
			if (monitoring[index])
				return;
			let token;
			// 获取网站要求的token 连接websocket
			try {
				token = (await axios.post("https://vup.darkflame.ga/roomHub/negotiate?roomId=" + streamer.uid.toString() + "&negotiateVersion=1")).data.connectionToken;
			} catch (error) {
				console.error("Can't get websocket token.\n");
				throw error;
			}
			let ws = new WebSocket("wss://vup.darkflame.ga/roomHub?roomId=" + streamer.roomId.toString() + "&id=" + token);

			ws.onopen = (event) => {
				ws.send('{"protocol":"json","version":1}\u001e');
				// websocket连接时 把当前uid记为已经监控
				monitoring[index] = true;
				console.log(streamer.uname + " is online.\nWebSocket opened.")
				// 开始发送网站应用层的心跳包 15秒一次
				setInterval(() => {
					ws.send('{"type":6}\u001e');
				}, 15 * 60 * 1000);
			};

			ws.onmessage = (event) => {
				// 拆开合并的数据包
				event.data.split("\u001e").filter(str => str).forEach((data) => { // 去除split最后的空串
					data = JSON.parse(data);
					// 排除心跳包和空包
					if (data.type !== 1)
						return;
					// 交给与数据库交互的部分处理
					Database.store(data.arguments[1], streamer.uid, streamer.uname, streamer.participantDuring10Min); //TODO: 或许有更优雅的写法
				})
			};

			ws.onclose = (event) => {
				// websocket关闭时 把当前uid记为停止监控
				monitoring[index] = false;
			};

			ws.onerror = event => console.error(event.error());
		});
	}, 60000);

	setInterval(() => {
		Database.commit(config.influxServer);
	}, config.writeRate);
}, e => console.error(e));
