'use strict';

// register service worker.
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/serviceWorkerRegistration.js').then(function () {
		console.log('Registration Working..');
	}).catch(function (error) {
		console.log('Registration Failed..');
		console.log(error);
	});

	// navigator.serviceWorker.ready.then(function(swRegistration) {
	//   return swRegistration.sync.register('myFirstSync');
	// }).catch(()=>{
	// 	// system was unable to register for a sync,
	//    	// this could be an OS-level restriction

	// });
} else {
	console.log('browser doesnt support service worker..');
}
//# sourceMappingURL=sw.js.map
