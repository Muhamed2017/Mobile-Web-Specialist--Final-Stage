'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Common database helper functions.
 */

var DBHelper = function () {
  function DBHelper() {
    _classCallCheck(this, DBHelper);
  }

  _createClass(DBHelper, null, [{
    key: 'fetchRestaurants',


    /**
     * Fetch all restaurants.
     */
    value: function fetchRestaurants(isFavorit, callback) {
      // let xhr = new XMLHttpRequest();
      // xhr.open('GET', DBHelper.DATABASE_URL);
      // xhr.onload = () => {
      //   if (xhr.status === 200) { // Got a success response from server!
      //     const json = JSON.parse(xhr.responseText);
      //     const restaurants = json.restaurants;
      //     callback(null, restaurants);
      //   } else { // Oops!. Got an error from server.
      //     const error = (`Request failed. Returned status of ${xhr.status}`);
      //     callback(error, null);
      //   }
      // };
      // xhr.send();

      // let res = allResturnats();
      // if(res){
      //   callback(null,res);
      // }else{
      //   fetch(DBHelper.DATABASE_URL).then(response =>{
      //     if(response){
      //       return response.json();
      //     }else{
      //       return undefined;
      //     }
      //   }).then(resJson => {
      //     addAllResturants(resJson);
      //     callback(null, resJson);
      //   });
      // }
      var url = DBHelper.DATABASE_URL;
      if (isFavorit) {
        url = url + ('?is_favorite=' + isFavorit);
      }

      fetch(url).then(function (response) {
        if (response) {
          return response.json();
        } else {
          return undefined;
        }
      }).then(function (resJson) {
        if (resJson) {
          if (callback) {
            callback(null, resJson);
          }
          addAllResturants(resJson);
        }
      }).catch(function (error) {
        if (callback) {
          allResturnats(callback);
        }
      });
    }

    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: 'fetchRestaurantById',
    value: function fetchRestaurantById(id, callback) {
      // fetch all restaurants with proper error handling.

      fetch('http://localhost:1337/restaurants/' + id).then(function (obj) {
        if (obj) {
          return obj.json();
        } else {
          return undefined;
        }
      }).then(function (restaurant) {
        if (restaurant) {
          if (callback) {
            callback(null, restaurant);
          }
          addResturant(id, restaurant);
        } else {
          if (callback) {
            callback(error, null);
          }
        }
      }).catch(function (error) {
        if (callback) {
          resturantByID(id, callback);
        }
      });
    }
  }, {
    key: 'fetchRestaurantReviews',
    value: function fetchRestaurantReviews(id, callback, callbackFailedReviews) {
      // fetch all restaurants with proper error handling.

      fetch('http://localhost:1337/reviews/?restaurant_id=' + id, {
        cache: 'no-cache'
      }).then(function (obj) {
        return obj.json();
      }).then(function (restaurant) {
        if (restaurant) {
          if (callback) {
            callback(null, restaurant);
          }
          addResturantReviews(id, restaurant);
        }
      }).catch(function (e) {
        console.log('Error during fetching resturant reviews.. ' + e);
        if (callback) {
          resturantReviews(id, callback);
        }
        if (callbackFailedReviews) {
          getAllPendingReviews(id, callbackFailedReviews);
        }
      });

      // resturantReviews(id,(error,reviews)=>{
      // if(reviews && callback){
      //   callback(undefined, reviews);
      // }

      // if(callbackFailedReviews){
      //   getAllPendingReviews(id, callbackFailedReviews);
      // }

      // fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`, {
      //   cache: 'no-cache'
      // }).then(obj => {
      //   return obj.json();
      // }).then(fetchedReviews =>{
      //   if(fetchedReviews){
      //     addResturantReviews(id, fetchedReviews);
      //   }
      // }).catch(e=>{
      //     console.log('Error during fetching resturant reviews.. ' + e);
      //   });
      // });
    }
  }, {
    key: 'fetchSingleReview',
    value: function fetchSingleReview(reviewID, callback, callbackFailedReviews) {
      // fetch all restaurants with proper error handling.

      fetch('http://localhost:1337/reviews/' + reviewID, {
        cache: 'no-cache'
      }).then(function (obj) {
        return obj.json();
      }).then(function (review) {
        if (review) {
          if (callback) {
            callback(null, review);
          }
          addResturantReviews(reviewID, review, 1);
        }
      }).catch(function (e) {
        console.log('Error during fetching review.. ' + e);
        if (callback) {
          resturantReviews(id, callback, 1);
        }
        // if(callbackFailedReviews){
        //   getAllPendingReviews(id, callbackFailedReviews);
        // }
      });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisine',
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants(undefined, function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByNeighborhood',
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(undefined, function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisineAndNeighborhood',
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, isFavorit, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(isFavorit, function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(function (r) {
              return r.cuisine_type == cuisine;
            });
          }
          if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(function (r) {
              return r.neighborhood == neighborhood;
            });
          }

          callback(null, results);
        }
      });
    }
  }, {
    key: 'fetchSearchValues',
    value: function fetchSearchValues(callback) {
      DBHelper.fetchRestaurants(undefined, function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
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

          callback(null, uniqueNeighborhoods, uniqueCuisines);
        }
      });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    // static fetchNeighborhoods(callback) {
    //   // Fetch all restaurants
    //   DBHelper.fetchRestaurants((error, restaurants) => {
    //     if (error) {
    //       callback(error, null);
    //     } else {
    //       // Get all neighborhoods from all restaurants
    //       const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
    //       // Remove duplicates from neighborhoods
    //       const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
    //       callback(null, uniqueNeighborhoods);
    //     }
    //   });
    // }

    /**
     * Fetch all cuisines with proper error handling.
     */
    // static fetchCuisines(callback) {
    //   // Fetch all restaurants
    //   DBHelper.fetchRestaurants((error, restaurants) => {
    //     if (error) {
    //       callback(error, null);
    //     } else {
    //       // Get all cuisines from all restaurants
    //       const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
    //       // Remove duplicates from cuisines
    //       const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
    //       callback(null, uniqueCuisines);
    //     }
    //   });
    // }

    /**
     * Restaurant page URL.
     */

  }, {
    key: 'urlForRestaurant',
    value: function urlForRestaurant(restaurant) {
      return './restaurant.html?id=' + restaurant.id;
    }
  }, {
    key: 'getImageName',
    value: function getImageName(restaurant) {
      var name = restaurant.photograph;
      if (name && !(name.endsWith('.jpg') || name.endsWith('JPG'))) {
        name = name + '.jpg';
      }

      return name;
    }
    /**
     * Restaurant image URL.
     */

  }, {
    key: 'imageUrlForRestaurant',
    value: function imageUrlForRestaurant(restaurant) {
      var name = DBHelper.getImageName(restaurant);
      return '/images/' + name;
    }
  }, {
    key: 'imagesUrlForRestaurant',
    value: function imagesUrlForRestaurant(restaurant) {
      var name = DBHelper.getImageName(restaurant);
      var imgsList = [];
      if (name) {
        imgsList.push('/images/1600/' + name);
        imgsList.push('/images/800x600/' + name);
        imgsList.push('/images/' + name);
        imgsList.push('/images/270x203/' + name);
      } else {
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
      }

      return imgsList;
    }
    /**
     * Map marker for a restaurant.
     */

  }, {
    key: 'mapMarkerForRestaurant',
    value: function mapMarkerForRestaurant(restaurant, map) {
      var marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP });
      return marker;
    }
  }, {
    key: 'idb_object',


    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */

    get: function get() {
      return new idb('mws-restaurant-stage-1', 'Restaurants', 1);
    }
  }, {
    key: 'DATABASE_URL',
    get: function get() {
      var port = 8000; // Change this to your server port
      // return `http://localhost:${port}/data/restaurants.json`;
      return 'http://localhost:1337/restaurants/';
    }
  }]);

  return DBHelper;
}();
//# sourceMappingURL=dbhelper.js.map
