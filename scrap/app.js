var ANALYSIS_WINDOW_IN_DAYS = 14;

// Entry point to the entire app.
var start = function(){

 

	loadData().then(function(data){
		console.log("drs2 ", data);
		// TODONICK: split data into two arrays. 'first half and second half'
		// recentWindow is today to today-ANALYSIS_WINDOW_IN_DAYS  and oldWindow = today-ANALYSIS_WINDOW_IN_DAYS  to today-2*ANALYSIS_WINDOW_IN_DAYS 
		//DONT DISTRUCT PARAMS PASSED INTO AGGREGATE FUNCTIONS.
		// TODO: DAVID
		//aggregatedRecentWindow = aggregatedData(recentWindow);
		//aggregatedOldWindow = aggregatedData(oldWindow);
		// TODO: comparisonList = compareWindows(aggregatedOldWindow, aggregatedRecentWindow);
		// compare return must already be sorted.
		// comparisonList = [{agency: "blah ", change: 0.45, newValue: 12},...]
		//TODO: drawChart(comparisonList);
	});
};


/*
	Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6 
	Sample JSON API call: https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000 
	Data Sample in Sheet: https://docs.google.com/spreadsheets/d/1yGd2B7F8mlDg64L-uL3Byuxfxn1irl4ZLd0vETaq2GU/edit#gid=1562030977 
	Socrata API docs: https://dev.socrata.com/consumers/getting-started.html
*/
var loadData = function(){
	// TODO NICK: 
	//   get todays date
	//   todays date - ANALYSIS_WINDOW_IN_DAYS*2
	// turn into filter object and pass it in the request.

	var fitlers = {}; //TODO: add filters to request
	return $.getJSON('https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000', function(data){
		console.log('data', data);
		// do anything we want....but try to leave agregating out of the load function.
	});
};


// Aggregate data to the responsible agency.
// TODO3: instead of always doing responsible agency, make aggregateable key a param.
var aggregateData = function(data) {
	var aggregatedData = {};

	data.forEach(function(d){
		aggregatedData
	});
}



start();
