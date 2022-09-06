"use strict";

const GSIncluder = require("./Includer.class.js");
const gsOptions = require("./options");
const logger = require("./utils/logger.js");
const readonly = require("./utils/readonly.js");

// ---------- CLASS GSTask ---------- //

class GSTask
{
// ------> GSTask - Constructor

	// (grunt, sourceDir, options)
	// or (grunt, options) with sourceDir in options
	constructor(grunt, sourceDir, options)
	{
		// Resets the arguments
		if(typeof(sourceDir) == "object")
		{
			options = sourceDir;
			sourceDir = options && options.sourceDir;
		}
		options = gsOptions.options(options);

		// Public attributes
		readonly(this,
		{
			grunt: grunt,
			options: options,
			sourceDir: sourceDir
		});
		
		// Creates the private includer
		this.#includer = new GSIncluder(grunt, 
										sourceDir,
										options);
		
		// Binds the process function to this
		this.process = this.process.bind(this);
	}

// ------> GSTask - Public Methods

	// Processes in a file in the grunt-contrib-concat plugin
	// process(src, filePath)
	// process(filePath)
	process(src, filePath)
	{
		// Checks argument
		if(filePath === undefined)
		{
			filePath = src;
			src = this.grunt.file.read(filePath,
									{encoding: "utf-8"}); 
		}

		// Process
		var inc = this.#includer;
		if(	this.options.verbose >= 1 &&
			inc.inserted === 0)
		{
			logger.info("Uses %{lightorange}Grunt and Sniff%{}");
		}
		return inc.include(filePath, src);
	}

// ------> GSTask - Private Attributes

	#includer = null;
}

// ------> GSTask - Public Static Constants (Info)

// Retrieves the package to get the version
var pkg = require("../package.json");

// The gs (Grunt and Sniff) namespace
readonly(GSTask,
{
	moduleName: pkg.name,
	name: "Grunt and Sniff",
	version: pkg.version
});

// ---> Exports the class

module.exports = GSTask;