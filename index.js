"use strict";

// The module only exports the task class
var GSTask = require("./source/Task.class.js");

// Adds all the tasks
const fs = require("fs");
fs.readdirSync("./source/tasks").forEach((file) =>
{
	file = "./source/tasks/" + file;
	if(fs.statSync(file).isFile())
	{
		require(file);
	}
});


// -----> Exports the namespace

module.exports = GSTask;