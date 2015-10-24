#!/bin/bash

# This is a automated version of the steps listed here:
# http://genomewiki.ucsc.edu/index.php/Building_a_new_genome_database
# Note that edge cases haven't been tested strongly

# This script will convert a .fa file into something that can be loaded into 
# the enome browser database 

# usage: fa_to_agp.sh <fa-file> <output-name>
# eg: fa_to_agp.sh D_birchii.scafSeq.fill.v1.0.fa droBir1

# Note: this has not been tested against edge cases, and only against the 
# single supplied .fa file

# Handle failures from components that aren't the last component of a pipeline.
set -o pipefail

error()
{
  echo "$0: $@" >&2
  exit 1
}

echo "total $#"

if [ $# != 2 ]; then
    echo "Usage: $0 <fa-file> <output-name>";
    echo "";
    echo "eg: fa_to_agp.sh D_birchii.scafSeq.fill.v1.0.fa droBir1"
    echo "";
    echo "Not enough parameters"	    
    echo "";
    exit 1;
fi >&2

if [ ! -f $1 ]; then
    echo "Usage: $0 <fa-file> <output-name>";
    echo "";
    echo "eg: fa_to_agp.sh D_birchii.scafSeq.fill.v1.0.fa droBir1"
    echo "";
    echo "First parameter isn't a file"	    
    echo "";
    exit 1;
fi  >&2

FA_FILE="$1"   # eg D_birchii.scafSeq.fill.v1.0.fa
BASE_NAME="$2" # eg droBir1
AGP_FILE="$2".agp
TWO_BIT_FILE="$2".2bit

GB_SOURCE=/home/ubuntu/src/gb

# Step 2

if [ ! -f $AGP_FILE ]; then
    echo "Creating the AGP file..."
    hgFakeAgp -minContigGap=1 $FA_FILE $AGP_FILE || error "error converting to AGP"
fi

# Step 3 

if [ ! -f $TWO_BIT_FILE ]; then
    echo "Creating the 2bit file..."
    faToTwoBit $FA_FILE $TWO_BIT_FILE || error "error converting to two bit"
else TB_EXISTS=1
fi

if [ ! -d /gbdb/$BASE_NAME ]; then
    echo "Creating folders for db..."
    mkdir /gbdb/$BASE_NAME
else echo "/gbdb/$BASE_NAME already exists"
fi
if [ ! -d /gbdb/$BASE_NAME/html ]; then
    echo "Creating folders for db..."
    mkdir /gbdb/$BASE_NAME/html
else echo "/gbdb/$BASE_NAME/html already exists"
fi

echo "Creating a symlink from local files to db folder structure..."

cp "$PWD"/$TWO_BIT_FILE /gbdb/$BASE_NAME/$TWO_BIT_FILE

# Step 4

echo "Checking the agp and fa file are the same..." 
sleep 2

if [[ ! $TB_EXISTS ]]; then 
    checkAgpAndFa $AGP_FILE $FA_FILE || error "failed AGP/FA check"
fi

# Step 5

echo ""
echo "Creating the chromInfo file..."

twoBitInfo $TWO_BIT_FILE stdout | sort -k2nr > chrom.sizes || error "failed to create chromInfo file"

if [[ ! -d bed ]] || [[ ! -d bed/chromInfo ]]; then
    echo "Creating chromInfo folder..."
    mkdir -p bed/chromInfo
fi

echo "Adding $1 to the end of the chromInfo.tab file..."

TW_PATH=/gbdb/$BASE_NAME/$TWO_BIT_FILE

awk -v VAR=${TW_PATH} '{printf "%s\t%d\t%s\n",$1,$2, VAR}' chrom.sizes > bed/chromInfo/chromInfo.tab || error "failed to generate chromInfo.tab"

# Step 6

echo "Creating the $BASE_NAME database..."

hgsql -e "create database $BASE_NAME ;" mysql || error "Failed to create database"

# Step 6.1 Not in original HOWTO

echo "Granting the readonly db user access to the new database"

hgsql -e "GRANT SELECT, CREATE TEMPORARY TABLES on ${BASE_NAME}.* TO readonly@localhost IDENTIFIED BY 'access';" mysql || error "Failed to grant DB permissions"

# Step 7

echo "Adding the GRP table to the $BASE_NAME database..."

hgsql $BASE_NAME < $GB_SOURCE/kent/src/hg/lib/grp.sql || error "Failed to add GRP table"

# Step 8
 
echo "Loading $BASE_NAME chromInfo into database..."

hgLoadSqlTab $BASE_NAME chromInfo $GB_SOURCE/kent/src/hg/lib/chromInfo.sql bed/chromInfo/chromInfo.tab || error "Failed to add GRP table"

# Step 9

echo "Loading the $BASE_NAME gold and gap tables..."

hgGoldGapGl $BASE_NAME $AGP_FILE

# Step 10

if [[ ! -d bed ]] || [[ ! -d bed/gc5Base ]]; then
    echo "Creating gc5Base folder..."
    mkdir -p bed/gc5Base
fi

echo "Generating gc5Base data..."

wigEncode <(hgGcPercent -wigOut -doGaps -file=stdout -win=5 -verbose=0 $BASE_NAME $TWO_BIT_FILE) bed/gc5Base/gc5Base.{wig,wib} || error "failed to encode wig"

hgLoadWiggle -pathPrefix=/gbdb/$BASE_NAME/wig $BASE_NAME gc5Base bed/gc5Base/gc5Base.wig || error "failed to load wiggle"

if [[ ! -d /gbdb/$BASE_NAME/wib ]]; then
    echo "Creating wib folder..."
    mkdir -p /gbdb/$BASE_NAME/wib
fi
 
cp "$PWD"/bed/gc5Base/gc5Base.wib /gbdb/$BASE_NAME/wib


echo "Zipping original file, putting into /gbdb/ for backup"
gzip -c $FA_FILE > "$FA_FILE".gz
mv "$FA_FILE".gz /gbdb/$BASE_NAME/ 

echo "Cleaning up transitional files"
echo "Removing original file"
rm $FA_FILE
echo "Removing bed files"
#rm -rf /bed/
echo "Removing chrom.size, wiggle.tab"
rm chrom.sizes
rm wiggle.tab
echo "Removing the agp and 2bit files"
rm "$AGP_FILE"
rm "$TWO_BIT_FILE"

echo "returning to the main script to build SQL statements"

# Exeunt
exit 1
