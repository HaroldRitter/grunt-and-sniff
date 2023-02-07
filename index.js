"use strict";

// The module only exports the task class
var GSTask = require("./source/Task.class.js");

// Adds all the tasks
const fs = require("fs"),
	  path = require("path"),
	  taskPath = path.resolve(__dirname, "./source/tasks");
fs.readdirSync(taskPath).forEach((file) =>
{
	file = `${taskPath}/${file}`;
	if(fs.statSync(file).isFile())
	{
		require(file);
	}
});


// -----> Exports the namespace

module.exports = GSTask;