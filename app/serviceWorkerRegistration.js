
const cacheName = 'RestaurantReviews';
const DB_PORT = '1337';
const DB_HOST_NAME = 'localhost';
// const IDB_Name = 'mws-restaurant-stage-1';
// const IDB_Version = 1;
// const SYNC_ObjectStoreName = 'syncRequests';

self.addEventListener('install', function(event) {
	
	self.skipWaiting();
	
	event.waitUntil(
		caches.open(cacheName).then(function(cache){
			return cache.addAll(['/index.html', '/restaurant.html',
				'/styles/ResponsiveDesign.css', '/styles/RestaurantsResponsiveDesign.css','/styles/styles.css',
				'/scripts/dbhelper.js','/scripts/main.js','/scripts/restaurant_info.js','/scripts/sw.js', '/scripts/idb.js', 
				'/scripts/common.js', 'scripts/modificationOperations.js',
				'/scripts/workers/restaurantReviewsPreparation.js', '/scripts/workers/resturantSearchWorker.js', '/scripts/workers/searchCriteriaWorker.js'
				]);
		})
	);
	console.log('installation completed..');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');  
});

self.addEventListener('fetch', function(event) {
	console.log('Start retriving data from caching......' + event);
	if(event.request.method != 'POST' && event.request.method != 'PUT' && event.request.method != 'DELETE'){
		var requestURL = new URL(event.request.url);
		if(requestURL.origin === location.origin){
			if(requestURL.pathname === '/'){
				event.respondWith(caches.match('index.html'));
				return;
			}
		}

		if(!(requestURL.port === DB_PORT && requestURL.hostname === DB_HOST_NAME)){
			event.respondWith(
				caches.open(cacheName).then(function(cache) {
					return cache.match(event.request).then(function (response) {
						return response || fetch(event.request).then(function(response) {
							cache.put(event.request, response.clone());
							return response;
						}).catch(error =>{
							// console.log(error);
						});
					});
				})
			);
		}else{
			// console.log('worker request URL==> ' + event.request.url);
			// console.log('worker request PORT==> ' + requestURL.port);
			// console.log('worker request HOST NAME==> ' + requestURL.hostname);
			
			event.respondWith(
				fetch(event.request).then(function(response) {
					return response;
				}).catch(error =>{
					// console.log(error);
				})
					
			);
		}
	}
});


/* for synching the reviews after getting online*/
// self.addEventListener('sync', function(event) {
// 	console.log('Start sync process...');

// 	// event.waitUntil(
// 	// 	syncInfo()
// 	// );
// 	console.log('Sync completed....');
// });
