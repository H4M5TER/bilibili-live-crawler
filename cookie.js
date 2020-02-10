const axios = require("axios");

exports = module.exports = () => {
	axios.request({
		url: "https://vup.darkflame.ga/online",
		headers: {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.131 Safari/537.36"
		}
	}).then((response) => {
		var setcookie = response.headers.get("set-cookie").split(";", 2);
		cookie.value = setcookie[0];
		cookie.expires = setcookie[1].split("=")[1];
		console.log("Cookie fetched");
		return cookie;
	}).catch((err) => {
		throw err;
	})
}
