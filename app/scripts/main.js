let restaurants,
  neighborhoods,
  cuisines
var map
var markers = [];

document.addEventListener('readystatechange', event => {
  if (event.target.readyState === 'interactive') {
    console.log('I am in interactive state....');
  }
  else if (event.target.readyState === 'complete') {
    console.log('I am in complete state....');
        
    fillSearchingCriteria();
    updateRestaurants();
  }
});

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  console.log('I am in DOMContentLoaded ..');

  // fillSearchingCriteria();
});


var getSearchCriteriaValues=(restaurants = self.restaurants)=>{
  let searchWorker = new Worker('scripts/workers/searchCriteriaWorker.js');
  searchWorker.postMessage( {'restaurants': self.restaurants} );
  searchWorker.onmessage = (message)=>{
    let cuisinesHTML = message.data.CuisinesHTML;
    let neighborhoodsHTML = message.data.NeighborhoodsHTML;
    document.getElementById('neighborhoods-select').innerHTML = neighborhoodsHTML;
    document.getElementById('cuisines-select').innerHTML = cuisinesHTML;
  }
}

var fillSearchingCriteria = ()=>{
  if (window.Worker){
    allResturnats((error,rests)=>{
      if(rests){
        self.restaurants = rests;
        getSearchCriteriaValues(restaurants);
      }else{
        DBHelper.fetchRestaurants(undefined, (error, restaurants)=>{
          self.restaurants = restaurants;
          getSearchCriteriaValues(restaurants);
        });
      }
    });


  }else{
    DBHelper.fetchSearchValues((error, neighborhoods, cuisines) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        self.neighborhoods = neighborhoods;
        self.cuisines = cuisines;
        fillCuisinesHTML();
        fillNeighborhoodsHTML();
      }
    });
  }
}

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
var fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

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
var fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  manageMapMarker();
}


/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  let favoriteURLCondition = isFavoritSearchRequired();

  if(window.Worker){
    let resturantSearchWorker = new Worker('scripts/workers/resturantSearchWorker.js');
    if(self.restaurants){
      resturantSearchWorker.postMessage({
        'restaurants': self.restaurants, 
        'cuisine': cuisine,
        'neighborhood': neighborhood,
        'favoriteURLCondition': favoriteURLCondition});
    }else{
      allResturnats((error,rests)=>{
        if(rests){
          resturantSearchWorker.postMessage({
            'restaurants': rests, 
            'cuisine': cuisine,
            'neighborhood': neighborhood,
            'favoriteURLCondition': favoriteURLCondition});
        }else{
          DBHelper.fetchRestaurants(favoriteURLCondition, (error, restaurants)=>{
            resturantSearchWorker.postMessage({
            'restaurants': restaurants, 
            'cuisine': cuisine,
            'neighborhood': neighborhood,
            'favoriteURLCondition': favoriteURLCondition});
          });
        }
      });
    }
    resturantSearchWorker.onmessage = (message)=>{
      // TODO
      let messageData = message.data;
      if(messageData.id === 1){
        self.restaurants = messageData.restaurants;
        resetRestaurants(self.restaurants);
        addMarkersToMap(self.restaurants);
      }else if(messageData.id === 2){
        let restHTML = messageData.resturantsHTML;
        document.getElementById('restaurants-list').innerHTML = restHTML;
        configureIntersectionObserver();
        self.restaurants = undefined;
      }
    }

  }else{
    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, favoriteURLCondition, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
      }
    })
  }
}


var isFavoritSearchRequired =()=>{
  let favList = document.getElementsByName('favoriteSearch');
  let filter = 'all'; // Favorite  unFavorite
  for(let i = 0  ; i < favList.length ;i++){
    if(favList[i].checked){
      filter= favList[i].value;
      break;
    }
  }
  let filterCondition = undefined;
  if(filter != 'all'){
    filterCondition = filter; // true or false
  }

  return filterCondition;
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  let index = 0;
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant, index));
    index++;
  });
  addMarkersToMap();
  configureIntersectionObserver();
}

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = (restaurant, index) => {
  const li = document.createElement('div');

  // TODO chage it to picture
//  const image = document.createElement('img');
//  image.className = 'restaurant-img';
//  image.src = DBHelper.imageUrlForRestaurant(restaurant);
//  li.append(image);
	
	let imgsList = DBHelper.imagesUrlForRestaurant(restaurant);
	const picture = document.createElement('picture');
	picture.className = 'js-lazy-image';
  picture.display = 'none';
	const img1 = document.createElement('source');
	img1.media = '(min-width: 1500px)';
	img1.className = 'restaurant-img';
	img1.srcset = imgsList[1];

	picture.append(img1);
	const img2 = document.createElement('source');
	img2.media = '(min-width: 800px)';
	img2.className = 'restaurant-img';
	img2.srcset = imgsList[2];
	picture.append(img2);
	const img = document.createElement('img');
	img.alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
	// img.src = imgsList[3];
  img.setAttribute('data-src', imgsList[3]);
	img.className = 'restaurant-img';
	picture.append(img);
	li.append(picture);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;

  let heartClass = '&#xf08a;';
  if(restaurant.is_favorite === true || restaurant.is_favorite === 'true'){
    heartClass = '&#xf004;';
  }
  let favSpan = document.createElement('button');
  favSpan.id = `${CONST_FAVORITIFY_ACTION_SPAN_ID_PREFIX}${restaurant.id}`;
  favSpan.className = 'fa';
  favSpan.innerHTML = heartClass;
  favSpan.setAttribute('onclick',`markRestaurantAsFavorit(${restaurant.id}, ${restaurant.is_favorite}, ${index})`);
  favSpan.setAttribute('role', 'presentation');
  favSpan.setAttribute('aria-label', 'Add to Favorite');
  name.appendChild(favSpan);
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.role = 'button';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = (rests = self.restaurants) => {
  if(MARK_LOCATIONS_ON_MAP === true){
    if(rests){
      rests.forEach(restaurant => {
          // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
          window.location.href = marker.url
        });
        self.markers.push(marker);
      });
    }
  }
}

var manageMapMarker = (rests= restaurants)=>{
  if(rests){
    addMarkersToMap(rests);
  }else{
    allResturnats((error,rests)=>{
      if(rests){
        self.restaurants = rests;
        addMarkersToMap(rests);
      }else{
        DBHelper.fetchRestaurants(undefined, (error, restaurants)=>{
          self.restaurants = restaurants;
          addMarkersToMap(restaurants);
        });
      }
    });
  }
}

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 
  * intersection observer section 
*/

let images, imageCount, observer;
var configureIntersectionObserver = ()=>{
  // Get all of the images that are marked up to lazy load
  images = document.querySelectorAll('.js-lazy-image');
  const config = {
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
    for (let i = 0; i < images.length; i++) { 
      let image = images[i];
      if (image.classList.contains('js-lazy-image--handled')) {
        continue;
      }

      observer.observe(image);
    }
  }
}


/**
 * Fetchs the image for the given URL
 * @param {string} url 
 */
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
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
  const src = image.dataset.src;
  if (!src) {
    return;
  }

  return fetchImage(src).then(() => { applyImage(image, src); });
}

/**
 * Load all of the images immediately
 * @param {NodeListOf<Element>} images 
 */
function loadImagesImmediately(images) {
  // foreach() is not supported in IE
  for (let i = 0; i < images.length; i++) { 
    let image = images[i];
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
  for (let i = 0; i < entries.length; i++) { 
    let entry = entries[i];
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


