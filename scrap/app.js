// Entry point to the entire app.
var start = function(){
	var FOUR_WEEKS = 4 * 7;
	loadData(FOUR_WEEKS).then(function(data){
		console.log("drs2 ", data);
	});
};

/*
Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6 
Sample JSON API call: https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000 
Data Sample in Sheet: https://docs.google.com/spreadsheets/d/1yGd2B7F8mlDg64L-uL3Byuxfxn1irl4ZLd0vETaq2GU/edit#gid=1562030977 
Socrata API docs: https://dev.socrata.com/consumers/getting-started.html
*/
var loadData = function(timeperiodDays){
	var fitlers = {}; //TODO: add filters so it gets the last timeperiodDays worth of data
	return $.getJSON('https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000', function(data){
		console.log('data', data);
		// TODO anything we want....but try to leave agregating out of the load function.
	});
};

start();
