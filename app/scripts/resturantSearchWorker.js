
self.importScripts('dbhelper.js');

self.onmessage = (message)=>{
	let restaurants = message.data.restaurants;
	let cuisine = message.data.cuisine;
  let neighborhood = message.data.neighborhood;

	if (cuisine != 'all') { // filter by cuisine
    restaurants = restaurants.filter(r => r.cuisine_type == cuisine);
  }
  if (neighborhood != 'all') { // filter by neighborhood
    restaurants = restaurants.filter(r => r.neighborhood == neighborhood);
  }

  postMessage({'id': 1, 'restaurants': restaurants});

  let resturantsHTML = '';
  restaurants.forEach(restaurant => {
    resturantsHTML = resturantsHTML + generateRestaurantHTML(restaurant);
  });
  postMessage({'id': 2, 'resturantsHTML': resturantsHTML});
}


var generateRestaurantHTML = (restaurant) => {
  
  
  let imgsList = DBHelper.imagesUrlForRestaurant(restaurant);

  let picture = '<picture class="js-lazy-image">';
  // picture.className = 'js-lazy-image';
  // picture.display = 'none';
  let img1 = `<source media="(min-width: 1500px)" class="restaurant-img" srcset="${imgsList[1]}">`;
  let img2 = `<source media="(min-width: 800px)" class="restaurant-img" srcset="${imgsList[2]}">`;
  // img1.media = '(min-width: 1500px)';
  // img1.className = 'restaurant-img';
  // img1.srcset = imgsList[1];

  // picture.append(img1);
  

  // const img2 = document.createElement('source');
  // img2.media = '(min-width: 800px)';
  // img2.className = 'restaurant-img';
  // img2.srcset = imgsList[2];
  // picture.append(img2);
  let alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
  let img = `<img alt="${alt}" data-src="${imgsList[3]}" class="restaurant-img" >`;
  
  // img.setAttribute('data-src', imgsList[3]);
  // img.className = 'restaurant-img';
  picture = picture + img1 + img2 + img + '</picture>';
  

  const name = `<h2>${restaurant.name}</h2>`;
  // name.innerHTML = restaurant.name;
  // li.append(name);

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