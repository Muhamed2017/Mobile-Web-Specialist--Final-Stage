
self.onmessage = (message)=>{
	let restaurants = message.data.restaurants;
	
	let CuisinesHTML = '<option value="all">All Cuisines</option>';
	let NeighborhoodsHTML = '<option value="all">All Neighborhoods</option>';
	
	if(restaurants){
		// Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

		CuisinesHTML = getCuisinesHTML(uniqueCuisines);
        NeighborhoodsHTML = getNeighborhoodsHTML(uniqueNeighborhoods);
	}

	postMessage({'CuisinesHTML': CuisinesHTML , 'NeighborhoodsHTML': NeighborhoodsHTML});
    
}


var getCuisinesHTML = (cuisines) => {
	let options = '<option value="all">All Cuisines</option>';
	cuisines.forEach(cuisine => {
		let op = `<option value=${cuisine} > ${cuisine}</option>`;
		options = options + op;
	});
	return options;
}

var getNeighborhoodsHTML = (neighborhoods) => {
	let options = '<option value="all">All Neighborhoods</option>';
	neighborhoods.forEach(neighborhood => {
    	let op = `<option value=${neighborhood} > ${neighborhood}</option>`;
		options = options + op;
	});
	return options;
}