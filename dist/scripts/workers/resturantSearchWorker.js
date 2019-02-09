'use strict';

self.importScripts('../dbhelper.js');

self.onmessage = function (message) {
  var restaurants = message.data.restaurants;
  var cuisine = message.data.cuisine;
  var neighborhood = message.data.neighborhood;
  var favoriteURLCondition = message.data.favoriteURLCondition;

  if (cuisine != 'all') {
    // filter by cuisine
    restaurants = restaurants.filter(function (r) {
      return r.cuisine_type == cuisine;
    });
  }
  if (neighborhood != 'all') {
    // filter by neighborhood
    restaurants = restaurants.filter(function (r) {
      return r.neighborhood == neighborhood;
    });
  }

  if (favoriteURLCondition) {
    restaurants = restaurants.filter(function (r) {
      return r.is_favorite == favoriteURLCondition || r.is_favorite == false && favoriteURLCondition === 'false' || r.is_favorite == true && favoriteURLCondition === 'true';
    });
  }

  postMessage({ 'id': 1, 'restaurants': restaurants });
  var index = 0;
  var resturantsHTML = '';
  restaurants.forEach(function (restaurant) {
    resturantsHTML = resturantsHTML + generateRestaurantHTML(restaurant, index);
    index++;
  });
  postMessage({ 'id': 2, 'resturantsHTML': resturantsHTML });
};

var generateRestaurantHTML = function generateRestaurantHTML(restaurant, index) {

  var imgsList = DBHelper.imagesUrlForRestaurant(restaurant);

  var picture = '<picture class="js-lazy-image">';
  var img1 = '<source media="(min-width: 1500px)" class="restaurant-img" srcset="' + imgsList[1] + '">';
  var img2 = '<source media="(min-width: 800px)" class="restaurant-img" srcset="' + imgsList[2] + '">';

  var alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
  var img = '<img alt="' + alt + '" data-src="' + imgsList[3] + '" class="restaurant-img" >';
  picture = picture + img1 + img2 + img + '</picture>';

  var incont = '&#xf08a;';
  if (restaurant.is_favorite === true || restaurant.is_favorite === 'true') {
    incont = '&#xf004;';
  }

  var favButton = '<button id="FavoritMark_' + restaurant.id + '" class="fa favoriteButton" onclick="markRestaurantAsFavorit(' + restaurant.id + ', ' + restaurant.is_favorite + ', ' + index + ')" role="presentation" aria-label="Add to Favorite">' + incont + '</button>';

  var name = '<h2>' + restaurant.name + favButton + '</h2>';

  var neighborhood = '<p>' + restaurant.neighborhood + '</p>';
  // neighborhood.innerHTML = restaurant.neighborhood;
  // li.append(neighborhood);

  var address = '<p>' + restaurant.address + '</p>';
  // address.innerHTML = restaurant.address;
  // li.append(address);

  var more = '<a role="button" href="' + DBHelper.urlForRestaurant(restaurant) + '">View Details</a>';
  // more.innerHTML = 'View Details';
  // more.role = 'button';
  // more.href = DBHelper.urlForRestaurant(restaurant);
  // li.append(more)

  var li = '<div>' + picture + name + neighborhood + address + more + '</div>';

  return li;
};
//# sourceMappingURL=resturantSearchWorker.js.map
