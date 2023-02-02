"use strict";

const path = require("path");
const destPath = require("./destPath.js");

const GSTask = require("../Task.class.js");
const GSError = require("../Error.class.js");
const logger = require("../utils/logger.js");

GSTask.addTask(
{
	name: "exportMap",

	description: "Creates the map of files to be included in order.",

	task: (gsTask, map, opts) =>
	{
		const file = destPath(gsTask, "filelist", opts);
		const dir = path.join("/", 
							opts && opts.dir ||
							gsTask.options.copyDest);
		
		if(!file)
		{
			throw new GSError(`The task exportMap requires a map file.`);
		}

		// Adds the map
		gsTask.grunt.file.write(file,
						map.toDependencyList(dir, true),
						{encoding: "utf-8"});
	
		// Logs
		if(gsTask.options.verbose >= 1)
		{
			logger.log(`Map exported to %{lightgreen}${file}%{}`);
		}
	}
});