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
	},
};
