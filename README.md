# 311Vis
Taking 311 Open data and vizualizing it in a leaderboard.

## Live Demo
http://rawgit.com/MrNickBreen/311Vis/master/scrap/index.html


## Run locally
*HTML Leaderboard*
cd into scripts folder
python -m SimpleHTTPServer

*Python script to make CSV training data set for BigML*
cd into analysis folder
pip install python-dateutil
pip install pytz
python main.py
(notice that train_sample311.csv is created)

## Bonus commands for dev console:
- see all entries, but keep filter of min size: `drawChart(filteredList, filteredList.length)`
- see all entries: `drawChart(comparisonList, comparisonList.length)`
- adjust timespan to 16 days: `start(16);`


## Resources
- Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6
- Sample API call: https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000
- Data Sample in Sheet: https://docs.google.com/spreadsheets/d/1yGd2B7F8mlDg64L-uL3Byuxfxn1irl4ZLd0vETaq2GU/edit#gid=1562030977
- Socrata API docs: https://dev.socrata.com/consumers/getting-started.html

## Brainstorming Ideas:
- leadboard for the week of closed tickets by department (by percentage or sorted by change from prior week)
  - After looking at the data, suggested we filter to agencies with >40 tickets this week.
- leaderboard of Neighbourhood with most open tickets (by %)
- 'Achievments / badges' for fastest responding department, best close rate, most engaged neighbourhood that reports the most, etc...
- *Use BigML* to predict chance of a ticket being closed, and the biggest factors.
- colour code neighbourhoods with open ticks (coloropleth)
- open tickets preportional to income
- colour code census tracts (same number of people per area)


## Misc.
- SFHip-map repo
  - Neighbourhood geojson
  - cenus tract geojson
  - r script to agregate csv point data
  -
