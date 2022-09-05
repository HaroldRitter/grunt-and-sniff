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
		var fullPath = GSIncluder.path(filePath, parent && parent.dir || ""),
			srcPathLen = includer.sourceDir.length + process.cwd().length + 2,
			file = fullPath.substring(srcPathLen),
			cwdFile = fullPath.substring(process.cwd().length + 1);
		
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

			pkg: null,
			config: null,

			tplOpen: "<%",
			$: includer.global,
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
		logger.warn("%{bold; lightorange}[GS] %{lightpink}DEBUG:%{} %s", msg);
	}

// --> Include methods

	include(filePath)
	{
		return this.#includer.include(	filePath, undefined,
										GSIncType.BEFORE);
	}

	includeAfter(filePath)
	{
		return this.#includer.include(	filePath, undefined,
										GSIncType.AFTER);
	}

	includeLater(filePath)
	{
		return this.#includer.include(	filePath, undefined,
										GSIncType.LATER);
	}

	insert(filePath)
	{ 
		return this.#includer.include(	filePath, undefined,
										GSIncType.INSERT);
	}

	insertOnce(filePath)
	{ 
		return this.#includer.include(	filePath, undefined,
										GSIncType.INSERT_AND_CACHE);
	}

// ------> GSFileData - Public Methods for the includer

	// The data sleep and remove the unused properties
	// The grunt config is always reload in case it was modified.
	sleep(includer)
	{
		if(this.includer !== includer)
		{
			throw new GSError("Call of GSFileData.sleep not allowed");
		}

		// Removes the config an package
		this.config = null;
		this.pkg = null;
		
		return this;
	}

	// The grunt config is always reload in case it was modified.
	awake(includer)
	{
		if(this.includer !== includer)
		{
			throw new GSError("Call of GSFileData.awake not allowed");
		}

		// Gets needed data
		this.config = this.#includer.grunt.config.get();
		this.pkg = this.config.pkg;

		return this;
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