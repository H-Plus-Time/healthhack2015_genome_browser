#!/usr/bin/python

import MySQLdb
import re
import os
import csv
import sys

def generate_sql_dict_from_csv(naming_csv):
    transactions = []
    with open(naming_csv, 'rb') as f:
        reader = csv.reader(f)
        print "reading headers..."
        header = reader.read()
        for rownum, row in enumerate(reader):
            print "reading data..."
            sql_dict = { "name": "%s" % row[0], "desc": "%s" % row[1], "nib": "/gbdb/%s" % row[0], "organism": "%s" % row[2], "defaultPos": "%s" % row[3], "active": 1, "orderKey": rownum, "genome": "%s" % row[4], "scientificName": "%s" % row[5], "htmlPath": "/gbdb/%s/html/description.html" % row[0], "hgNearOk": 0, "hgPbOk": 0, "sourceName": "%s" % row[6], "taxId": "%s" % row[7] }
            transactions.append(sql_dict)

    return transactions

def execute_sql_queries(transactions):
    # Step 11
    # setting up the MySQL connection
    print "opening database"
    db = MySQLdb.connect(host="localhost", user="root", passwd="browser", db="hgcentral")
    dbcursor = db.cursor()
    return True
    for trans in transactions:
        for x,y in trans.iteritems():
            print "%s: %s" % (x,y)

        dbcursor.execute("""INSERT INTO dbDb (name, description, nibPath, organism, defaultPos, active, orderKey, genome, scientificName, htmlPath, hgNearOk, hgPbOk, sourceName, taxId) VALUES (%(name)s, %(desc)s, %(nib)s, %(organism)s, %(defaultPos)s, %(active)s, %(orderKey)s, %(genome)s, %(scientificName)s, %(htmlPath)s, %(hgNearOk)s, %(hgPbOk)s, %(sourceName)s, %(taxId)s)""", trans)

        print "entered successfully into DBDB"

        dbcursor.execute("""INSERT INTO defaultDb (genome, name) VALUES (%(genome)s, %(name)s)""", trans)
        dbcursor.execute("""INSERT INTO genomeClade (genome, clade, priority) VALUES (%(genome)s, 'insect', 10)""", trans)

    '''
    DELETE FROM `dbDb` where `orderKey` = 1 or `orderKey` =2
    '''

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "usage: build_new_database.py <filename>"
        sys.exit()

    if not os.path.isfile(sys.argv[1]):
        print "%s is not a file" % sys.argv[1]
        print "usage: build_new_database.py <filename>"
        sys.exit()

    transactions = generate_sql_dict_from_csv(sys.argv[1])
    execute_sql_queries(transactions)