#!/bin/bash

nohup ganache-cli -h "0" -g 0 -d -l 99999999 -d 2>&1 &
echo "starting ganache. Wait for 10 sec. This is hardcoded"
sleep 10
echo "Ganache started, This is also hardcoded"
sh deploy.sh
PORT=8000 nohup npm start 2>&1 &
PORT=8001 nohup npm start 2>&1 &

while true
do
    echo "Press [CTRL+C] to stop.."
    sleep 10
done