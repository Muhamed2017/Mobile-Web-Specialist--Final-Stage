'use strict';

var restaurants = void 0,
    neighborhoods = void 0,
    cuisines = void 0;
var map;
var markers = [];

document.addEventListener('readystatechange', function (event) {
  if (event.target.readyState === 'interactive') {
    console.log('I am in interactive state....');
  } else if (event.target.readyState === 'complete') {
    console.log('I am in complete state....');

    fillSearchingCriteria();
    updateRestaurants();
  }
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function (event) {
  console.log('I am in DOMContentLoaded ..');

  // fillSearchingCriteria();
});

var getSearchCriteriaValues = function getSearchCriteriaValues() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  var searchWorker = new Worker('scripts/workers/searchCriteriaWorker.js');
  searchWorker.postMessage({ 'restaurants': self.restaurants });
  searchWorker.onmessage = function (message) {
    var cuisinesHTML = message.data.CuisinesHTML;
    var neighborhoodsHTML = message.data.NeighborhoodsHTML;
    document.getElementById('neighborhoods-select').innerHTML = neighborhoodsHTML;
    document.getElementById('cuisines-select').innerHTML = cuisinesHTML;
  };
};

var fillSearchingCriteria = function fillSearchingCriteria() {
  if (window.Worker) {
    allResturnats(function (error, rests) {
      if (rests) {
        self.restaurants = rests;
        getSearchCriteriaValues(restaurants);
      } else {
        DBHelper.fetchRestaurants(undefined, function (error, restaurants) {
          self.restaurants = restaurants;
          getSearchCriteriaValues(restaurants);
        });
      }
    });
  } else {
    DBHelper.fetchSearchValues(function (error, neighborhoods, cuisines) {
      if (error) {
        // Got an error
        console.error(error);
      } else {
        self.neighborhoods = neighborhoods;
        self.cuisines = cuisines;
        fillCuisinesHTML();
        fillNeighborhoodsHTML();
      }
    });
  }
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
// var fetchNeighborhoods = () => {
//   DBHelper.fetchNeighborhoods((error, neighborhoods) => {
//     if (error) { // Got an error
//       console.error(error);
//     } else {
//       self.neighborhoods = neighborhoods;
//       fillNeighborhoodsHTML();
//     }
//   });
// }

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
  var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

  var select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(function (neighborhood) {
    var option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
// var fetchCuisines = () => {
//   DBHelper.fetchCuisines((error, cuisines) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.cuisines = cuisines;
//       fillCuisinesHTML();
//     }
//   });
// }

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = function fillCuisinesHTML() {
  var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

  var select = document.getElementById('cuisines-select');

  cuisines.forEach(function (cuisine) {
    var option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {
  var loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  manageMapMarker();
};

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = function updateRestaurants() {
  var cSelect = document.getElementById('cuisines-select');
  var nSelect = document.getElementById('neighborhoods-select');

  var cIndex = cSelect.selectedIndex;
  var nIndex = nSelect.selectedIndex;

  var cuisine = cSelect[cIndex].value;
  var neighborhood = nSelect[nIndex].value;
  var favoriteURLCondition = isFavoritSearchRequired();

  if (window.Worker) {
    var resturantSearchWorker = new Worker('scripts/workers/resturantSearchWorker.js');
    if (self.restaurants) {
      resturantSearchWorker.postMessage({
        'restaurants': self.restaurants,
        'cuisine': cuisine,
        'neighborhood': neighborhood,
        'favoriteURLCondition': favoriteURLCondition });
    } else {
      allResturnats(function (error, rests) {
        if (rests) {
          resturantSearchWorker.postMessage({
            'restaurants': rests,
            'cuisine': cuisine,
            'neighborhood': neighborhood,
            'favoriteURLCondition': favoriteURLCondition });
        } else {
          DBHelper.fetchRestaurants(favoriteURLCondition, function (error, restaurants) {
            resturantSearchWorker.postMessage({
              'restaurants': restaurants,
              'cuisine': cuisine,
              'neighborhood': neighborhood,
              'favoriteURLCondition': favoriteURLCondition });
          });
        }
      });
    }
    resturantSearchWorker.onmessage = function (message) {
      // TODO
      var messageData = message.data;
      if (messageData.id === 1) {
        self.restaurants = messageData.restaurants;
        resetRestaurants(self.restaurants);
        addMarkersToMap(self.restaurants);
      } else if (messageData.id === 2) {
        var restHTML = messageData.resturantsHTML;
        document.getElementById('restaurants-list').innerHTML = restHTML;
        configureIntersectionObserver();
        self.restaurants = undefined;
      }
    };
  } else {
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, favoriteURLCondition, function (error, restaurants) {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    });
  }
};

var isFavoritSearchRequired = function isFavoritSearchRequired() {
  var favList = document.getElementsByName('favoriteSearch');
  var filter = 'all'; // Favorite  unFavorite
  for (var i = 0; i < favList.length; i++) {
    if (favList[i].checked) {
      filter = favList[i].value;
      break;
    }
  }
  var filterCondition = undefined;
  if (filter != 'all') {
    filterCondition = filter; // true or false
  }

  return filterCondition;
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  var ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(function (m) {
    return m.setMap(null);
  });
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = function fillRestaurantsHTML() {
  var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  var ul = document.getElementById('restaurants-list');
  var index = 0;
  restaurants.forEach(function (restaurant) {
    ul.append(createRestaurantHTML(restaurant, index));
    index++;
  });
  addMarkersToMap();
  configureIntersectionObserver();
};

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = function createRestaurantHTML(restaurant, index) {
  var li = document.createElement('div');

  // TODO chage it to picture
  //  const image = document.createElement('img');
  //  image.className = 'restaurant-img';
  //  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  //  li.append(image);

  var imgsList = DBHelper.imagesUrlForRestaurant(restaurant);
  var picture = document.createElement('picture');
  picture.className = 'js-lazy-image';
  picture.display = 'none';
  var img1 = document.createElement('source');
  img1.media = '(min-width: 1500px)';
  img1.className = 'restaurant-img';
  img1.srcset = imgsList[1];

  picture.append(img1);
  var img2 = document.createElement('source');
  img2.media = '(min-width: 800px)';
  img2.className = 'restaurant-img';
  img2.srcset = imgsList[2];
  picture.append(img2);
  var img = document.createElement('img');
  img.alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
  // img.src = imgsList[3];
  img.setAttribute('data-src', imgsList[3]);
  img.className = 'restaurant-img';
  picture.append(img);
  li.append(picture);

  var name = document.createElement('h2');
  name.innerHTML = restaurant.name;

  var heartClass = '&#xf08a;';
  if (restaurant.is_favorite === true || restaurant.is_favorite === 'true') {
    heartClass = '&#xf004;';
  }
  var favSpan = document.createElement('button');
  favSpan.id = '' + CONST_FAVORITIFY_ACTION_SPAN_ID_PREFIX + restaurant.id;
  favSpan.className = 'fa';
  favSpan.innerHTML = heartClass;
  favSpan.setAttribute('onclick', 'markRestaurantAsFavorit(' + restaurant.id + ', ' + restaurant.is_favorite + ', ' + index + ')');
  favSpan.setAttribute('role', 'presentation');
  favSpan.setAttribute('aria-label', 'Add to Favorite');
  name.appendChild(favSpan);
  li.append(name);

  var neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  var address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  var more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.role = 'button';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = function addMarkersToMap() {
  var rests = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

  if (MARK_LOCATIONS_ON_MAP === true) {
    if (rests) {
      rests.forEach(function (restaurant) {
        // Add marker to the map
        var marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', function () {
          window.location.href = marker.url;
        });
        self.markers.push(marker);
      });
    }
  }
};

var manageMapMarker = function manageMapMarker() {
  var rests = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : restaurants;

  if (rests) {
    addMarkersToMap(rests);
  } else {
    allResturnats(function (error, rests) {
      if (rests) {
        self.restaurants = rests;
        addMarkersToMap(rests);
      } else {
        DBHelper.fetchRestaurants(undefined, function (error, restaurants) {
          self.restaurants = restaurants;
          addMarkersToMap(restaurants);
        });
      }
    });
  }
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
  * intersection observer section 
*/

var images = void 0,
    imageCount = void 0,
    observer = void 0;
var configureIntersectionObserver = function configureIntersectionObserver() {
  // Get all of the images that are marked up to lazy load
  images = document.querySelectorAll('.js-lazy-image');
  var config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '50px 0px',
    threshold: 0.01
  };
  imageCount = images.length;
  // If we don't have support for intersection observer, loads the images immediately
  if (!('IntersectionObserver' in window)) {
    loadImagesImmediately(images);
  } else {
    // It is supported, load the images
    observer = new IntersectionObserver(onIntersection, config);

    // foreach() is not supported in IE
    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      if (image.classList.contains('js-lazy-image--handled')) {
        continue;
      }

      observer.observe(image);
    }
  }
};

/**
 * Fetchs the image for the given URL
 * @param {string} url 
 */
function fetchImage(url) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
}

/**
 * Preloads the image
 * @param {object} image 
 */
function preloadImage(image) {
  var src = image.dataset.src;
  if (!src) {
    return;
  }

  return fetchImage(src).then(function () {
    applyImage(image, src);
  });
}

/**
 * Load all of the images immediately
 * @param {NodeListOf<Element>} images 
 */
function loadImagesImmediately(images) {
  // foreach() is not supported in IE
  for (var i = 0; i < images.length; i++) {
    var image = images[i];
    preloadImage(image.children[2]);
  }
}

/**
 * Disconnect the observer
 */
function disconnect() {
  if (!observer) {
    return;
  }

  observer.disconnect();
}

/**
 * On intersection
 * @param {array} entries 
 */
function onIntersection(entries) {
  // Disconnect if we've already loaded all of the images
  if (imageCount === 0) {
    observer.disconnect();
  }

  // Loop through the entries
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    // Are we in viewport?
    if (entry.intersectionRatio > 0) {
      imageCount--;

      // Stop watching and load the image
      observer.unobserve(entry.target);
      preloadImage(entry.target.children[2]);
    }
  }
}

/**
 * Apply the image
 * @param {object} img 
 * @param {string} src 
 */
function applyImage(img, src) {
  // Prevent this from being lazy loaded a second time.
  img.classList.add('js-lazy-image--handled');
  img.src = src;
  // img.classList.add('fade-in');
}
//# sourceMappingURL=main.js.map
