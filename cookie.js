const axios = require("axios");

exports.getCookie = () => {
	axios.request({
		url: "https://vup.darkflame.ga/online",
		method: "GET",
	}).then((response) => {
		let setCookie = response.headers["set-cookie"][0].split("; ", 2);
		cookie.value = setCookie[0];
		cookie.expires = setCookie[1].split("=")[1];
		console.log("Cookie fetched");
		return cookie;
	}).catch((err) => {
		throw err;
	})
}
