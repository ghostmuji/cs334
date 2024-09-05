#!/bin/bash

# Directory where the IP file will be saved
DIR="$HOME/cs334/raspberrypi"
FILE="$DIR/ip.md"

# make directory
mkdir -p $DIR

# copy IP address to ip.md FILE
IP=$(hostname -I)
echo "Current IP Address: $IP" > $FILE


cd $DIR
git add ip.md
git commit -m "IP Address retrieved on $(date)"
