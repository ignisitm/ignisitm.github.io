module.exports = {
	getUser: function () {
		const user = sessionStorage.getItem("ignis-user");
		if (!user || user === "undefined") return null;
		else return JSON.parse(user);
	},

	getToken: function () {
		const token = sessionStorage.getItem("ignis-token");
		if (!token || token === "undefined") return null;
		else return token;
	},

	setUserSession: function ({ user, token }) {
		sessionStorage.setItem("ignis-user", JSON.stringify(user));
		sessionStorage.setItem("ignis-token", token);
	},

	resetUserSession: function () {
		sessionStorage.removeItem("ignis-user");
		sessionStorage.removeItem("ignis-token");
		sessionStorage.removeItem("client-token");
	},

	setClientToken: function (token) {
		sessionStorage.setItem("client-token", token);
	},

	getClientToken: function () {
		const token = sessionStorage.getItem("client-token");
		if (!token || token === "undefined") return null;
		else return token;
	},

	setCredentials: function ({ username, password }) {
		localStorage.setItem("ignis-username", username);
		localStorage.setItem("ignis-password", password);
	},

	resetCredentials: function () {
		localStorage.removeItem("ignis-username");
		localStorage.removeItem("ignis-password");
	},

	getUsername: function () {
		const username = localStorage.getItem("ignis-username");
		if (!username || username === "undefined") return null;
		else return username;
	},

	getPassword: function () {
		const password = localStorage.getItem("ignis-password");
		if (!password || password === "undefined") return null;
		else return password;
	},
};
