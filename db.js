const Influx = require("influx");

exports.connect = async (config) => {
	let influxServer = new Influx.InfluxDB({
		host: config.host,
		port: config.port,
		database: config.name,
		schema: [
			{
				measurement: "livestream",
				fields: {
					"popularity": Influx.FieldType.INTEGER,
					"comment": Influx.FieldType.INTEGER,
					"recent_comment_user": Influx.FieldType.INTEGER,
					"comment_user": Influx.FieldType.INTEGER,
					"silver_coin": Influx.FieldType.INTEGER,
					"free_gift_user": Influx.FieldType.INTEGER,
					"gold_coin": Influx.FieldType.INTEGER,
					"paid_gift_user": Influx.FieldType.INTEGER,
					"superchat": Influx.FieldType.INTEGER,
					"superchat_user": Influx.FieldType.INTEGER,
					"participant": Influx.FieldType.INTEGER,
					"fans_increment": Influx.FieldType.INTEGER
				},
				tags: [
					"uid",
					"uname",
					"start_time",
					"title"
				]
			}
		]
	});
	// 如果数据库不存在 创建数据库
	if (await influxServer.getDatabaseNames().then(array => array.includes(config.name)))
		influxServer.createDatabase(config.name);
	return influxServer;
};

exports.store = (influxServer, data, uid, uname, recent) => {
	influxServer.writePoints([
		{
			measurement: "livestream",
			tags: {
				uid: uid.toString(),
				uname: uname,
				start_time: (new Date(data.startTime)).toLocaleString(),
				title: data.title
			},
			fields: {
				"popularity": data.popularity,
				"comment": data.realDanmaku,
				"recent_comment_user": recent,
				"comment_user": data.danmakuUser,
				"silver_coin": data.silverCoin,
				"free_gift_user": data.silverUser,
				"gold_coin": data.goldCoin,
				"paid_gift_user": data.goldUser,
				"superchat": data.giftDanmaku,
				"superchat_user": data.giftDanmakuUser,
				"participant": data.participants,
				"fans_increment": data.fansIncrement
			},
			timestamp: (new Date(data.endTime)).getTime()
		}
	]).catch(e => console.error("Write database failed.\n" + e));
};
