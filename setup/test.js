var async = require('async');

async.parallel([
	task1,
	task2,
], parallelComplete
);

function parallelComplete(err) {
	console.log('parallel done');
	next();
}

function task1(callback) {
	console.log('task 1');
	callback();
}

function task2(callback) {
	console.log('task 2');
	callback();
}

function task3(callback) {
	console.log('task 3');
	callback();
}

function task4(callback) {
	console.log('task 4');
	callback();
}

function next() {
	async.series([
		task3,
		task4
	], function(err) {
		console.log('series done');
	})
}