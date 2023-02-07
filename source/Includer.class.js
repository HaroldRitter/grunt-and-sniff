"use strict";

// Modules
const path = require("path");
const fs = require("fs");

// grunt-and-sniff
const GSFileData = require("./FileData.class");
const GSCache = require("./Cache.class");
const GSFileBranch = require("./FileBranch.class");
const GSMap = require("./Map.class");
const gsOptions = require("./options");
const GSIncType = require("./IncType.enum");
const GSError = require("./Error.class");

const regexp = require("./include.regexp");
const logger = require("./utils/logger");

// ---------- CLASS GSIncluder ---------- //

class GSIncluder
{
// ------> GSIncluder - Public Static Methods

	// Takes the path passed to an inclusion statement
	// and returns the absolute path, or the path relative
	// to the source directory if rel is true.
	static path(filePath/*:String*/, parentDir/*:String*/, rel/*:Boolean*/)
	{
		return filePath[0] == "\\" || filePath[0] == "/" ?
						rel ?
							path.join("", filePath).substring(1) :
							path.join(process.cwd(), this.sourceDir, filePath) :
						parentDir ? path.join(parentDir, filePath) :
									path.join(process.cwd(), filePath);
	}

// ------> GSIncluder - Public Attribute

	// grunt: Object
	grunt;
	// options: GSOptions
	options;
	// sourceDir: String
	sourceDir;
	// map: GSMap
	map = new GSMap();

// ------> GSIncluder - Constructor

    constructor(grunt, sourceDir/*:String*/, options/*:GSOptions*/)
	{
		this.grunt = grunt;
		this.options = options || gsOptions.options();
		this.sourceDir = sourceDir;
	}

// ------> GSIncluder - Public Getters

	get inserted()
	{
		return this.#inserted;
	}

// ------> GSIncluder - Public Methods

// --> The big inclusion function

	include(filePath, src, includeType)
	{
		// Sets the default value of includeType to BEFORE
		includeType = GSIncType.get(includeType);

		// Process the inclusion
		var original = src === undefined, bData,
			opts = this.options,
			currentFile = this.#stack.getCurrentFile(),
			// Builds all data passed to the template
			data = this.#completeFileData(filePath, includeType);

		// Checks the self inclusion
		if((currentFile && currentFile.path) === data.path)
		{
			throw new GSError(`The file ${filePath} is included/inserted in itself.`);
		}

		// If the file was already included: returns an empty source
		var inList = this.#cache.contains(data);
		if( inList && 
			(includeType == GSIncType.BEFORE ||
			includeType == GSIncType.LATER ||
			includeType == GSIncType.INSERT_ONCE))
		{
			return "";
		}

		// Does not mark a file two times as "later"
		if(includeType == GSIncType.LATER && this.#inLater(data.absPath))
		{
			return "";
		}

		// Cannot read anything out of the project directory
		if(data.absPath.indexOf(process.cwd()) !== 0)
		{
			throw new GSError("Cannot read a file out of the project folder. %s %s", 
							"Absolute path:", data.absPath);
		}

		// Pushes the file in the stack
		this.#stack.push(data);

		// Adds the file path to the cache
		// This operation is not done for the LATER/AFTER files
		// because their real inclusions are decayed. Plus
		// the LATER files could be included BEFORE in other files
		// and this has the priority.
		if( includeType == GSIncType.BEFORE || 
			includeType == GSIncType.INSERT_ONCE ||
			!inList && includeType == GSIncType.INSERT)
		{
			this.#cancelFromLater(data);
			this.#cache.push(data);
		}
		
		try
		{
			// Gets the source from the path if nothing was provided
			if(original)
			{
				src = fs.readFileSync(data.absPath,
									{encoding: this.options.encoding});
			}

			// Preprocessor
			src = this.#process(opts.preprocess, src, data);

			// --> Rebuilds the source (1):
			//	- Removes the "use strict" statements if options.removeSourceUseStrict is true
			var removeUS = opts.removeSourceUseStrict;

			//	- Replace all require statements with the include/insert function in the template.
			src = this.replaceRequires(src, opts.replaceAllRequires);
			
			// Processor
			src = this.#process(opts.process, src, data);

			// --> Rebuilds the source (2): puts the includes at the top + writes header & footer

			// Cuts the "use strict" statement
			bData = this.rebuildFile(data, src, removeUS, includeType);
		}
		catch(e)
		{
			throw this.#getInclusionError(data, e);
		}

		// Starts the file
		var mapFile = this.#startFile(data);
		if(includeType == GSIncType.LATER || includeType == GSIncType.AFTER)
		{
			var parent = this.#stack.getNonInsertedParent();
			this.#endFile(true);
			var fileList = includeType == GSIncType.LATER ? this.#later :
															  parent.after;
			fileList.push({	mapFile: mapFile,
							fileData: data,
							buildData: bData});
			return "";
		}

		return this.#finalizeInclusion(data, bData);
	}

// --> File Handling

	// Rebuilds the source of a file
	rebuildFile(file, src, removeUS, includeType)
	{
		var data = {}, opts = this.options;
		
		// Cuts the "use strict" statement
		var us = this.#cutUseStrict(src, removeUS);
		src = us.source;
		data.displayedUseStrict = us.displayedUseStrict;
		data.useStrict = us.useStrict;
		
		// Separates comments and includes at the start of the file
		var incs = this.#separateCommentsAndIncludes(file, src);
		data.includes = incs.includes;
		data.comments = incs.comments;

		// Cuts the comments + includes at the start of the source
		src = incs.src;

		// Gets the separator
		data.separator = this.#getSurrounder("s", opts.separator, file, includeType);;

		// Gets the header
		data.header = this.#getSurrounder("h", opts.header, file, includeType);
		
		// Gets the footer
		data.footer = this.#getSurrounder("f", opts.footer, file, includeType);

		// Rebuilds the source:
		// includes + "use strict" + header + comments + source + footer
		data.source = 	data.includes.join("") +
						data.displayedUseStrict +
						data.comments.join("") + src;

		return data;
	}

	replaceRequires(src, replaceAll, cb)
	{
		// Arguments
		if(typeof(replaceAll) == "function")
		{
			cb = replaceAll;
			replaceAll = undefined;
		}
		if(replaceAll == undefined)
		{
			replaceAll = this.options["replaceAllRequires"];
		}
		
		// Replaces all the requires
		src = GSIncluder.#replaceRequire(src, "insert");
		src = GSIncluder.#replaceRequire(src, "insertOnce");
		src = GSIncluder.#replaceRequire(src, "before", "include");
		src = GSIncluder.#replaceRequire(src, "after", "includeAfter");
		src = GSIncluder.#replaceRequire(src, "later", "includeLater");

		return replaceAll ? src.replace(regexp.require.all, 
								"$<separator><%=include($<require>)%>") :
							src;
	}

// ------> GSIncluder - Private Static Methods

	static #replaceRequire(src, type, repType)
	{
		const rep = "$<separator><%=" + (repType || type) +
					"($<quote>$<url>$<quote>)%>";
		return src.replace(regexp.require[type], rep);
	}

// ------> GSIncluder - Private Attributes

	// Contains the paths of the filed that was already included
	// or inserted (once)
	#cache = new GSCache();

	// The current branch of the source file inclusion. The first 
	// element is the root where every source files are stored.
	#stack = new GSFileBranch();

	// The files that are included after the root file
	// is writen, decalred at the end of the file
	// or explicitely with require("later:...")
	// or <%=includeLater("...")%>
	#later = [];

	// Number of inserted files
	#inserted = 0;

// ------> GSIncluder - Private Methods

// --> File Data

	// The file path is computed related to the last file
	// who included the current one.
	// This function cannot be called after the file is started.
	#completeFileData(filePath, includeType)
	{
		// Builds the FileData
		var parent = this.#stack.getCurrentFile(),
			data = new GSFileData(this, filePath, parent, includeType);
		
		// Checks the correct usage of #completeFileData
		if(parent && parent.path === data.path)
		{
			throw new GSError(`The file ${filePath} is included/inserted in itself or:` +
					` [Internal error: GSIncluder.#completeFileData called after a file ` +
					`was pushed in the stack] `);
		}
		
		return data; 
	}

// ---> Files reading process

	// Adds the file to the GSMap and to the GS stack
	#startFile(fileData)
	{
		var mapFile = this.map.addFile(fileData);
		this.#stack.getCurrentFile().ready = true;
		return mapFile;
	}
	
	#startLaterFile(fileData, mapFile)
	{
		this.map.addFile(mapFile);
		this.#stack.push(fileData, true);
		return this;
	}

	#endFile(notWritten)
	{
		var p = this.#stack.pop(), later = "";
		var mapFile = this.map.endFile(notWritten);
		var after = p ? this.#includeLaterFiles(p.after) : "";
		if(mapFile.isRoot())
		{
			later = this.#includeLaterFiles();
		}
		return {file: p, mapFile: mapFile,
				afterSrc: after, laterSrc: later};
	}

// ---> Inclusion steps

	// Returns the header or footer to be inserted in the source before
	// it is processed by the grunt template system.
	#getSurrounder(flag, surrounder, fileData, includeType)
	{
		// No surrounder (insert and no flag)
		const insFlags = this.options.insertSurrounder.toLowerCase();
		if(!surrounder ||
			(includeType == GSIncType.INSERT ||
			includeType == GSIncType.INSERT_ONCE) &&
			insFlags.indexOf(flag) == -1)
		{
			return "";
		}

		// Gets the separator
		var str = typeof(surrounder) == "function" ?
						surrounder(fileData) : surrounder;
		return this.#templateProcess(str, fileData);
	}

	#cutUseStrict(src, removeUS)
	{
		// First removes the "use strict":
		var us = src.match(regexp.useStrict) || "", id = 0;
		if(us)
		{
			us = us[0];
			id = us.length;
			
			// Cuts the "use strict"
			src = src.substr(id);
		}
		
		return {displayedUseStrict: removeUS ? "" : us,
				useStrict: us, source: src};
	}

	#separateCommentsAndIncludes(file, src)
	{
		var found = false, lastId, res, res2, isLater = false,
			comments = [], includes = [],
			src2 = "", g, lastSrcId = 0;
		
		// Separates comments and includes at the start of the file
		regexp.includes.lastIndex = 0;
		while(res = regexp.includes.exec(src))
		{
			g = res.groups;
			if(!found)
			{
				found = true;
				if(res.index > 0)
				{
					isLater = true;
				}
			}
			else if(res.index > lastId)
			{
				isLater = true;
			}
			
			if(isLater)
			{
				src2 += src.substring(lastSrcId, res.index) +
						g.comments +
						g.include.replace(/=\s*include\s*\(/g, "=includeLater(");
				lastSrcId = regexp.includes.lastIndex;
			}
			else
			{
				lastId = regexp.includes.lastIndex;

				if(!g.incType)
				{
					comments.push(g.comments);
					includes.push(g.include);
				}
			}
		}

		src2 += src.substring(lastSrcId);

		return {comments: comments,
				includes: includes,
				src: src2.substr(lastId),
				index: lastId};
	}

// ---> Process inclusion

	// Launches a process callback if it was defined
	#process(func, src, data)
	{
		return typeof(func) == "function" ?
					func(src, data, this.options) : src;
	}

	#templateProcess(source, fileData)
	{
		return logger.gruntWarnModifier(this.grunt,
				(e) => `[Template: ${fileData.cwdPath}]\n${e.message}`,
				() => this.grunt.template.process(source, {data: fileData}));
	}

	// Finalizes the inclusion of a file.
	//
	// 1. The method processes the template of the file
	// and executes the post processor (postprocess option).
	//
	// 2. Then, if the copyDest options is supplied, it builds
	// the appropriate file data by adding the "use strict"
	// if needed, and launch the copy processor (copyprocess option)
	// on the result. The final result is saved to the proper file.
	//
	// 3. Then, if builds the destination for the concatenated file:
	// 	  <files-before> <separator> <header> <built-file> <footer>
	// 	  <files-after> (<files-later> /* if root */)
	// The destination is either returned if this is the root file,
	// or an after/later one, or it is saved in the cache of the
	// parent file. In the last case, an empty string is
	// returned.
	#finalizeInclusion(fileData, buildData)
	{
		// Declares the error that is caught to throw it after the file is closed
		var error, opts = this.options;

		// Checks the correct usage of the _finalizeInclusion method 
		if(fileData.path !== this.#stack.getCurrentReadyFile().path)
		{
			throw new GSError("GSIncluder#_finalizeInclusion called on a file which was not ready.");
		}
		
		try
		{
			// Computes the template of the source file
			var dest = this.#templateProcess(buildData.source, fileData);

			// Increments the number of insertions/inclusions
			this.#inserted++;

			// Postprocessor
			dest = this.#process(opts.postprocess, dest, fileData);
		}
		catch(e)
		{
			error = this.#getInclusionError(fileData, e);
		}

		// Gets the started file and its parent before it is closed
		var current = this.#stack.getCurrentFile(),
			isRootFile = this.#stack.isRootFile(),
			parent = this.#stack.getNonInsertedParent();
		
		// Closes the started file
		var closure = this.#endFile();

		// If an error occured: throws it
		if(error)
		{
			throw error;
		}

		// Gets the separator if required
		var sep = this.#inserted > 1 ? buildData.separator : "";
		var before = current.before.join("");
		
		// Copies the file if necessary:
		// <use-strict> <built-file>
		if(opts.copyDest)
		{
			// Adds the "use strict" statement
			var us = buildData.useStrict ? buildData.useStrict : 
						opts.forceDestUseStrict ?
							/^\s*\r?\n/.test(dest) ? '"use strict";' :
								'"use strict";\n' : 
							"";
			var copyDest = us + dest;
			
			// Executes the optional copy processor
			copyDest = this.#process(opts.copyprocess,
									copyDest, fileData);
			
			// Saves the file
			var filePath = path.resolve(opts.copyDest, fileData.path);
			this.grunt.file.write(filePath, copyDest,
								{encoding: this.options.encoding});
		}

		// Retrieves the number of line feeds that are used
		// in the inclusion at the start of the file
		var ln = 0;
		buildData.includes.forEach(function(inc)
		{
			var i = -1;
			while((i = inc.indexOf("\n", i + 1)) > -1)
			{
				ln++;
			}
		});
		
		// Removes the line feeds left by the inclusions
		// at the start of the file
		var lnRegExp = new RegExp("^(?:\\s*\\r?\\n){" + ln + "}");
		dest = ln ? dest.replace(lnRegExp, "") : dest;

		// Removes heading and leading white spaces and CR/LN
		if(opts.trimmed)
		{
			dest = dest.trim();
		}

		// Builds the final destination string for the concatened file:
		// <files-before> <separator> <header> <built-file> <footer>
		// <files-after> (<files-later> /* if root */)
		var finalDest = buildData.header +
						dest + buildData.footer +
						closure.afterSrc + closure.laterSrc;
		
		if(opts.trimmed)
		{
			finalDest = finalDest.trim();
		}

		finalDest = before + sep + finalDest; 

		// Logs the included file
		this.#logIncluded(fileData);

		// If the file is the root, or an after/later/insert file:
		//	Returns the result directly to write it
		//	in the concatened file.
		if(	isRootFile || closure.mapFile.position != "before")
		{
			if( closure.mapFile.isRoot() &&
				opts.forceDestUseStrict &&
				this.map.length === 1)
			{
				finalDest = '"use strict";\n\n' + 
							finalDest;
			}
			return finalDest;
		}

		// Otherwise, the file is included before its parent
		// and the final built destination file must be saved
		// in the cache of the parent file.
		parent.before.push(finalDest);

		// The files included before their parent does not return
		// anything because the result is added by the parent in
		// its destination.
		return "";
	}

	// logIncluded(file: GSFileData) 
	#logIncluded(file)
	{
		if(this.options.verbose >= 2)
		{
			var verb = "";
			switch(file.position)
			{
				case "insertOnce":
					verb = " once";
				case "insert":
					verb = "%{lightyellow}Inserted" + verb + "%{}";
					break;
				default:
					verb = "%{lightaquamarine}Included " +
							file.position + "%{}";
			}
			logger.info(`${verb}: %{lightblue}${file.path}%{}` +
					(file.parent ? 
						` %{darkgrey}in %{}%{lightviolet}${file.parent}%{}` :
						""));
		}
		return this;
	}

// --> After and later file handlings

	#findLaterId(absPath)
	{
		return this.#later.findIndex(function(aData)
		{
			return absPath === aData.fileData.absPath;
		});
	}

	#inLater(absPath)
	{
		return this.#findLaterId(absPath) > -1;
	}

	#cancelFromLater(data)
	{
		var id = this.#findLaterId(data.absPath);
		if(id > -1)
		{
			var aData = this.#later[id];
			this.#later.splice(id, 1);
			this.map.removeFile(aData.mapFile);
		}
		return this;
	}

	// This function includes all the later files
	// as single files.
	#includeLaterFiles(fileList)
	{
		var files = fileList || this.#later, f, src = "";

		// Uses a while loop by removing the file
		// each time it is used ensures the files
		// are not infinitely included.
		while(files.length > 0)
		{
			f = files.shift();
			src += this.#includeLaterFile(f);
		}

		return src;
	}

	// There is a shortcut to includeLater named
	// _includeLater that is bound to the instance.
	#includeLaterFile(laterData)
	{
		if(this.#cache.contains(laterData.fileData))
		{
			return "";
		}
		this.#cache.push(laterData.fileData);

		this.#startLaterFile(	laterData.fileData,
								laterData.mapFile);

		return this.#finalizeInclusion( laterData.fileData,
										laterData.buildData);
	}

// --> Debug

	#getInclusionError(data, error)
	{
		return new GSError("Failed to include the \"%s\" file in %s.\n" +
							"Error Message: %s\n%s",
							data.path || "", 
							data.parent ? '"' + data.parent + '"' : "the source",
							error.message,
							error.stack);
	}
}

// ------> Exports the module - Position Enumeration

module.exports = GSIncluder;