var showTweets = function(){
	var links = $('a');
	$('#searcTerm').hide();
	var tweets = $('.tweets');
	var info2hide = $('.info-hide');
	var createdBy = $('#2hide');
	createdBy.show();
	info2hide.hide();
	links.show();
	tweets.show(1000);

}

var hideTweets = function(){
	console.log('hiding');
	var links = $('a');
	var tweets = $('.tweets');
	var createdBy = $('#2hide');
	createdBy.hide();
	links.hide();
	tweets.hide();

}

hideTweets();