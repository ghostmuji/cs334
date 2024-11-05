#!/bin/bash

sudo fuser -k 8000/tcp

cd "/home/student334/cs334/m3" 

python3 server.py &

python3 -m http.server 8000 &

if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

unclutter -idle 0 &

exec chromium-browser --autoplay-policy=no-user-gesture-required --incognito --disable-restore-session-state --enable-logging=stderr --v=1 http://localhost:8000