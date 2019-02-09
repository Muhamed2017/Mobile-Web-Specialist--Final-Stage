
self.importScripts('../dbhelper.js');

self.onmessage = (message)=>{
	let restaurants = message.data.restaurants;
	let cuisine = message.data.cuisine;
  let neighborhood = message.data.neighborhood;
  let favoriteURLCondition = message.data.favoriteURLCondition;

	if (cuisine != 'all') { // filter by cuisine
    restaurants = restaurants.filter(r => r.cuisine_type == cuisine);
  }
  if (neighborhood != 'all') { // filter by neighborhood
    restaurants = restaurants.filter(r => r.neighborhood == neighborhood);
  }

  if(favoriteURLCondition){
    restaurants = restaurants.filter(r => r.is_favorite == favoriteURLCondition || 
      r.is_favorite == false && favoriteURLCondition === 'false' || r.is_favorite == true && favoriteURLCondition === 'true');
  }

  postMessage({'id': 1, 'restaurants': restaurants});
  let index = 0;
  let resturantsHTML = '';
  restaurants.forEach(restaurant => {
    resturantsHTML = resturantsHTML + generateRestaurantHTML(restaurant, index);
    index++;
  });
  postMessage({'id': 2, 'resturantsHTML': resturantsHTML});
}


var generateRestaurantHTML = (restaurant, index) => {
  
  
  let imgsList = DBHelper.imagesUrlForRestaurant(restaurant);

  let picture = '<picture class="js-lazy-image">';
  let img1 = `<source media="(min-width: 1500px)" class="restaurant-img" srcset="${imgsList[1]}">`;
  let img2 = `<source media="(min-width: 800px)" class="restaurant-img" srcset="${imgsList[2]}">`;
  
  let alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
  let img = `<img alt="${alt}" data-src="${imgsList[3]}" class="restaurant-img" >`;
  picture = picture + img1 + img2 + img + '</picture>';
  

  
  
  let incont = '&#xf08a;';
  if(restaurant.is_favorite === true || restaurant.is_favorite === 'true'){
    incont = '&#xf004;';
  }

  let favButton = `<button id="FavoritMark_${restaurant.id}" class="fa favoriteButton" onclick="markRestaurantAsFavorit(${restaurant.id}, ${restaurant.is_favorite}, ${index})" role="presentation" aria-label="Add to Favorite">${incont}</button>`;
  

  const name = `<h2>${restaurant.name}${favButton}</h2>`;

  let neighborhood = `<p>${restaurant.neighborhood}</p>`;
  // neighborhood.innerHTML = restaurant.neighborhood;
  // li.append(neighborhood);

  const address = `<p>${restaurant.address}</p>`;
  // address.innerHTML = restaurant.address;
  // li.append(address);

  const more = `<a role="button" href="${DBHelper.urlForRestaurant(restaurant)}">View Details</a>`;
  // more.innerHTML = 'View Details';
  // more.role = 'button';
  // more.href = DBHelper.urlForRestaurant(restaurant);
  // li.append(more)

  let li = '<div>' + picture + name +neighborhood + address + more + '</div>';
  
  return li;
}