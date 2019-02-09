'use strict';

self.importScripts('../modificationOperations.js');

var info, cursKey, category, postSyncAction;

var POST_ACTION_RECACHING_RESTAURANT_REVIEWS = 'recachingRestaurantReviews';

self.onmessage = function (message) {
	self.info = message.data.info;
	self.cursKey = message.data.cursKey;
	self.category = message.data.category;

	if (category < 10000) {
		syncReview(info, cursKey);
		self.postSyncAction = POST_ACTION_RECACHING_RESTAURANT_REVIEWS;
	} else if (category < 20000) {
		// TODO
		// Favorite a restaurant
		syncFavoritify(info, true);
	} else if (category < 30000) {
		// TODO
		// Unfavorite a restaurant 
		syncFavoritify(info, false);
	} else if (category < 40000) {
		// TODO
		// Update a restaurant review
		syncUpdateReviewAction(info, cursKey);
	} else if (category < 50000) {
		// TODO
		// Delete a restaurant review
		syncDeletedReview(info, cursKey);
		self.postSyncAction = POST_ACTION_RECACHING_RESTAURANT_REVIEWS;
	}
};

var replyToWorker = function replyToWorker(serverResponse) {
	var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : self.cursKey;

	if (serverResponse) {
		var responseMessage = { 'isCompleted': true, 'cursKey': key, 'postSyncAction': postSyncAction };

		postMessage(responseMessage);
	}
};

var syncReview = function syncReview(info, cursKey) {
	createNewRestaurantReview(info, replyToWorker, undefined);
};

var syncDeletedReview = function syncDeletedReview(reviewID, cursKey) {
	var jsonInfo = JSON.parse(reviewID);
	deleteReview(jsonInfo.id, replyToWorker, undefined);
};

var syncUpdateReviewAction = function syncUpdateReviewAction(info, cursKey) {
	updateRestaurantReview(info, replyToWorker, undefined);
};

var syncFavoritify = function syncFavoritify(restaurantID, is_fav) {
	favoriteRestaurant(restaurantID, is_fav, replyToWorker, undefined);
};
//# sourceMappingURL=syncWorker.js.map
