var ANALYSIS_WINDOW_IN_DAYS = 28,
	CHART_LENGTH = 10,
	MIN_CLOSES = 40, // both weeks must have at least this many closes to consider the department.
    todaysDate = moment().startOf('day').format('YYYY-MM-DD');

// Entry point to the entire app.
var start = function(windowSizeInDays){
	resetApp(windowSizeInDays);
	var aPromise = loadData(oldWindow);
	var bPromise = loadData(recentWindow);
	$.when(aPromise, bPromise).then(function(){
		comparisonList = compareWindows(recentWindow.data, oldWindow.data);
		// compare return must already be sorted.
		// comparisonList type: [{agency: "blah ", change: 0.45, newValue: 12},...]
		filteredList = filterComparisonData(comparisonList);
		drawChart(filteredList, CHART_LENGTH);
	});
};

var resetApp = function(windowSizeInDays){
    // Update DOM
    $('#leaderboard').html('<img src="loading.gif" class="loading-icon"/>');    
	$(".currentNumDays").each(function(el){
		$(this).text(windowSizeInDays);
	});

	// Reset variables.
    begginingOfAnalysisWindow = moment().startOf('day').subtract((windowSizeInDays * 2)-1, 'days').format('YYYY-MM-DD')
    oldWindow = { 'start': begginingOfAnalysisWindow,
        'end': moment(begginingOfAnalysisWindow).add(windowSizeInDays - 1, 'd').format('YYYY-MM-DD'),
        'data': {}
    },
    recentWindow = { 'start': moment(oldWindow.end).add('1', 'd').format('YYYY-MM-DD'),
        'end': todaysDate,
        'data': {}
    };
}


/*
	Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6
	Sample JSON API call: https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000
	Data Sample in Sheet: https://docs.google.com/spreadsheets/d/1yGd2B7F8mlDg64L-uL3Byuxfxn1irl4ZLd0vETaq2GU/edit#gid=1562030977
	Socrata API docs: https://dev.socrata.com/consumers/getting-started.html
*/
var loadData = function(window){
	var closedFilter = "$select=COUNT(*),responsible_agency&$group=responsible_agency&$where=(closed > \'"+window.start+"\' AND closed < \'"+window.end+"\')";

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
			changeInCloseCount: recentRate - oldRate,
			changeInCloseRate: (recentRate - oldRate) / oldRate,
			recentCloseRate: recentRate,
			oldCloseRate: oldRate})
	});

	comparisonList = _.sortBy(comparisonList, function(agency){ return agency.changeInCloseRate; });

	return comparisonList.reverse();
}


var filterComparisonData = function(comparisonList){
	var newList = _.reject(comparisonList, function(item){
		return item.recentCloseRate < MIN_CLOSES || item.oldCloseRate < MIN_CLOSES;
	});
	return newList;
};

var drawChart = function(comparisonList, chartLength){
    $('#leaderboard').html('');
	for(var i=0;i< chartLength;i++){
		var agency =comparisonList[i];
        var isGood = agency.changeInCloseRate > 0,
            classColor = isGood ? 'good': 'bad';

		$('#leaderboard').append("<div class='agency'>" + 
			agency.responsible_agency + "  " +
        	"<span class='change-num "+classColor+"'>" +
	        	"<span class='small'>"+agency.oldCloseRate + " -> " + agency.recentCloseRate+"</span> "+
	        	prettyPercent(agency.changeInCloseRate) + "% "+        	  
        	"</span>" +
        "</div>")
	}

};

var prettyPercent = function(num){
	return Math.round(num * 100);
};

// Aggregate data to the responsible agency.
// format: {"agency Name blah": {responsible_agency: "blah", newlyOpened:123, closed:456}}
var UNUSED_aggregateData = function(dataWindow) {
	var STATUS_CLOSED = "Closed";
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

// ui listener for num days buttons.
$(".numDays").click(function(){
	var currentNumDays = $(this).text();
	start(currentNumDays);
});

// Helper function to quickly show all agencies.
var showAllAgencies = function(){
	drawChart(filteredList, filteredList.length);
}

start(ANALYSIS_WINDOW_IN_DAYS);
