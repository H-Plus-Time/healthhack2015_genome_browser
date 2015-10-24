#!/usr/bin/python

import MySQLdb
import re
import os
import csv
import sys

if len(sys.argv) != 2:
    print "usage: build_new_database.py <filename>"
    sys.exit()

if not os.path.isfile(sys.argv[1]):
    print "%s is not a file" % sys.argv[1]
    print "usage: build_new_database.py <filename>"
    sys.exit()

# Step 11
# setting up the MySQL connection
print "opening database"
db = MySQLdb.connect(host="localhost", user="root", passwd="browser", db="hgcentral")
dbcursor = db.cursor()

f = open(sys.argv[1], 'rb')
try:
    reader = csv.reader(f)
    rownum = 0
    for row in reader:
        if rownum == 0:
            print "reading headers..."
            header = row
        else:
            print "reading data..."
            sql_dict = { "name": "%s" % row[0], "desc": "%s" % row[1], "nib": "/gbdb/%s" % row[0], "organism": "%s" % row[2], "defaultPos": "%s" % row[3], "active": 1, "orderKey": rownum, "genome": "%s" % row[4], "scientificName": "%s" % row[5], "htmlPath": "/gbdb/%s/html/description.html" % row[0], "hgNearOk": 0, "hgPbOk": 0, "sourceName": "%s" % row[6], "taxId": "%s" % row[7] }

            print sql_dict

            for x,y in sql_dict.iteritems():
                print "%s: %s" % (x,y)

            dbcursor.execute("""INSERT INTO dbDb (name, description, nibPath, organism, defaultPos, active, orderKey, genome, scientificName, htmlPath, hgNearOk, hgPbOk, sourceName, taxId) VALUES (%(name)s, %(desc)s, %(nib)s, %(organism)s, %(defaultPos)s, %(active)s, %(orderKey)s, %(genome)s, %(scientificName)s, %(htmlPath)s, %(hgNearOk)s, %(hgPbOk)s, %(sourceName)s, %(taxId)s)""", sql_dict)

            print "entered successfully into DBDB"

            dbcursor.execute("""INSERT INTO defaultDb (genome, name) VALUES (%(genome)s, %(name)s)""", sql_dict)
            dbcursor.execute("""INSERT INTO genomeClade (genome, clade, priority) VALUES (%(genome)s, 'insect', 10)""", sql_dict)

        rownum += 1

finally:
    f.close()

'''
DELETE FROM `dbDb` where `orderKey` = 1 or `orderKey` =2
'''
