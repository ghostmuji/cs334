#!/bin/bash

# Directory where the IP file and configs will be saved
DIR="$HOME/cs334/raspberrypi"
FILE="$DIR/ip.md"
CONFIG_DIR="$HOME/cs334/raspberrypi/config-repo"

# make directory
mkdir -p $DIR
mkdir -p $CONFIG_DIR

# copy IP address to ip.md FILE
IP=$(hostname -I)
echo "Current IP Address: $IP" > $FILE

# copy important config files to config-repo
cp $HOME/.config/wayfire.ini $CONFIG_DIR/wayfire.ini
cp "$HOME/cs334/.scripts/sys-update.sh" $CONFIG_DIR/sys_update.sh

cd $DIR
git add ip.md
git add $CONFIG_DIR
git add ps5-test
git commit -m "Repo retrieved from pi on $(date)"
git push origin main