

var createNewRestaurantReview = (info, successCallback, failCallback)=>{
	fetch('http://localhost:1337/reviews/', {
  		method: 'POST', 
		body: info,
		headers: {
			'content-type': 'application/json'
		}
	}).then((response)=>{
		if(response)
			return response.json();
		else 
			return undefined;
	}).catch((error)=>{
		console.log('Failed during posting a review to server: ' + error);
	}).then((response)=>{
		if(response){ // completed successfully 
			successCallback(response);
		}else{
			if(failCallback){
				failCallback(undefined);	
			}
		}
	});
}

var favoriteRestaurant = (restaurant_id, is_favorite, successCallback, failCallback)=>{
	console.log(typeof is_favorite);
	fetch(`http://localhost:1337/restaurants/${restaurant_id}/?is_favorite=${is_favorite}`, {
  		method: 'PUT'
	}).then((response)=>{
		if(response)
			return response.json();
		else 
			return undefined;
	}).catch((error)=>{
		console.log('Failed during marking a restaurant as favorite in server: ' + error);
	}).then((response)=>{
		if(response){ // completed successfully 
			successCallback(response);
		}else{
			if(failCallback){
				failCallback(undefined);
			}
		}
	});
}

var unfavoriteRestaurant = (restaurant_id, successCallback, failCallback)=>{
	fetch(`http://localhost:1337/restaurants/${restaurant_id}/?is_favorite=false`, {
  		method: 'PUT'
	}).then((response)=>{
		if(response)
			return response.json();
		else 
			return undefined;
	}).catch((error)=>{
		console.log('Failed during unfavorit a resturant : ' + error);
	}).then((response)=>{
		if(response){ // completed successfully 
			successCallback(response);
		}else{
			failCallback(undefined);
		}
	});
}


var updateRestaurantReview = (info, successCallback, failCallback)=>{
	let jsonInfo = JSON.parse(info);
	fetch(`http://localhost:1337/reviews/${jsonInfo.review_id}`, {
  		method: 'PUT',
  		body: info,
		headers: {
			'content-type': 'application/json'
		}
	}).then((response)=>{
		if(response)
			return response.json();
		else 
			return undefined;
	}).catch((error)=>{
		console.log('Failed during updating a review to server: ' + error);
	}).then((response)=>{
		if(response){ // completed successfully 
			successCallback(response);
		}else{
			if(failCallback)
				failCallback(undefined);
		}
	});
}


var deleteReview = (review_id, successCallback, failCallback)=>{
	fetch(`http://localhost:1337/reviews/${review_id}`, {
  		method: 'DELETE'
	}).then((response)=>{
		if(response && response.status === 200)
			return response.json();
		else 
			return undefined;
	}).catch((error)=>{
		console.log('Failed during deleting a review from server : ' + error);
	}).then((response)=>{
		if(response){ // completed successfully 
			successCallback(response);
		}else{
			if(failCallback){
				failCallback(review_id);
			}
		}
	});
}