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
	], connectReady
);

//
// async completion functions
//
function connectReady(err) {
	if (err) throw err;
	async.series([
		createTables
	], done);
}

function done(err) {
	if (err) throw err;
	disconnect();
}

//
// task functions
//

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

// create the tables
function createTables(callback) {
	// callback is the task callback
	// this needs to be called when the 'createTables' task is done
	// this is the case when all the parallel create table tasks are complete
	var tasks = [];
	
	// populate the tasks array 
	db.tables.forEach(function(table){
		// callback2 is used to signal that the individual table creation task is complete
		tasks.push(function(callback2) {
			// need to execute a drop table and create table in series
			// callback3 signals that the drop is done and then that the create is done
			async.series([
				function(callback3){
					dropTable(table);
					callback3();
				},
				function(callback3){
					createTable(table);
					callback3();
				}
			], function(err) {callback2()});
		});
	});
	
	async.parallel(tasks, function(err) {
		// signal that the createTables task is done
		callback(err);
	});
}

// 
// other methods
//

// disconnect from the database when everything is done
function disconnect() {
	debugMsg('*** disconnect');
	db.connection.end(function (err) {
		if (err) throw err;
		debugMsg('disconnected from database');
	});
}

//
// drop a table
//
function dropTable(table) {
	var sql = 'DROP TABLE IF EXISTS ' + table.name;
	debugMsg(sql);
	db.connection.query(sql, function(err){if (err) throw err;});
}

//
// create a table
//
function createTable(table) {
	var sql = 'CREATE TABLE ' + table.name + ' (';
	for (var i = 0; i < table.fields.length; i++) {
		var field = table.fields[i];
		sql += field.name + ' ' + field.type;
		if (field.attributes) {
			sql += ' ';
			for (var j = 0; j < field.attributes.length; j++) {
				sql += field.attributes[j] + ' ';
			}
		}
		if (i < (table.fields.length - 1)) {
			sql += ', ';
		}
	}
	sql += ')';
	debugMsg(sql);
	db.connection.query(sql, function(err){if (err) throw err;});
}

//
// debug utilities
//

function debugMsg(msg) {
	if (debug) {
		var d = new Date();
		var strD = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
		console.log(strD + ', ' + msg);
	}
}