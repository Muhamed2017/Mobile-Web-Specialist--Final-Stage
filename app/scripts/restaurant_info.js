let restaurant;
var map;
let resturantID;
let restaurantReviewsList;

const CATEGORY_NEW_REVIEW = 'NewReview';
const CATEGORY_DELETE_REVIEW = 'DeleteReview';
const CATEGORY_UPDATE_REVIEW = 'UpdateReview';

var originalModifiedReviewsInnerHTML = new Map();
var notSubmittedReviews = new Map();
const EDIT_REVIEW_NAME_ID_PREFIX = 'edit_review_name_';
const EDIT_REVIEW_RATING_ID_PREFIX = 'edit_review_rating_';
const EDIT_REVIEW_COMM_ID_PREFIX = 'edit_review_comm_';
const EDIT_REVIEW_RADIO_NAME_PREF = '_rating_';
const SINGLE_REVIEW_DIV_PREFIX = 'review_';

const NOT_SUBMITTED_REVIEW_DIV_PREFIX= 'notSubmittedReviewDiv_';
/**
 * Initialize Google map, called from HTML.
 */

document.addEventListener('readystatechange', event => {
  if (event.target.readyState === 'interactive') {
    console.log('I am in interactive state....');
  }
  else if (event.target.readyState === 'complete') {
    console.log('I am in complete state....');
    
    fetchRestaurantFromURL((error, restaurant) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        self.restaurant = restaurant;
        fillBreadcrumb();
      }
    });
  }
});


window.initMap = () => {
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: restaurant.latlng,
    scrollwheel: false
  });
  DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
}

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  self.resturantID = id;
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    // from DB first
    resturantByID(id,(error,rest)=>{
      if(rest){
        self.restaurant = rest;
        fillRestaurantHTML();
        callback(null, restaurant);
      }else{
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
          self.restaurant = restaurant;
          if (!restaurant) {
            console.error(error);
            return;
          }
          fillRestaurantHTML();
          callback(null, restaurant);
        });
      }
    });
    

    resturantReviews(id,(error, reviews)=>{
      if(reviews){
        self.reviews = reviews;
        fillReviewsHTML(undefined, reviews);
        getAllPendingReviews(id, afterSubmittingReviewFail);
      }else{
        DBHelper.fetchRestaurantReviews(id, fillReviewsHTML, afterSubmittingReviewFail);
      }
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  let heartClass = '&#xf08a;';
  if(restaurant.is_favorite === true || restaurant.is_favorite === 'true'){
    heartClass = '&#xf004;';
  }
  let favSpan = document.createElement('button');
  favSpan.id = `${CONST_FAVORITIFY_ACTION_SPAN_ID_PREFIX}${restaurant.id}`;
  favSpan.className = 'fa favoriteButton';
  favSpan.innerHTML = heartClass;
  favSpan.setAttribute('onclick',`markRestaurantAsFavorit(${restaurant.id}, ${restaurant.is_favorite}, -1)`);
  favSpan.setAttribute('role', 'presentation');
  favSpan.setAttribute('aria-label', 'Add to Favorite');
  name.appendChild(favSpan);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // TODO picture from HTML and change the requirement from here.
  const picture = document.getElementById('restaurant-img');
  picture.className = 'restaurant-img';
//  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  
  
	let imgsList = DBHelper.imagesUrlForRestaurant(restaurant);
	const img1 = document.createElement('source');
	img1.media = '(min-width: 1500px)';
	img1.srcset = imgsList[0];
	img1.className = 'restaurant-img';
	picture.appendChild(img1);
	const img2 = document.createElement('source');
	img2.media = '(min-width: 800px)';
	img2.srcset = imgsList[1];
	img2.className = 'restaurant-img';
	picture.appendChild(img2);
	const img = document.createElement('img');
	img.alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
	img.src = imgsList[2];
	img.className = 'restaurant-img';
	picture.appendChild(img);
  
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // // fill reviews
  // fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = (error ,reviews = self.restaurantReviewsList) => {
  const container = document.getElementById('reviews-container');
  // const title = document.createElement('h3');
  // title.innerHTML = 'Reviews';
  // container.appendChild(title);

  if (error || !reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }else{
    self.restaurantReviewsList = reviews;
    const ul = document.getElementById('reviews-list');
     ul.innerHTML = '';
    if(window.Worker){
      let revWorker = new Worker('scripts/workers/restaurantReviewsPreparation.js');
      revWorker.postMessage({'reviews': reviews});
      revWorker.onmessage = (message)=>{
        let content = message.data.ul;
        ul.innerHTML = ul.innerHTML + content;
      }
    }else{

      reviews.forEach(review => {
        if(review){
          ul.appendChild(createReviewHTML(review));
        }
      });
      container.appendChild(ul);
    }
  }
}

/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = (review, li = document.createElement('div')) => {
  // const li = document.createElement('div');
  li.id= `${SINGLE_REVIEW_DIV_PREFIX}${review.id}`;
//   const name = document.createElement('p1');
//   name.innerHTML = review.name;
// //  li.appendChild(name);

//   const date = document.createElement('p2');
//   // date.innerHTML = review.date;
// //  li.appendChild(date);
//   let createDate = new Date(review.createdAt);
//   date.innerHTML = createDate.toDateString();

//   const head = document.createElement('h4');
//   head.appendChild(name);
//   head.appendChild(date);
//   head.className = 'reviewHead';
//   li.appendChild(head);
  
//   const rating = document.createElement('p3');
//   rating.innerHTML = `Rating: ${review.rating}`; 
// 	rating.className = 'reviewRate ' + getRatingClassName(review.rating);
//   li.appendChild(rating);
  createReviewHeaderSection(li, review);
  createEditAndDeleteButtons(li, review, `editExistingReview(${review.id})`, `deleteReviewAction(${review.id})`);
  createReviewCommentSection(li, review);
  // const comments = document.createElement('p');
  // comments.innerHTML = review.comments;
  // li.appendChild(comments);

  return li;
}

var createReviewHeaderSection=(div, review)=>{
  let name = document.createElement('p1');
  name.innerHTML = review.name;

  let date = document.createElement('p2');
  let createDate = new Date(review.createdAt);
  date.innerHTML = createDate.toDateString();

  let head = document.createElement('h4');
  head.appendChild(name);
  head.appendChild(date);
  head.className = 'reviewHead';
  div.appendChild(head);
  
  let rating = document.createElement('p3');
  rating.innerHTML = `Rating: ${review.rating}`; 
  rating.className = 'reviewRate ' + getRatingClassName(review.rating);
  div.appendChild(rating);
}

var createEditAndDeleteButtons=(div, review, editOnClickAction, deleteOnClickAction)=>{
  let bt1 = document.createElement('button');
  bt1.setAttribute('onclick', editOnClickAction);
  bt1.innerHTML = '&#xf044; Edit';
  bt1.className = 'fa reviewActionButton';
  bt1.setAttribute('role', 'presentation');
  bt1.setAttribute('aria-label', 'Edit Review');


  let btn2 = document.createElement('button');
  btn2.setAttribute('onclick', deleteOnClickAction);
  // let spn2 = document.createElement('span');
  // spn2.className = 'fontawesome-cut';
  btn2.innerHTML = '&#xf00d; Delete';
  btn2.className = 'fa reviewActionButton';
  btn2.setAttribute('role', 'presentation');
  btn2.setAttribute('aria-label', 'Delete Review');
  // btn2.appendChild(spn2);

  div.appendChild(btn2);
  div.appendChild(bt1);
}

var createReviewCommentSection = (div, review)=>{
  let comments = document.createElement('p');
  comments.innerHTML = review.comments;
  div.appendChild(comments);
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

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumbOL');
  let a = document.createElement('a');
  a.href = `./restaurant.html?id=${restaurant.id}`;
  a.setAttribute('aria-current', 'page');
  a.innerHTML = ` ${restaurant.name}`;
  const li = document.createElement('li');
  li.appendChild(a);
  // li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var getSubmittedReviewInfoAndValidation =(nameID, rateID, commID)=>{
  let name = document.getElementById(nameID).value;
  let comm = document.getElementById(commID).value;
  let rateList = document.getElementsByName(rateID);
  let rate = 0;
  for(let i = 0  ; i < rateList.length ;i++){
    if(rateList[i].checked){
      rate= rateList[i].value;
      break;
    }
  }
  if(rate === 0 || name === '' || name === undefined || comm === '' || comm === undefined){
    alert('Missing Informations to submit your review...');
    return undefined;
  }else{
    let reviewInfo = {'restaurant_id': self.resturantID, 
                    'name': name,
                    'rating': rate,
                    'comments': comm,
                    'createdAt': Date.now()};
    return reviewInfo;
  }
}

var submitUserReviewForm = ()=>{
  console.log('executing submitUserReviewForm');
  // let name = document.getElementById('reviewerName').value;
  // let comm = document.getElementById('reviewerComment').value;
  // let rateList = document.getElementsByName('rating');
  // let rate = 0;
  // for(let i = 0  ; i < rateList.length ;i++){
  //   if(rateList[i].checked){
  //     rate= rateList[i].value;
  //     break;
  //   }
  // }

  // if(rate === 0 || name === '' || name === undefined || comm === '' || comm === undefined){
  //   alert('Missing Informations to submit your review...')
  // }else{
  //   let reviewInfo = {'restaurant_id': self.resturantID, 
  //                   'name': name,
  //                   'rating': rate,
  //                   'comments': comm,
  //                   'createdAt': Date.now()};

  let reviewInfo = getSubmittedReviewInfoAndValidation('reviewerName', 'rating', 'reviewerComment');
  if(reviewInfo){
    console.log(reviewInfo);
    
    let jsonData = JSON.stringify(reviewInfo);
    fetch('http://localhost:1337/reviews/', {
        method: 'POST', 
        body: jsonData,
        headers: {
          'content-type': 'application/json'
        }
      }
      ).then((response)=>{
        if(response){
          return response.json();
        }else{
          return undefined;
        }
        
      }).catch((e)=>{
        console.log(e);
      }).then((jsonObj)=>{
        //TODO 
        // check its completed successfully or not
        if(jsonObj){
          console.log('sucess ......');
          console.log(jsonObj);
          // refetch and update DB
          afterSubmittingReviewSuccess();
        }else{
          // error 
          let syncObj = addToSyncListReviews(jsonData, CATEGORY_NEW_REVIEW);
          afterSubmittingReviewFail(syncObj.value, syncObj.key, false);
          alert('Your review will be submitted when you go online or the review service running..');
        }
      });
     clearSubmittedReview('reviewerName', 'rating', 'reviewerComment');
  
  }
}


var afterSubmittingReviewSuccess = ()=>{
  DBHelper.fetchRestaurantReviews(resturantID, (error, reviews) => {
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML(null ,reviews);
  });
}

var afterSubmittingReviewFail = (review, syncDB_key, isExists= false)=>{
    let newDiv ;
  if(!isExists){
    notSubmittedReviews.set(syncDB_key, review);
    newDiv = document.createElement('div');
    newDiv.id = `${SINGLE_REVIEW_DIV_PREFIX}${syncDB_key}`;
  }else{
    newDiv = document.getElementById(`${SINGLE_REVIEW_DIV_PREFIX}${syncDB_key}`);
    newDiv.innerHTML = '';
  }
  
  let rev = JSON.parse(review.data);
  createReviewHeaderSection(newDiv, rev);
  createEditAndDeleteButtons(newDiv, rev, `editNotSubmittedReviewAction('${syncDB_key}')`, `deleteNotSubmittedReviewAction('${syncDB_key}')`);
  createReviewCommentSection(newDiv, rev);

  if(!isExists){
    const ul = document.getElementById('reviews-list');
    ul.appendChild(newDiv);
  }
}

var clearSubmittedReview = (reviewerName, rating, reviewerComment)=>{
  document.getElementById(reviewerName).value = '';
  document.getElementById(reviewerComment).value = '';
  let rateList = document.getElementsByName(rating);

  for(let i = 0  ; i < rateList.length ;i++){
    if(rateList[i].checked){
      rateList[i].checked = false;
      break;
    }
  }
}

var deleteNotSubmittedReviewAction= (mapKey)=>{
  let result = window.confirm('Your didnt submitted yet, Confirm to delete it');
  if(result){
    removeFromSyncIDB(mapKey);
    notSubmittedReviews.delete(mapKey);
    document.getElementById(`${SINGLE_REVIEW_DIV_PREFIX}${mapKey}`).innerHTML = '';
  }
}

var editNotSubmittedReviewAction= (mapKey)=>{
  // TODO
  createEditReviewSection(mapKey);
}


var deleteReviewAction=(reviewID)=>{
  let result = window.confirm('Confirm to delete');
  if(result){
    console.log('Start deleting action id:' + reviewID);
    let successCallback = ()=>{
      DBHelper.fetchRestaurantReviews(self.resturantID,  
        fillReviewsHTML, undefined);
      customNotification('Review Deleted successfully');
    }

    let failCallback = (revid)=>{
      let obj = {'id': revid, 'restaurant_id': self.resturantID};
      let storedObject = JSON.stringify(obj);
      addToSyncListReviews(storedObject, CATEGORY_DELETE_REVIEW);
      afterDeletingReviewFailure(revid);
    }
    deleteReview(reviewID, successCallback, failCallback);
  }
}

var afterDeletingReviewFailure=(reviewID)=>{
  let index = getReviewByID(reviewID);
  if(index && index < restaurantReviewsList.length){
    restaurantReviewsList[index] = undefined;
  }

  let revDiv = document.getElementById(`${SINGLE_REVIEW_DIV_PREFIX}${reviewID}`);
  revDiv.innerHTML = '';
  addResturantReviews(resturantID,restaurantReviewsList);
}


var getReviewByID = (id)=>{
  for(let index = 0 ; index < restaurantReviewsList.length ; index++){
    if(restaurantReviewsList[index] && restaurantReviewsList[index].id === id){
      return index;
    }
  }
  return undefined;
}

var createEditReviewSection = (reviewID)=>{
  let revDev = document.getElementById(`${SINGLE_REVIEW_DIV_PREFIX}${reviewID}`);
  originalModifiedReviewsInnerHTML.set(reviewID, revDev.innerHTML);
  revDev.innerHTML = '';
  revDev.className = 'editReviews';
  revDev.setAttribute('role', 'form');
  revDev.setAttribute('aria-labelledby','editReviewLabel');

  
  let hd = document.createElement('h4');
  let p1 = document.createElement('p1');
  p1.innerHTML = 'Edit Review:';
  hd.appendChild(p1);
  hd.className = 'reviewHead';

  revDev.appendChild(hd);

  let index = getReviewByID(reviewID);
  let review;
  if(index){
    review = restaurantReviewsList[index];
  }else{
    review = JSON.parse(notSubmittedReviews.get(reviewID).data);
  }

  let name = document.createElement('input');
  name.type = 'text';
  name.value = review.name;
  name.id = `${EDIT_REVIEW_NAME_ID_PREFIX}${reviewID}`;
  name.setAttribute('maxlength', 50);
  let nmLbl = document.createElement('label');
  nmLbl.innerHTML = 'Reviewer Name: ';
  nmLbl.setAttribute('for',name.id);
  revDev.appendChild(nmLbl);
  revDev.appendChild(name);

  let rateDiv1 = document.createElement('div');
  rateDiv1.className = 'modifyReviewRating';
  rateDiv1.id = `${EDIT_REVIEW_RATING_ID_PREFIX}${reviewID}`;
  rateDiv1.setAttribute('name', rateDiv1.id);
  generateRatingStars(rateDiv1, review.rating, reviewID);
  revDev.appendChild(rateDiv1);

  let comm = document.createElement('textarea');
  comm.id = `${EDIT_REVIEW_COMM_ID_PREFIX}${reviewID}`;
  comm.value =review.comments;
  comm.setAttribute('maxlength', 1000);
  let commLbl = document.createElement('label');
  commLbl.className = 'reviewerCommentLabel';
  commLbl.setAttribute('for',comm.id);
  commLbl.innerHTML = 'Edit The Review Comment here';

  revDev.appendChild(commLbl);
  revDev.appendChild(comm);

  // let actionDev = document.createElement('div');
  // actionDev.className = 'reviewActionsDiv';
  // let save = document.createElement('button');
  // save.setAttribute('onclick', `saveUpdatedReview({'reviewID': ${reviewID}, 'index':${index}})`);
  // let sp1 = document.createElement('span');
  // sp1.className = 'fontawesome-save';
  // sp1.innerHTML = 'Save';
  // save.appendChild(sp1);
  // let cancel = document.createElement('button');
  // cancel.setAttribute('onclick', `cancelEditingReview({'reviewID': ${reviewID}, 'index':${index}})`);
  // let sp2 = document.createElement('span');
  // sp2.className = 'fontawesome-remove-sign';
  // sp2.innerHTML = 'Exit';
  // cancel.appendChild(sp2);

  // actionDev.appendChild(save);
  // actionDev.appendChild(cancel);

  // revDev.appendChild(actionDev);
  createEdititedReviewActionsButtons(revDev, reviewID, index);
}

var createEdititedReviewActionsButtons=(div, reviewID, index)=>{
  
  let save = document.createElement('button');
  if(index){
    save.setAttribute('onclick', `saveUpdatedReview({'reviewID': ${reviewID}, 'index':${index}})`);
  }else{
    save.setAttribute('onclick', `saveUpdatedReview({'reviewID': '${reviewID}', 'index':${index}})`);
  }
  
  // let sp1 = document.createElement('span');
  // sp1.className = 'fontawesome-save';
  save.innerHTML = '&#xf1d8; Save';
  save.className = 'fa editReviewActionButton';
  save.setAttribute('role', 'presentation');
  save.setAttribute('aria-label', 'Save Modified Review');
  // save.appendChild(sp1);

  let cancel = document.createElement('button');
  if(index){
    cancel.setAttribute('onclick', `cancelEditingReview({'reviewID': ${reviewID}, 'index':${index}})`);
  }else{
    cancel.setAttribute('onclick', `cancelEditingReview({'reviewID': '${reviewID}', 'index':${index}})`);
  }
  
  // let sp2 = document.createElement('span');
  // sp2.className = 'fontawesome-remove-sign';
  cancel.innerHTML = '&#xf05c; Exit';
  cancel.className = 'fa editReviewActionButton';
  cancel.setAttribute('role', 'presentation');
  cancel.setAttribute('aria-label', 'Discard Review modifications');
  // cancel.appendChild(sp2);

  div.appendChild(save);
  div.appendChild(cancel);

}

var generateRatingStars = (rateDiv, rating, revID) =>{
  generateStar(rateDiv, 1, 'Sucks big time', revID, rating);
  generateStar(rateDiv, 2, 'Kinda bad', revID, rating);
  generateStar(rateDiv, 3, 'Meh', revID, rating);
  generateStar(rateDiv, 4, 'Pretty good', revID, rating);
  generateStar(rateDiv, 5, 'Awesome', revID, rating);
  
}

var generateStar = (div,val, txt, revID, rating)=>{
  let s1 = document.createElement('input');
  s1.type = 'radio';
  s1.id = `_star${val}`;
  s1.name = `${EDIT_REVIEW_RADIO_NAME_PREF}${revID}`;
  s1.value = val;
  
  let l1 = document.createElement('label');
  // l1.className = 'full';
  l1.setAttribute('for',s1.id);
  l1.title = `${txt} - ${val} stars`;
  l1.innerHTML = `${val} &#9734;`;

  if(Number.parseInt(rating, 10) === val){
    s1.setAttribute('checked', true);
  }

  div.appendChild(s1);
  div.appendChild(l1);
}

var editExistingReview= (reviewID)=>{
  createEditReviewSection(reviewID);
}

var cancelEditingReview=(info)=>{
  let result = window.confirm('Discard Changes ?');
  if(result){
    let reviewID = info.reviewID;
    let index = info.index;
    let revDev = document.getElementById(`review_${reviewID}`);
    revDev.innerHTML = originalModifiedReviewsInnerHTML.get(reviewID);
    originalModifiedReviewsInnerHTML.delete(reviewID);
  }
}

var saveUpdatedReview= (info)=>{
  let reviewID = info.reviewID;
  let index = info.index;
  let reviewInfo = getSubmittedReviewInfoAndValidation(`${EDIT_REVIEW_NAME_ID_PREFIX}${reviewID}`, 
    `${EDIT_REVIEW_RADIO_NAME_PREF}${reviewID}`, `${EDIT_REVIEW_COMM_ID_PREFIX}${reviewID}`);
  
  if(reviewInfo){
    let result = window.confirm('Confirm to apply the changes?');
    if(result){
      console.log('Start updating the review: ' + reviewID + 'with below info');
      console.log(reviewInfo);
      reviewInfo.review_id = reviewID;
      if(index){ // normal review update
        let jsonData = JSON.stringify(reviewInfo);

        let failCallback = (response)=>{
          let myRev = restaurantReviewsList[index];

          myRev.name = reviewInfo.name;
          myRev.comments = reviewInfo.comments;
          myRev.rating = reviewInfo.rating;

          addToSyncListReviews(jsonData,CATEGORY_UPDATE_REVIEW);
          addResturantReviews(resturantID,restaurantReviewsList);

          let mydiv = document.getElementById(`${SINGLE_REVIEW_DIV_PREFIX}${reviewID}`);
          mydiv.innerHTML = '';
          createReviewHTML(myRev, mydiv);
        }

        updateRestaurantReview(jsonData,afterSubmittingReviewSuccess, failCallback);

        originalModifiedReviewsInnerHTML.delete(reviewID);
      }else{
        // not submitted review.
        // TODO
        let newDBContent = notSubmittedReviews.get(reviewID);
        let stringObj = JSON.stringify(reviewInfo)
        newDBContent.data = stringObj;
        updateExistingSyncObject(reviewID, newDBContent);

        // let mydiv = document.getElementById(`${SINGLE_REVIEW_DIV_PREFIX}${reviewID}`);
        // mydiv.innerHTML = '';
        afterSubmittingReviewFail(newDBContent, reviewID, true);

        originalModifiedReviewsInnerHTML.delete(reviewID);
      }
      
    }
  }
}
