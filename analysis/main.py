import csv, sys
# NOTE: Remember to run the command "pip install python-dateutil"
from dateutil.parser import parse
from datetime import datetime
# NOTE: Remember to run the command "pip install pytz"
import pytz

# globals
INPUT_FILENAME = "sample311.csv"
OUTPUT_TRAIN = 'train_' + INPUT_FILENAME
FIELDNAMES = ("Closed,CaseID,Opened,Responsible Agency,Category,Request Type,Request Details,Address,Supervisor District,Neighborhood,Point,Source,Media URL").split(",")

def readInputFileCalculateDeltaAndWriteToOutputFile(fileName):
	# open CSV output file and prepare for writing
	output = open(OUTPUT_TRAIN, "w")
	writer = csv.DictWriter(output, FIELDNAMES)
	writer.writeheader()

	#TODO: replace with csv read
	with open(fileName) as csvFile:
		reader = csv.DictReader(csvFile)

		# data rows
		for row in reader:
			# This helps the user know the python script is still running for large datasets
			print row['CaseID']
			if 'Media URL' in row and not row['Media URL'] == None and  len(row['Media URL']) > 0 :
				row['Media URL'] = "yes"
			else:
				row['Media URL'] = "no"

			# calculating number of days to close ticket
			if 'Closed' in row and not row['Closed'] == None:
				closedDateParsed = parse(row['Closed'])
				openDateParsed = parse(row['Opened'])
				delta = closedDateParsed - openDateParsed

				row['Closed'] = round(delta.total_seconds()/60/60)
			# Adding s to supervisor district so bigML will treat it as a category
			row['Supervisor District'] = "s" + row['Supervisor District']
			# These properties are not needed
			row.pop("Status", None)
			row.pop("Updated", None)
			row.pop("Status Notes", None)

			writer.writerow(row)

# Main code:
print "Read file " + INPUT_FILENAME
readInputFileCalculateDeltaAndWriteToOutputFile(INPUT_FILENAME)
