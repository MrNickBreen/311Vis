var ANALYSIS_WINDOW_IN_DAYS = 7,
    todaysDate = moment().startOf('day').format('YYYY-MM-DD'),
    begginingOfAnalysisWindow = moment().startOf('day').subtract((ANALYSIS_WINDOW_IN_DAYS*2)-1, 'days').format('YYYY-MM-DD'),

    oldWindow = { 'start': begginingOfAnalysisWindow,
        'end': moment(begginingOfAnalysisWindow).add(ANALYSIS_WINDOW_IN_DAYS-1, 'd').format('YYYY-MM-DD'),
        'data': {}
    },
    recentWindow = { 'start': moment(oldWindow.end).add('1', 'd').format('YYYY-MM-DD'),
        'end': todaysDate,
        'data': {}
    };

// Entry point to the entire app.
var start = function(){
	var aPromise = loadData(oldWindow);
	var bPromise = loadData(recentWindow);
	$.when(aPromise, bPromise).then(function(){
		console.log("when drs2 ");
        // NOTE: split data into two arrays, an event can be opened in oldWindow
		// and closed in recentWindow
        // $.each( data, function( i, entry ) {
        //     var eventIsOpenedBetweenRecentStartAndEnd =
        //         moment(entry.opened).isAfter(recentWindow.start) &&
        //         moment(entry.opened).isBefore(recentWindow.end),
        //         eventIsClosedBetweenRecentStartAndEnd =
        //         moment(entry.closed).isAfter(recentWindow.start) &&
        //         moment(entry.closed).isBefore(recentWindow.end);
        //   if (eventIsOpenedBetweenRecentStartAndEnd ||
        //     eventIsClosedBetweenRecentStartAndEnd) {
        //         recentWindow.data.push(entry);
        //   } else {
        //       oldWindow.data.push(entry);
        //   }
        // })
		// oldWindow = today-(2*ANALYSIS_WINDOW_IN_DAYS) to today-ANALYSIS_WINDOW_IN_DAYS
		// recentWindow is today-ANALYSIS_WINDOW_IN_DAYS+1 to today
		// NOTE: DONT DISTRUCT PARAMS PASSED INTO AGGREGATE FUNCTIONS.
		// TODO: DAVID
		// aggregatedRecentWindow = aggregateData(recentWindow);
		// aggregatedOldWindow = aggregateData(oldWindow);
		console.log('oldWindow', oldWindow);
		console.log('recentWindow', recentWindow);
		comparisonList = compareWindows(recentWindow.data, oldWindow.data);
		console.log('comaprisonList', comparisonList);
		// compare return must already be sorted.
		// comparisonList = [{agency: "blah ", change: 0.45, newValue: 12},...]
		comparisonList = filterComparisonData(comparisonList);
		drawChart(comparisonList);
	});
};


/*
	Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6
	Sample JSON API call: https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000
	Data Sample in Sheet: https://docs.google.com/spreadsheets/d/1yGd2B7F8mlDg64L-uL3Byuxfxn1irl4ZLd0vETaq2GU/edit#gid=1562030977
	Socrata API docs: https://dev.socrata.com/consumers/getting-started.html
*/
var loadData = function(window){
	// TODO: replace with calls like this:
	var closedFilter = "$select=COUNT(*),responsible_agency&$group=responsible_agency&$where=(closed > \'"+window.start+"\' AND closed < \'"+window.end+"\')";

	//var filters = "$where=(closed > \'"+begginingOfAnalysisWindow+"\' AND closed < \'"+todaysDate+"\')";//" OR (opened > \'"+begginingOfAnalysisWindow+"\' AND opened < \'"+todaysDate+"\')";

	return $.getJSON('https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=50000&' + closedFilter, function(data){
		var map = {};
		_.each(data, function(d){
			map[d.responsible_agency] = {responsible_agency: d.responsible_agency, closed: d.count};
		});

		window.data = map;
		// do anything we want....but try to leave agregating out of the load function.
	});
};

// returns [{responsible_agency: "blah ", change: 0.45, newValue: 12},...]
var compareWindows = function(recentW, oldW){
	var comparisonList = [];
	_.each(recentW, function(data, agencyName){
		var oldRate = oldW[agencyName] ? oldW[agencyName].closed : 0;
		var recentRate = recentW[agencyName] ? recentW[agencyName].closed : 0;
		comparisonList.push({responsible_agency: agencyName,
			changeInCloseRate: recentRate - oldRate,
			recentCloseRate: recentRate,
			oldCloseRate: oldRate})
	});

	comparisonList = _.sortBy(comparisonList, function(agency){ return agency.changeInCloseRate; });

	return comparisonList.reverse();
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

var filterComparisonData = function(comparisonList){
	var MIN_CLOSES = 10;
	var newList = _.reject(comparisonList, function(item){
		return item.recentCloseRate < MIN_CLOSES || item.oldCloseRate < MIN_CLOSES;
	});
	return newList;
};

var drawChart = function(comparisonList){
    $('#leaderboard').html('');
	comparisonList.forEach(function(agency){
        var isGood = agency.changeInCloseRate > 0,
            classColor = isGood ? 'good': 'bad';
		$('#leaderboard').append("<div class='agency'>" + agency.responsible_agency + "  " +
        "<span class='change-num "+classColor+"'>" +
        agency.changeInCloseRate + "</span></div>")
	});

};

// ===== nick write below here



start();
