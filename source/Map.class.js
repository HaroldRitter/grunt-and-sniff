"use strict";

const path = require("path");
const GSError = require("./Error.class.js");
const GSMapFile = require("./MapFile.class.js");

// ---------- CLASS GSMap ---------- //

// A map of the included files with the tree and
// the nodes. The tree root is the map itself,
// but a "root file" is a file which was not
// added to the tree by being included
// by another file. A "root file" is among the
// descendant at the first level of the tree.
class GSMap extends Array
{
// ------> GSMap - Public Attributes

	#stack = [];
	#ordered = [];

// ------> GSMap - Constructor

	constructor()
	{
		super();
	}

// ------> GSMap - Public Readonly Properties

	// uint: The number of ordered files, i.e. the total
	// number of files in the tree excluding
	// the inserted ones.
	get orderedLength()
	{
		return this.#ordered.length;
	}

	// uint: The total number of files in the tree
	get deepLength()
	{
		return this.reduceMap(function(prev)
		{
			return prev + 1;
		}, 0);
	}

// ------> GSMap - Public Methods

// --> File adding methods

	// Adds a file to the map from its path relative 
	// to the source.
	// 	fileData: GSFileData
	// OR
	// 	mapFile: GSMapFile: the GSMapFile returned
	//	by the Map when a file was added and temporarily
	//	removed.
	// 
	// If fileData are provided,
	// a corresponding GSMapFile is added
	// to the "includes" array of the parent, otherwise,
	// addFile assumes the argument is a previously
	// created file data that does not requires to be
	// included again.
	//
	// Returns MapFile
	addFile(file)
	{
		if(file instanceof GSMapFile)
		{
			this.#stack.push(file);
			return file;
		}
		
		var parent = this.getLastFileInStack();
		var mapFile = new GSMapFile(parent, file);

		(parent && parent.includes || this).push(mapFile);
		this.#stack.push(mapFile);

		return mapFile;
	}

	removeFile(fileData)
	{
		var incs = fileData.parent ?
						fileData.parent.includes : this,
			id = incs.indexOf(fileData);
		
		if(id > -1)
		{
			incs.splice(id, 1);
		}

		id = this.#ordered.indexOf(fileData);
		if(id > -1)
		{
			this.#ordered.splice(id, 1);
		}

		return this;
	}

	// Closes the file adding procedure after all
	// dependencies were added.
	endFile(notWritten)
	{
		if(this.#stack.length == 0)
		{
			throw new GSError("Problem by building the file map.");
		}
		var fileData = this.#stack.pop();
		if(	!notWritten && fileData.position != "insert" &&
			fileData.position != "insertOnce")
		{
			this.#ordered.push(fileData);
		}
		return fileData;
	}

// --> File methods

	// Gets the last file that was added to the stack
	getLastFileInStack()
	{
		return this.#stack[this.#stack.length - 1];
	}

// --> Each methods

	// Go through the entire map by looking for the dependencies
	// 	cb:function(file:{file:String, filePath:String}, depth, id_in_depth, total_id)
	eachMap(cb)
	{
		GSMap.#mapForEach(this, cb, 0, 0);
		return this;
	}
	
	// Go through the ordered files
	// 	cb:function(mapFileData: object, id: integer)
	eachOrderered(cb)
	{
		this.#ordered.forEach(cb, this);
		return this;
	}

	reduceMap(cb, initValue)
	{
		initValue = initValue === undefined ? "" : initValue;
		return GSMap.#mapReduce(this, cb, 0, 0, initValue);
	}

	ireduceMap(cb, initValue)
	{
		initValue = initValue === undefined ? "" : initValue;
		return GSMap.#mapInvReduce(this, cb, 0, 0, initValue);
	}

	// Gets the dependency list in order in a flat array.
	dependencyList()
	{
		return this.#ordered.slice();
	}

// --> String outputs

	// Returns a string with a tree of all dependencies.
	toString()
	{
		return 	"[GSMap]\n" + 
				GSMap.#mapToString(this, "", {value: 0}) +
				"[/GSMap]\n";
	}

	// Returns a string with a tree of all dependencies.
	toDependencyList(dir, forURL)
	{
		dir = GSMap.#checkDir(dir);
		if(forURL)
		{
			dir = dir.replace(/\\/g, "/");
		}
		return this.#ordered.reduce(function(prev, elt)
		{
			var f = forURL ? elt.path.replace(/\\/g, "/") : elt.path;
			return prev + GSMap.#dir(dir, f) + "\n";
		}, "");
	}

	// Returns a string with a tree of all dependencies.
	toResume()
	{
		return this.deepLength + " files" +
					"\n\n---- Tree ----\n\n" + this +
					"\n\n---- Include order ----\n\n" + this.toDependencyList();
	}

	// Returns a string with a tree of all dependencies.
	//	dir:String - A base directory from where the files are imported.
	toHTML(dir)
	{
		dir = GSMap.#checkDir(dir);
		return this.ireduceMap(function(prev, file)
		{
			return prev + "<script src=\"" + GSMap.#dir(dir, file.path) + "\"></script>\n";
		});
	}

// ------> GSMap - Protected Static Methods

	static #mapForEach(map, cb, deg, total_id)
	{
		map.forEach(function(f, i)
		{
			cb(f, deg, i, total_id++);
			total_id = GSMap.#mapForEach(f.includes, cb, deg + 1, total_id);
		});
		return total_id;
	}

	static #mapReduce(map, cb, deg, total_id, initValue)
	{
		return map.reduce(function(prev, elt, i)
		{
			var newValue = cb(prev, elt, deg, i, total_id++);
			return GSMap.#mapReduce(elt.includes, cb, deg + 1, total_id, newValue);
		},
		initValue);
	}

	static #mapInvReduce(map, cb, deg, total_id, initValue)
	{
		return map.reduce(function(prev, elt, i)
		{
			var newValue = GSMap.#mapInvReduce(elt.includes, cb, deg + 1, total_id, prev);
			return cb(newValue, elt, deg, i, total_id++);
		},
		initValue);
	}

	static #mapToString(map, tab, pID)
	{
		var str = "";
		map.forEach(function(f)
		{
			var sign = f.position == "after" ? "+" : 
						f.position == "later" ?  ">" : 
							f.position == "insert" ?  "i" : 
								f.position == "insertOnce" ?  "I" : 
									"-";
			sign = "(" + sign + ")";
			const i = pID.value++;
			const tabNext = tab ? tab + "|   " : tab + "    ";
			str +=  tab + sign + " " + "#" + i + " " + f.path + "\n" +
					GSMap.#mapToString(f.includes, tabNext, pID);
		});
		return str;
	}

	static #checkDir(dir)
	{
		dir = dir || "";
		if(	dir && typeof(dir) !== "function" &&
			dir[dir.length-1] != "/")
		{
			dir += "/";
		}
		return path.join("", dir);
	}

	static #dir(dir, file)
	{
		return typeof(dir) == "function" ? dir(file) : dir + file;
	}
}

// ---> Exports the class

module.exports = GSMap;