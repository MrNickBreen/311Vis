# 311Vis
Taking 311 Open data and mapping it

Data: https://data.sfgov.org/City-Infrastructure/Case-Data-from-San-Francisco-311-SF311-/vw6y-z8j6
https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=2000
more info for interacting with socrata API: https://dev.socrata.com/consumers/getting-started.html

Brainstorming Ideas:
- leadboard for the week of closed tickets by department (by percentage or sorted by change from prior week)
- leaderboard of Neighbourhood with most open tickets (by %)
- 'Achievments / badges' for fastest responding department, best close rate, most engaged neighbourhood that reports the most, etc...
- *Use BigML* to predict chance of a ticket being closed, and the biggest factors.
- colour code neighbourhoods with open ticks (coloropleth)
- open tickets preportional to income 
- colour code census tracts (same number of people per area)


Resources:
- SFHip-map repo
  - Neighbourhood geojson
  - cenus tract geojson
  - r script to agregate csv point data
  - 
