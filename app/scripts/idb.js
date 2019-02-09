const idb_name = 'mws-restaurant-stage-1';
const objectStoreName =  'Restaurants';
const version = 1;

const allRestKey = 'allResturnats';
const resturantReviewsPrefix = 'ReviewsRestuarant_';
const restaurantSingReviewPrefix = 'Review_';

const syncObjectStoreName = 'syncRequests';
var syncCreateNewRestaurantReviewCount = 0;
var syncFavoriteRestaurantCount = 10000;
var syncUnfavoriteRestaurantCount = 20000;
var syncUpdateRestaurantReviewCount = 30000;
var syncDeleteRestaurantReviewCount = 40000;
var syncOperationIndex = 0;


var getIDBObject =() => {
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
	var open = indexedDB.open(idb_name, version);
	open.onupgradeneeded = function() {
		var db = open.result;
		var store = db.createObjectStore(objectStoreName);
		var store = db.createObjectStore(syncObjectStoreName);
	};
	return open;
}

var allResturnats = (callback) => {
	
	let open = getIDBObject();

	open.onsuccess = ()=>{
		var db = open.result;
    	var tx = db.transaction(objectStoreName);
    	var store = tx.objectStore(objectStoreName);
    	var data = store.get(allRestKey);
    	
	    data.onsuccess =(event)=>{
    		callback(null ,event.target.result);
    	}
	    data.onerror = (error)=>{
	    	callback(error, undefined);
	    }
	    tx.oncomplete = function() {
	        db.close();
	    };
	};

}


function resturantByID(id, callback){
	let open = getIDBObject();

	open.onsuccess = ()=>{
		var db = open.result;
    	var tx = db.transaction(objectStoreName);
    	var store = tx.objectStore(objectStoreName);
    	var data = store.get(id);
    	
    	data.onsuccess =(event)=>{
    		callback(null ,event.target.result);
    	}
    	data.onerror = (error)=>{
	    	callback(error, undefined);
	    }
    	tx.oncomplete = function() {
	        db.close();
	    };
	};
}

function resturantReviews(id, callback){
	let open = getIDBObject();

	open.onsuccess = ()=>{
		var db = open.result;
    	var tx = db.transaction(objectStoreName);
    	var store = tx.objectStore(objectStoreName);
    	let k = resturantReviewsPrefix + id;
    	if(k === 1){
    		k = restaurantSingReviewPrefix + id;
    	}
    	var data = store.get(k);
    	data.onsuccess =(event)=>{
    		callback(null ,event.target.result);
    	}

    	data.onerror = (error)=>{
    		callback(error, undefined);
    	}
    	tx.oncomplete = function() {
	        db.close();
	    };
	};
}

var addAllResturants = (restJson) => {
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restJson, allRestKey);
		tx.oncomplete = function() {
	        db.close();
	    };
	    return;
	}
}


var addResturant = (id, restJson) =>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restJson, id);
		tx.oncomplete = function() {
	        db.close();
	    };
	}
}

var addResturantReviews = (id, restReviewsJson, count=-1) =>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		let key = resturantReviewsPrefix+id;
		if(count === 1){
			key = restaurantSingReviewPrefix + id;
		}
		store.put(restReviewsJson, key);
		tx.oncomplete = function() {
	        db.close();
	    };
	}
}


var addToSyncListReviews = (data, category)=>{
	let open = getIDBObject();

	// const objKey = `Sync_action_no_${syncOperationIndex}`;
	// syncOperationIndex++;
	
	const objKey = `Sync_action_no_${Date.now()}`;

	let syncData = {'data': data, 'category': -1};
	if(category === 'NewReview'){
		let tmp = JSON.parse(data);
		tmp.id = objKey;
		syncData.data = JSON.stringify(tmp);
		syncData.category = syncCreateNewRestaurantReviewCount;
		// store.put(data, syncCreateNewRestaurantReviewCount);
		// syncCreateNewRestaurantReviewCount++;
	}else if(category === 'DeleteReview'){
		syncData.category = syncDeleteRestaurantReviewCount;

		// store.put(data, syncDeleteRestaurantReviewCount);
		// syncDeleteRestaurantReviewCount++;
	}else if(category === 'UpdateReview'){
		syncData.category = syncUpdateRestaurantReviewCount;
		// store.put(data, syncUpdateRestaurantReviewCount);
		// syncUpdateRestaurantReviewCount++;
	}else if(category === 'Favorite'){
		syncData.category = syncFavoriteRestaurantCount;
		// store.put(data, syncFavoriteRestaurantCount);
		// syncFavoriteRestaurantCount++;
	}else if(category === 'unFavorite'){
		syncData.category = syncUnfavoriteRestaurantCount;
		// store.put(data, syncUnfavoriteRestaurantCount);
		// syncUnfavoriteRestaurantCount++;
	}

	
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		
		store.put(syncData, objKey);

		tx.oncomplete = function() {
	        db.close();
	    };
	}
	return {'key': objKey , 'value': syncData};
}

var updateExistingSyncObject=(objKey, newValue)=>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.put(newValue, objKey);
		tx.oncomplete = function() {
	        db.close();
	    };
	}
}


var getAllPendingReviews = (resturantID, callback)=>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.openCursor().onsuccess = function(event) {
  			var cursor = event.target.result;
  			if (cursor) {
  				if(cursor.value.category < syncFavoriteRestaurantCount){
  					let rev = cursor.value;
				    if(JSON.parse(cursor.value.data).restaurant_id === resturantID ){
				    	callback( rev, cursor.key, false);
				    }
				    cursor.continue();
  				}
			  }
  		}
	}
}

var iterateSyncIDB = (callback)=>{
	var open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName);
		var store = tx.objectStore(syncObjectStoreName);

		store.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
			  	const info = cursor.value.data;
			  	const category = cursor.value.category;
			  	const cursKey = cursor.key;

			  	callback(cursKey, info, category);

			  	cursor.continue();
			}
		}
	}
}

var removeFromSyncIDB = (id)=>{
	var open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.delete(id);
		tx.oncomplete = function() {
	        db.close();
	    };
	}
}

var removeResturantReviews = (resId)=>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		let req = store.delete(resturantReviewsPrefix + resId);

		req.onsuccess = (event)=>{
			console.log('resturant ' + resId + ' reviews removed successfully from IDB..');
		}

		req.onerror = (event)=>{
			console.error( 'ERROR during removeResturantReviews: ' , evt.target.errorCode);
		}
		tx.oncomplete = function() {
	        db.close();
	    };
		return;
	}
}