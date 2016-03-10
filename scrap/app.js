// Wrapping everything to not leak into global namespace
(function() {
	// Pull out commonly edited files into config.
	var ANALYSIS_WINDOW_IN_DAYS = 28,
		CHART_LENGTH = 10,
		MIN_CLOSES = 40, // both weeks must have at least this many closes to consider the department.
	    todaysDate = moment().startOf("day").format("YYYY-MM-DD"),
	    cities = {
	    	sanFrancisco: {
	    		endpoint: 'https://data.sfgov.org/resource/vw6y-z8j6.json'},
	    	 	col_closed: '',
	    	 	col_department: 'responsible_agency',
	    	edmenton: {
	    	 	endpoint: 'https://data.edmonton.ca/resource/ukww-xkmj.json'},
	    	 	col_closed: 'ticket_closed_date_time',
	    	 	col_department: 'agency_responsible',
	    	},
	    	selectedCity = 'sanFrancisco',
		recentWindow, oldWindow;


	/**
	 * Entry point to the entire app. Loads the tickets in the window, compares,
	 * filters and draws the chart.
	 * @param  int windowSizeInDays
	 */
	var start = function(windowSizeInDays){

		// TODO: function that reads page url, gets .com/#CityName  set selectedCity = CityName

		resetApp(windowSizeInDays);
		var aPromise = loadData(oldWindow),
			bPromise = loadData(recentWindow);
		$.when(aPromise, bPromise).then(function(){
			comparisonList = compareWindows(recentWindow.data, oldWindow.data);
			filteredList = filterComparisonData(comparisonList);
			drawChart(filteredList, CHART_LENGTH);
		});
	};

	/**
	 * Reloads Table with windowSizeInDays as the window
	 * @param  int windowSizeInDays
	 */
	var resetApp = function(windowSizeInDays){
	    // Update DOM
	    $("#leaderboard").html("<img src='loading.gif' class='loading-icon'/>");
		$(".currentNumDays").each(function(el){
			$(this).text(windowSizeInDays);
		});

		// Reset variables.
	    begginingOfAnalysisWindow = moment().startOf("day").subtract((windowSizeInDays * 2)-1, "days").format("YYYY-MM-DD")
	    oldWindow = {
			"start": begginingOfAnalysisWindow,
	        "end": moment(begginingOfAnalysisWindow).add(windowSizeInDays - 1, "d").format("YYYY-MM-DD"),
	        "data": {}
	    },
	    recentWindow = {
			"start": moment(oldWindow.end).add("1", "d").format("YYYY-MM-DD"),
	        "end": todaysDate,
	        "data": {}
	    };
	}

	/**
	 * Loads 311 data for the specified window
	 * @param  {[type]} window [has a start and an end]
	 * @return promise	[a promise that is fetching 311 data]
	 *
	 * Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6
	 * Sample JSON API call: https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000
	 * Data Sample in Sheet: https://docs.google.com/spreadsheets/d/1yGd2B7F8mlDg64L-uL3Byuxfxn1irl4ZLd0vETaq2GU/edit#gid=1562030977
	 * Socrata API docs: https://dev.socrata.com/consumers/getting-started.html
	 */
	var loadData = function(window){
		var closedFilter = "$select=COUNT(*),responsible_agency&$group=responsible_agency&$where=(closed > '"+window.start+"' AND closed < '"+window.end+"')";

		return $.getJSON(cities[selectedCity].endpoint + "?$limit=50000&" + closedFilter, function(data){
			var map = {};
			_.each(data, function(d){
				map[d.responsible_agency] = {responsible_agency: d.responsible_agency, closed: d.count};
			});

			window.data = map;
		});
	};

	/**
	 * Creates a sorted comparison list of number of closed tickets between the
	 * two time windows.
	 * @param  {[objects]} recentW [the more recent window of comparison for closed tickets]
	 * @param  {[objects]} oldW    [the less recent window of comparison for closed tickets
	 * @return {[objects]}         [the results of comparing both windows, note, the compare return must already be sorted.]
	 * return example: [{responsible_agency: "blah ", change: 0.45, newValue: 12},...]
	 */
	var compareWindows = function(recentW, oldW){
		var comparisonList = [];
		_.each(recentW, function(data, agencyName){
			var oldRate = oldW[agencyName] ? oldW[agencyName].closed : 0,
				recentRate = recentW[agencyName] ? recentW[agencyName].closed : 0;
			comparisonList.push({responsible_agency: agencyName,
				changeInCloseCount: recentRate - oldRate,
				changeInCloseRate: (recentRate - oldRate) / oldRate,
				recentCloseRate: recentRate,
				oldCloseRate: oldRate})
		});

		comparisonList = _.sortBy(comparisonList, function(agency){
			return agency.changeInCloseRate;
		});

		return comparisonList.reverse();
	}

	/**
	 * Filters out agencies that have too few close rates
	 * @param  {[type]} comparisonList [array of comparison data]
	 * @return {[type]}                [array of comaprison data with closer rates above MIN_CLOSES]
	 */
	var filterComparisonData = function(comparisonList){
		var newList = _.reject(comparisonList, function(item){
			return item.recentCloseRate < MIN_CLOSES || item.oldCloseRate < MIN_CLOSES;
		});
		return newList;
	};

	/**
	 * Writes and renders the HTML to display the data
	 * @param  {[type]} comparisonList [array of agencies close rates comparison results]
	 * @param  {[type]} chartLength    [number of agencies to display]
	 */
	var drawChart = function(comparisonList, chartLength){
		var i, agency, isGood, classColor;
	    $("#leaderboard").html("");

		for(i=0; i< chartLength; i++){
			agency = comparisonList[i];
	        isGood = agency.changeInCloseRate > 0;
	        classColor = isGood ? "good": "bad";

			$("#leaderboard").append("<div class='agency'>" +
				agency.responsible_agency + "  " +
	        	"<span class='change-num "+classColor+"'>" +
		        	"<span class='small'>"+agency.oldCloseRate + " -> " + agency.recentCloseRate+"</span> "+
		        	prettyPercent(agency.changeInCloseRate) + "% "+
	        	"</span>" +
	        "</div>")
		}
	};

	/**
	 * Helper to make a displayable percentage.
	 * @param  {[int]} num [decimal percentage ex 0.88]
	 * @return {[type]}     [displayable percentage ex 88]
	 */
	var prettyPercent = function(num){
		return Math.round(num * 100);
	};

	// ui listener for num days buttons.
	$(".numDays").click(function(){
		var currentNumDays = $(this).text();
		start(currentNumDays);
	});

	/**
	 * Helper function to quickly show all agencies, used in console for curious
	 * folks who want to dive deeper in into the data.
	 */
	var showAllAgencies = function(){
		drawChart(filteredList, filteredList.length);
	}

	// Initial loading of the chart with default of ANALYSIS_WINDOW_IN_DAYS.
	start(ANALYSIS_WINDOW_IN_DAYS);
}());
