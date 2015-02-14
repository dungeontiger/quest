#!/bin/bash
PORT=80
mongod --shutdown --dbpath=/root/quest/data
mongod --dbpath=/root/quest/data &
npm start