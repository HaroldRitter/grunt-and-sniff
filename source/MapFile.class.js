"use strict";

// ---------- CLASS GSMapFile ---------- //

// The data of a file stored in the map. It is also a node
// in the file tree with its parent node (the parent attribute)
// and the child nodes (the includes attribute).
// 
// Constructor:
// 	parent: GSMapFile
// 	file: FileData
// 	fileList: string[]
class GSMapFile
{
// ------> GSMapFile - Constructor

	constructor(parent, file, fileList)
	{
		Object.assign(this,
		{
			// path: string - The file path relative to the given source 
			// directory path
			path: file.path,

			// absPath: string - The absolute file path
			absPath: file.absPath,

			// cwdPath: string - The file path relative to the project 
			// root
			cwdPath: file.cwdPath,

			// parent: gs.Map - The file which includes this one
			// (the parent node in the tree)
			parent: parent,
			
			// includes: GSMapFile[] - The files included by this one
			// in order (the child nodes in the tree)
			includes: [],

			// beforeList: string[] - The list of files included before
			// this one
			beforeList: fileList,

			// position: string - The position of the file related to
			// the parent
			position: file.position
		});
	}

// ------> GSMapFile - Public Methods

	// Checks if the given map file is a "root file", i.e.
	// it is was not added to the tree by being included
	// by another file. A "root file" is among the
	// descendant at the first level of the tree.
	isRoot()
	{
		return this.parent === undefined;
	}
}

// ---> Exports the class

module.exports = GSMapFile;