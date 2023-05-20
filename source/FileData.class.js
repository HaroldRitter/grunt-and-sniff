"use strict";

const path = require("path");

const GSError = require("./Error.class");
const GSIncType = require("./IncType.enum");
const logger = require("./utils/logger");

class GSFileData
{
// ------> GSFileData - Constructor

	constructor(includer, filePath, parent, incType)
	{
		// GSIncluder also needs GSFileData
		const GSIncluder = require("./Includer.class");

		// Sets the includer
		if(!includer || !(includer instanceof GSIncluder))
		{
			throw new GSError("GSFileData requires a GSIncluder parent");
		}
		this.#includer = includer;

		// Gets all required paths
		var fullPath = includer.path(filePath, parent && parent.dir || ""),
			srcPathLen = includer.sourceDir.length + process.cwd().length + 2,
			file = fullPath.substring(srcPathLen),
			cwdFile = fullPath.substring(process.cwd().length + 1);
		const config = this.#includer.grunt.config.get(); 

		Object.assign(this,
		{
			passedPath: filePath,
			path: file,
			cwdPath: cwdFile,
			absPath: fullPath,
			dir: path.dirname(file),
			dirPath: path.dirname(fullPath),
			sourceDir: includer.sourceDir,
			position: GSIncType.toString(incType),
			parent: parent && parent.path,

			grunt: includer.grunt,
			pkg: config.pkg,
			config: config,
			options: includer.options,

			tplOpen: "<%",
			$: includer.options.$,
			args: {},
			output: {}
		});

		this.#bindIncludeFunctions();
	}

// ------> GSFileData - Public Getters

	get inserted()
	{
		return this.#includer.inserted;
	}

// ------> GSFileData - Public Methods

	debug(msg)
	{
		if(this.options.verbose >= 1)
		{
			logger.warn("%{bold; lightorange}[GS] " + 
				"%{lightpink}DEBUG%{} " +
				`(%{lightblue; italic}${this.path}%{}): ${msg}`);
		}
	}

	/**
	* The template context allows to return the output of
	* a template.
	* @param {Function} cb 
	* @param {object} [args] - An object that passes variables
	*				to the callback in the ``args`` variable.
	*				The callback must not declare the ``args``
	*				argument.
	* @returns {string}
	*/
	tplContext(cb, args = null)
	{
		this.args = args || {};
		const str = "<%" + cb.toString()
					.replace(/^(?:function\s*)?\([^\)]*\)\s*(?:=>)\s*\{?/, "")
					.replace(/\}$/, "") + "%>";
		const res = this.grunt.template.process(str, {data: this});
		delete this.args;
		return res;
	}

// --> Include methods

	include(filePath, args = null, output = null)
	{
		return this.#includer.include(	filePath, undefined,
										GSIncType.BEFORE,
										args, output);
	}

	includeAfter(filePath, args = null)
	{
		return this.#includer.include(	filePath, undefined,
										GSIncType.AFTER, args);
	}

	includeLater(filePath, args = null)
	{
		return this.#includer.include(	filePath, undefined,
										GSIncType.LATER, args);
	}

	insert(filePath, args = null, output = null)
	{ 
		return this.#includer.include(	filePath, undefined,
										GSIncType.INSERT,
										args, output);
	}

	insertOnce(filePath, args = null, output = null)
	{ 
		return this.#includer.include(	filePath, undefined,
										GSIncType.INSERT_ONCE,
										args, output);
	}

// ------> GSFileData - Private Attribute

	#includer = null;

// ------> GSFileData - Private Methods

	#bindIncludeFunctions()
	{
		this.include = this.include.bind(this);
		this.includeAfter = this.includeAfter.bind(this);
		this.includeLater = this.includeLater.bind(this);
		this.insert = this.insert.bind(this);
		this.insertOnce = this.insertOnce.bind(this);

		return this;
	}
}

// ---> Exports the class

module.exports = GSFileData;