"use strict";

const path = require("path");

const GSTask = require("../Task.class.js");
const GSError = require("../Error.class.js");
const logger = require("../utils/logger.js");

GSTask.addTask(
{
	name: "exportMap",

	description: "Creates the map of files to be included in order.",

	task: (gsTask, includer, opts) =>
	{
		const map = includer.map;
		const file = opts && opts.dest || this.defaultMapPath(gsTask);
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
	},

	defaultMapPath: (gsTask) =>
	{
		const copyDest = gsTask.options.copyDest;
		const pkg = gsTask.grunt.config.get("pkg").name.toLowerCase();
		const file = pkg + ".filelist";

		return copyDest ? 	path.join(copyDest,
									"/", file) :
							path.join("/", file);
	}
});