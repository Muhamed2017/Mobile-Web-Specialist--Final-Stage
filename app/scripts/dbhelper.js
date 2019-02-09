/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */

   static get idb_object(){
      return new idb('mws-restaurant-stage-1', 'Restaurants', 1);
   }


  static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    // return `http://localhost:${port}/data/restaurants.json`;
    return 'http://localhost:1337/restaurants/';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(isFavorit, callback) {
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
      let url = DBHelper.DATABASE_URL;
      if(isFavorit){
        url = url + `?is_favorite=${isFavorit}`;
      }

      fetch(url).then(response =>{
        if(response){
          return response.json();
        }else{
          return undefined;
        }
      }).then(resJson => {
        if(resJson){
          if(callback){
            callback(null, resJson);
          }
          addAllResturants(resJson);
        }
      }).catch(error =>{
        if(callback){
          allResturnats(callback);
        }
      });
    

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    
      fetch(`http://localhost:1337/restaurants/${id}`).then(obj => {
        if(obj){
          return obj.json();
        }else{
          return undefined;
        }
      }).then(restaurant =>{
        if(restaurant){
          if(callback){ callback(null, restaurant);}
          addResturant(id, restaurant);
        }else{
          if(callback){callback(error, null);}
        }
      }).catch((error)=>{
        if(callback){resturantByID(id, callback);}
      });
    
  }

  static fetchRestaurantReviews(id, callback, callbackFailedReviews) {
    // fetch all restaurants with proper error handling.
      
      fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`, {
        cache: 'no-cache'
      }).then(obj => {
        return obj.json();
      }).then(restaurant =>{
        if(restaurant){
          if(callback){
            callback(null, restaurant);
          }
          addResturantReviews(id, restaurant);
        }
      }).catch(e=>{
        console.log('Error during fetching resturant reviews.. ' + e);
        if(callback){
          resturantReviews(id, callback);
        }
        if(callbackFailedReviews){
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

  static fetchSingleReview(reviewID, callback, callbackFailedReviews) {
    // fetch all restaurants with proper error handling.

      fetch(`http://localhost:1337/reviews/${reviewID}`, {
        cache: 'no-cache'
      }).then(obj => {
        return obj.json();
      }).then(review =>{
        if(review){
          if(callback){
            callback(null, review);
          }
          addResturantReviews(reviewID, review, 1);
        }
      }).catch(e=>{
        console.log('Error during fetching review.. ' + e);
        if(callback){
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
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants(undefined, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(undefined, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, isFavorit, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(isFavorit, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }

        callback(null, results);
      }
    });
  }


  static fetchSearchValues(callback){
    DBHelper.fetchRestaurants(undefined, (error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

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
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }


  static getImageName(restaurant){
    let name = restaurant.photograph;
    if(name && !(name.endsWith('.jpg') || name.endsWith('JPG')) ){
      name = name + '.jpg';
    }

    return name;
  }
  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    let name = DBHelper.getImageName(restaurant);
    return (`/images/${name}`);
  }
  
	static imagesUrlForRestaurant(restaurant) {
    let name = DBHelper.getImageName(restaurant);
		var imgsList = [];
    if(name){
      imgsList.push(`/images/1600/${name}`);
      imgsList.push(`/images/800x600/${name}`);
      imgsList.push(`/images/${name}`);
      imgsList.push(`/images/270x203/${name}`);  
    }else{
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
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
