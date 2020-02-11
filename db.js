const Influx = require("influx");
const database = new Influx.InfluxDB({
	host: "localhost",
	database: "vup_db",
	schema: [
		{
			measurement: "livestream",
			fields: {
				"popularity": Influx.FieldType.INTEGER,
				"comment": Influx.FieldType.INTEGER,
				"recent_comment_user": Influx.FieldType.INTEGER,
				"comment_user": Influx.FieldType.INTEGER,
				"sliver_coin": Influx.FieldType.INTEGER,
				"free_gift_user": Influx.FieldType.INTEGER,
				"gold_coin": Influx.FieldType.INTEGER,
				"paid_gift_user": Influx.FieldType.INTEGER,
				"superchat": Influx.FieldType.INTEGER,
				"superchat_user": Influx.FieldType.INTEGER,
				"participant": Influx.FieldType.INTEGER,
				"fans_increment": Influx.FieldType.INTEGER
			},
			tags [
				"uid",
				"uname",
				"start_time",
				"title"
			]
		}
	]
});

exports.store = (uid, uname, data, recent) => {
	database.wriePoints([
		{
			measurement: "livestream",
			tags: {
				uid: uid.toString(),
				uname: uname,
				start_time: data.startTime,
				title: data.title
			},
			fields: {
				"popularity": data.popularity,
				"comment": data.realDanmuku,
				"recent_comment_user": recent,
				"comment_user": data.danmukuUser,
				"sliver_coin": data.sliverCoin,
				"free_gift_user": data.sliverUser,
				"gold_coin": data.goldCoin,
				"paid_gift_user": data.goldUser,
				"superchat": data.giftDanmuku,
				"superchat_user": data.giftDanmukuUser,
				"participant": data.participant,
				"fans_increment": data.fansIncrement
			}
		}
	])
}
