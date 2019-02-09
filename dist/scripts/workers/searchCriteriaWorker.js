'use strict';

self.onmessage = function (message) {
	var restaurants = message.data.restaurants;

	var CuisinesHTML = '<option value="all">All Cuisines</option>';
	var NeighborhoodsHTML = '<option value="all">All Neighborhoods</option>';

	if (restaurants) {
		// Get all neighborhoods from all restaurants
		var neighborhoods = restaurants.map(function (v, i) {
			return restaurants[i].neighborhood;
		});
		// Remove duplicates from neighborhoods
		var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
			return neighborhoods.indexOf(v) == i;
		});

		var cuisines = restaurants.map(function (v, i) {
			return restaurants[i].cuisine_type;
		});
		// Remove duplicates from cuisines
		var uniqueCuisines = cuisines.filter(function (v, i) {
			return cuisines.indexOf(v) == i;
		});

		CuisinesHTML = getCuisinesHTML(uniqueCuisines);
		NeighborhoodsHTML = getNeighborhoodsHTML(uniqueNeighborhoods);
	}

	postMessage({ 'CuisinesHTML': CuisinesHTML, 'NeighborhoodsHTML': NeighborhoodsHTML });
};

var getCuisinesHTML = function getCuisinesHTML(cuisines) {
	var options = '<option value="all">All Cuisines</option>';
	cuisines.forEach(function (cuisine) {
		var op = '<option value=' + cuisine + ' > ' + cuisine + '</option>';
		options = options + op;
	});
	return options;
};

var getNeighborhoodsHTML = function getNeighborhoodsHTML(neighborhoods) {
	var options = '<option value="all">All Neighborhoods</option>';
	neighborhoods.forEach(function (neighborhood) {
		var op = '<option value=' + neighborhood + ' > ' + neighborhood + '</option>';
		options = options + op;
	});
	return options;
};
//# sourceMappingURL=searchCriteriaWorker.js.map
