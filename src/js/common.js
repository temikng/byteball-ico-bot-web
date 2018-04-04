window.common = {
	getJsonFromUrl: function() {
		let query = location.search.substr(1);
		let result = {};
		query.split("&").forEach((part) => {
			let item = part.split("=");
			result[item[0]] = decodeURIComponent(item[1]);
		});
		return result;
	}
};