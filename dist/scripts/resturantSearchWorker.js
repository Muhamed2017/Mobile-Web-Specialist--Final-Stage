'use strict';

self.importScripts('dbhelper.js');

self.onmessage = function (message) {
  var restaurants = message.data.restaurants;
  var cuisine = message.data.cuisine;
  var neighborhood = message.data.neighborhood;

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

  postMessage({ 'id': 1, 'restaurants': restaurants });

  var resturantsHTML = '';
  restaurants.forEach(function (restaurant) {
    resturantsHTML = resturantsHTML + generateRestaurantHTML(restaurant);
  });
  postMessage({ 'id': 2, 'resturantsHTML': resturantsHTML });
};

var generateRestaurantHTML = function generateRestaurantHTML(restaurant) {

  var imgsList = DBHelper.imagesUrlForRestaurant(restaurant);

  var picture = '<picture class="js-lazy-image">';
  // picture.className = 'js-lazy-image';
  // picture.display = 'none';
  var img1 = '<source media="(min-width: 1500px)" class="restaurant-img" srcset="' + imgsList[1] + '">';
  var img2 = '<source media="(min-width: 800px)" class="restaurant-img" srcset="' + imgsList[2] + '">';
  // img1.media = '(min-width: 1500px)';
  // img1.className = 'restaurant-img';
  // img1.srcset = imgsList[1];

  // picture.append(img1);


  // const img2 = document.createElement('source');
  // img2.media = '(min-width: 800px)';
  // img2.className = 'restaurant-img';
  // img2.srcset = imgsList[2];
  // picture.append(img2);
  var alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
  var img = '<img alt="' + alt + '" data-src="' + imgsList[3] + '" class="restaurant-img" >';

  // img.setAttribute('data-src', imgsList[3]);
  // img.className = 'restaurant-img';
  picture = picture + img1 + img2 + img + '</picture>';

  var name = '<h2>' + restaurant.name + '</h2>';
  // name.innerHTML = restaurant.name;
  // li.append(name);

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