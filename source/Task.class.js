"use strict";

const GSError = require("./Error.class.js");
const GSIncluder = require("./Includer.class.js");
const gsOptions = require("./options");
const logger = require("./utils/logger.js");
const readonly = require("./utils/readonly.js");

// ---------- CLASS GSTask ---------- //

class GSTask
{
// ------> GSTask - Public Static Methods

	/**
	* A task function.
	* @callback taskCallback
	* @memberof GSTask
	* @this Object The ``this`` keyword refers to the added task that
	*				uses this callback. It allows to add custom functions
	*				to a task created with {@link GSTask.addTask}.
	* @param {GSTask} task - The gs task.
	* @param {GSIncluder} includer
	* @param {object} options - The options passed to the
	*		{@link GSTask#registerTask} (or {@link GSTask#task})
	*		method.
	*/

	/**
	* Adds a new type of task.
	* @param {object} task - The task data. It can also contain
	*						other functions that are accessible
	*						with ``this`` from the task function.
	* 	@param {string} task.name - The name of the task in the form:
	*						``[a-z][a-zA-Z0-9]*``.
	*	@param {GSTask.taskCallback} [task.task] - The task function.
	*						The ``this`` keyword refers to this added task.
	*	@param {string} [task.description] - The description of the task
	*						passed to grunt.
	* @returns {Function} The constructor of GSTask.
	*/
	static addTask(task = {})
	{
		// Checks the arguments
		const name = task.name,
			  strName = typeof(name) == "string" ? '"' + name + '"' : name;
		
		GSError.openGroup(`GSTask.addTask - Checking (${strName})`);
		
		if( typeof(name) != "string" ||
			!/^[a-z][a-zA-Z0-9]*$/.test(name))
		{
			GSError.throw(`The task name must fit "[a-z][a-zA-Z0-9]*", not ${strName}`);
		}
		else if(GSTask.tasks.hasOwnProperty(name))
		{
			GSError.throw(`The task ${name} already exists.`);
		}

		if(!task.description)
		{
			task.description = `The ${strName} task`;
		}

		if(typeof(task.task) != "function")
		{
			GSError.throw(`The task function is missing`);
		}

		GSError.closeGroup();

		GSTask.tasks[name] = task;

		return GSTask;
	}

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
									{encoding: this.options.encoding}); 
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

// --> Register tasks

	registerTask(name, options)
	{
		const task = GSTask.tasks[name];
		
		if(!task)
		{
			throw new GSError(`The task ${name} does not exists.`);
		}

		const func = task.task, taskFunc = () =>
		{
			return func.call(task, this, this.#includer.map, options);
		};
		
		this.grunt.registerTask(name, task.description, taskFunc);
		
		return name;
	}

	task(name, options)
	{
		return this.registerTask(name, options);
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

// The tasks
readonly(GSTask, "tasks", {});

// ---> Exports the class

module.exports = GSTask;