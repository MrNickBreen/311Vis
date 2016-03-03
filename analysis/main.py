import csv, sys
from dateutil.parser import parse
from datetime import datetime
import pytz


INPUT_FILENAME = "all311.csv"
OUTPUT_TRAIN = 'train_' + INPUT_FILENAME
FIELDNAMES = ("Closed,CaseID,Opened,Responsible Agency,Category,Request Type,Request Details,Address,Supervisor District,Neighborhood,Point,Source,Media URL").split(",")

#deleted status, Updated,Status Notes

def readFile(fileName):
	output = open(OUTPUT_TRAIN, "w")
	writer = csv.DictWriter(output, FIELDNAMES) #trying without fieldsnames.
	writer.writeheader()

	#TODO: replace with csv read
	with open(fileName) as csvFile:
		reader = csv.DictReader(csvFile)

		# data rows  
		for row in reader:
			print "."
			if 'Media URL' in row and not row['Media URL'] == None and  len(row['Media URL']) > 0 :
				row['Media URL'] = "yes"
			else:
				row['Media URL'] = "no"


			if 'Closed' in row and not row['Closed'] == None:
				closedDateParsed = parse(row['Closed'])
				openDateParsed = parse(row['Opened'])
				delta = closedDateParsed - openDateParsed
 
				row['Closed'] = round(delta.total_seconds()/60/60)
			
			row['Supervisor District'] = "s" + row['Supervisor District']
			row.pop("Status", None)
			row.pop("Updated", None)
			row.pop("Status Notes", None)

			writer.writerow(row)		

# Main code:
print "Read file " + INPUT_FILENAME
readFile(INPUT_FILENAME)
