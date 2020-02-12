const fs = require("fs");

function intializeConfig() {
	console.log("config.json doesn't exist.\nIt will be created later.\nPlease edit it and restart again.");
	fs.promises.writeFile(
		"config.json",
		JSON.stringify({
			"uids": [
				123456
			],
			"database": {
				"name": "dbname",
				"host": "localhost",
				"port": 8086
			}
		}, null, "\t")
	).then(() => {
		console.log("config.json created.");
	}).catch((error) => {
		console.error("Create config.json failed.");
	});
}

exports.getConfig = () => new Promise((resolve, reject) => {
	fs.promises.readFile(
		"config.json",
		"utf8"
	).then((data) => {
		resolve(JSON.parse(data));
	}).catch((error) => {
		if (error.code === "ENOENT")
			intializeConfig();
		reject(error);
	});
});
