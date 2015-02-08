console.log('Initializing Quest Tree database...');
var debug  = true;
var fs = require('fs');
var mysql = require('mysql');
var async = require('async');
var db = {};

db.name = 'quest_tree';
db.tables = [];

// kick off first set of tasks that can be run in parallel
debugMsg('*** start parallel');
async.parallel([
	connect,
	loadTableDefinitions
	]
, function(err, results) {next()});

function next() {
	debugMsg('*** next');
	async.series([
		createTables,
		disconnect
	], debugMsg('*** series next finished'));
}

// create the tables
function createTables() {
	debugMsg('*** createTables');
	var tasks = [];
	db.tables.forEach(function(table){
		var dropSQL = 'DROP TABLE IF EXISTS ' + table.name;
		tasks.push(function(){
			// in series, need to drop the table and create the table
			async.series([
					db.connection.query(dropSQL, function(err, rows, fields){
						debugMsg('*** drop table done');
						createTableHandler(null);
					}),
					function(createTableHandler) {
						debugMsg('Create table ' + table.name);
						createTableHandler(null);
					}
				]
			);
		});
	});
	async.parallel(tasks, createTableHandler(null, 'parallel'));
}

// disconnect from the database when everything is done
function disconnect() {
	debugMsg('*** disconnect');
	db.connection.end(function (err) {
		if (err) throw err;
		debugMsg('disconnected from database');
	});
}

// connect to the database and set the global connection object
function connect(callback) {
	debugMsg('*** connect');
	fs.readFile('connection.json', function(err, data) {
		var connStr = JSON.parse(data);
		db.connection = mysql.createConnection(connStr);
		db.connection.connect(function (err) {
			if (err) {
				callback(err);
				return;
			}
			debugMsg('connected ' + db.connection.threadId);
			callback();
		});
	});
}

// load the JSON definitions of the tables and set in the global object
function loadTableDefinitions(callback) {
	debugMsg('*** loadTableDefinitions');
	var files = fs.readdirSync('.');
	files.forEach(function(file) {
		if (file.indexOf('table') == 0) {
			debugMsg('Found ' + file);
			db.tables.push(JSON.parse(fs.readFileSync(file)));
		}
	});
	callback();
}

function createTableHandler(err, results) {
	if (results) {
		debugMsg('*** createHandler ' + results);
	} else {
		debugMsg('*** createTableHandler');
	}
	if (err) throw err;
}

function debugMsg(msg) {
	if (debug) {
		var d = new Date();
		var strD = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
		console.log(strD + ', ' + msg);
	}
}