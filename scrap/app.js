var ANALYSIS_WINDOW_IN_DAYS = 4,
    todaysDate = moment().startOf('day').format('YYYY-MM-DD'),
    begginingOfAnalysisWindow = moment().startOf('day').subtract((ANALYSIS_WINDOW_IN_DAYS*2)-1, 'days').format('YYYY-MM-DD'),

    oldWindow = { 'start': begginingOfAnalysisWindow,
        'end': moment(begginingOfAnalysisWindow).add(ANALYSIS_WINDOW_IN_DAYS-1, 'd').format('YYYY-MM-DD'),
        'data': []
    },
    recentWindow = { 'start': moment(oldWindow.end).add('1', 'd').format('YYYY-MM-DD'),
        'end': todaysDate,
        'data': []
    };

// Entry point to the entire app.
var start = function(){
	loadData().then(function(data){
		console.log("drs2 ", data);
        // NOTE: split data into two arrays, an event can be opened in oldWindow
		// and closed in recentWindow
        $.each( data, function( i, entry ) {
            var eventIsOpenedBetweenRecentStartAndEnd =
                moment(entry.opened).isAfter(recentWindow.start) &&
                moment(entry.opened).isBefore(recentWindow.end),
                eventIsClosedBetweenRecentStartAndEnd =
                moment(entry.closed).isAfter(recentWindow.start) &&
                moment(entry.closed).isBefore(recentWindow.end);
          if (eventIsOpenedBetweenRecentStartAndEnd ||
            eventIsClosedBetweenRecentStartAndEnd) {
                recentWindow.data.push(entry);
          } else {
              oldWindow.data.push(entry);
          }
        })
		// oldWindow = today-(2*ANALYSIS_WINDOW_IN_DAYS) to today-ANALYSIS_WINDOW_IN_DAYS
		// recentWindow is today-ANALYSIS_WINDOW_IN_DAYS+1 to today
		// NOTE: DONT DISTRUCT PARAMS PASSED INTO AGGREGATE FUNCTIONS.
		// TODO: DAVID
		aggregatedRecentWindow = aggregateData(recentWindow);
		aggregatedOldWindow = aggregateData(oldWindow);
		console.log('aggregatedOldWindow', aggregatedOldWindow);
		comparisonList = compareWindows(aggregatedRecentWindow, aggregatedOldWindow);
		console.log(comparisonList);
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
	var filters = "$where=(closed > \'"+begginingOfAnalysisWindow+"\' AND closed < \'"+todaysDate+"\') OR (opened > \'"+begginingOfAnalysisWindow+"\' AND opened < \'"+todaysDate+"\')";

	return $.getJSON('https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=50000&'+filters, function(data){
		console.log('data', data);
		// do anything we want....but try to leave agregating out of the load function.
	});
};

// returns [{responsible_agency: "blah ", change: 0.45, newValue: 12},...]
var compareWindows = function(recentW, oldW){
	var comparisonList = [];
	_.each(recentW, function(data, agencyName){
		var oldRate = oldW[agencyName].closed;
		var recentRate = recentW[agencyName].closed;
		comparisonList.push({responsible_agency: agencyName,
			changeInCloseRate: recentRate - oldRate,
			recentCloseRate: recentRate,
			oldCloseRate: oldRate})
	});

	_.sortBy(comparisonList, function(agency){ return agency.changeInCloseRate; });

	return comparisonList;
}

// Aggregate data to the responsible agency.
// TODO3: instead of always doing responsible agency, make aggregateable key a param.
var aggregateData = function(dataWindow) {
	var STATUS_CLOSED = "Closed";
	// format: {"agency Name blah": {responsible_agency: "blah", newlyOpened:123, closed:456}}
	var aggregatedData = {};

	dataWindow.data.forEach(function(d){
		var agency = d.responsible_agency;
		// first time we see this agency
		if(!aggregatedData[agency]){
			aggregatedData[agency] = {responsible_agency: agency, newlyOpened: 0, closed: 0};
		}
		if (moment(d.closed).isBetween(dataWindow.start, dataWindow.end)) {
			aggregatedData[agency].closed++;
		}
		if (moment(d.opened).isBetween(dataWindow.end, dataWindow.end)){ // TODO: use moment to check if it isInNowWindow
			aggregatedData[agency].newlyOpened++;
		}
	});

	return aggregatedData;
}

var drawChart = function(comparisonList){
	comparisonList.forEach(function(agency){
		$('#leaderboard').add("<div class='agency'>" + agency.responsible_agency + "  " + agency.changeInCloseRate + "</div>")
	});

};

// ===== nick write below here



start();
