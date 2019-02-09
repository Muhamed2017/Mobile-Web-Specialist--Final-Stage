
// self.importScripts('../restaurant_info.js');

self.onmessage = (message)=>{
	let reviews = message.data.reviews;
	let ul = '<div>';
	reviews.forEach(review => {
		if(review){
			ul = ul + generateReviewHTML(review);
		}
	});
	ul = ul + '</div>'
	postMessage({'ul': ul});
}


var generateReviewHTML = (review) => {
  
  
  let name = `<p1>${review.name}</p1>`;

  let createDate = new Date(review.createdAt);
  let date = `<p2>${createDate.toDateString()}</p2>`;
  
  let head = `<h4 class="reviewHead">${name}${date}</h4>`;

  let rating = `<p3 class="reviewRate ${getRatingClassName(review.rating)}">Rating: ${review.rating}</p3>`;


  let comments = `<p>${review.comments}</p>`;
  
  let editButton = `<button class="reviewActionButton fa" onclick="editExistingReview(${review.id})" role="presentation" aria-label="Edit Review">&#xf044; Edit</button>`;
  let deleteButton = `<button class="reviewActionButton fa" onclick="deleteReviewAction(${review.id})" role="presentation" aria-label="Delete Review">&#xf00d; Delete</button>`;

  // let editDiv = `<div class="reviewActionsDiv" role="form">${editButton}${deleteButton}</div>`;

  let li = `<div id="review_${review.id}">${head}${rating}${deleteButton}${editButton}${comments}</div>`;
  return li;
}

var getRatingClassName = (rate) =>{
	let rateName = 'unknownRate';
	if(rate == 0){
		rateName = 'rate0';
	}else if(rate == 1){
		rateName = 'rate1';
	}else if(rate == 2){
		rateName = 'rate2';
	}else if(rate == 3){
		rateName = 'rate3';
	}else if(rate == 4){
		rateName = 'rate4';
	}else if(rate == 5){
		rateName = 'rate5';
	}
	return rateName;
}