const fs = require("fs").promises;

let intializeConfig = async () => {
	console.log("Please edit config.json and restart again.");
	await fs.writeFile(
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
	);
}

exports.getConfig = async () => {
	let config;
	try {
		config = JSON.parse(await fs.readFile("config.json", "utf8"));
	} catch (e) {
		if (e.code === "ENOENT")
			intializeConfig();
		throw e;
	}
	return config;
};
