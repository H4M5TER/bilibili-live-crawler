const axios = require("axios");
const fs = require("fs");
const getCookie = require("./cookie").getCookie;
const store = require("./database").store;

fs.readFile("config.json", "utf8", (err, data) => {
	if (err) {
		if (err.code === "ENOENT") {
			console.log("config.json doesn't exist.\nIt will be created later.\nPlease edit it and start the crawler again.");
			const config = {
				"streamer": [
					{
						"name": "name",
						"uid": 123456
					}
				]
			};
			try {
				config.cookie = getCookie();
			} catch (err) {
				console.error("Cookie can't fetch: " + err.toString());
			}
			fs.writeFile("config.json", JSON.stringify(config, null, "\t"), "utf8", (err) => {
				if (err) {
					console.error(err);
					console.error("Create config.json failed.");
				}
			})
		}
		else {
			return console.error(err);
		}
	}
	else
		const config = JSON.parse(data);

	{
		let remains = (new Date()).getTime() - (new Date(config.cookie.expires)).getTime();
		setTimeout(() => {
			config.cookie = getCookie();
			setInterval(() => {
				config.cookie = getCookie();
			}, 2592000000 - 6000);
		}, remains < 6000 ? 0 : remains - 6000)
	}

	let monitoring = new Map();
	config.streamer.forEach((streamer) => {
		monitoring.set(streamer.uid, false);
	});
	let checkOnline = setInterval(() => {
		let flag = true;
		for (let i of monitoring) {
			if (i[1] === false) {
				flag = false;
				break;
			}
		}
		if (flag)
			return;
		axios.request({
			url: "https://vup.darkflame.ga/api/online",
			method: "GET",
			header: {
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.131 Safari/537.36",
				"cookie": config.cookie.value;
			}
		}).then((response) => {
			return response.json();
		}).then((data) => {
			data.list.forEach((streamer) => {
				if (monitoring.has(streamer.uid) && !monitoring.get(streamer.uid)) {
					let connectionToken;
					axios.request({
						url: "https://vup.darkflame.ga/roomHub/negotiate?roomId=21752710&negotiateVersion=1",
						method: "POST",
						header: {
							"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.131 Safari/537.36",
							"cookie": config.cookie.value;
						}
					}).then((response) => {
						return response.json();
					}).then((data) => {
						connectionToken = data.connectionToken;
					}).catch((err) => {
						console.error("Get websocket token failed.")
						return console.error(err);
					})
					let ws = new WebSocket("wss://vup.darkflame.ga/roomHub?roomId=" + streamer.roomId.toString() + "&id=" + connectionToken);
					ws.onopen = (event) => {
						ws.send('{"protocol":"json","version":1}\u001e');
						monitoring.set(streamer.uid, true);
						setInterval(() => {
							ws.send('{"type":6}\u001e');
						}, 15 * 60 * 1000);
					}
					ws.onmessage = (event) => {
						event.data.split("\u001e").forEach((data) => {
							let _data = JSON.parse(data);
							if (_data.type !== 1)
								return;
							store(_data);
						})
					}
					ws.onclose = (event) => {
						monitoring.set(streamer.uid, false);
					}
				}
			})
		}).catch((err) => {
			console.error("Check online failed.");
		})
	}, 60000)
})
