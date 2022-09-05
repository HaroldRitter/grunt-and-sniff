"use strict";

// ---------- CLASS GSFileBranch ---------- //

class GSFileBranch
{
// ------> GSFileBranch - Private Attribute
	
	#stack = [];

// ------> GSFileBranch - Constructor

	// (grunt, sourceDir, options)
	// or (grunt, options) with sourceDir in options
	constructor(){}

// ------> GSFileBranch - Public readonly Attributes

	get length()
	{
		return this.#stack.length;
	}

// ------> GSFileBranch - Public Methods

// --> Getting files

	// Gets the current file pushed in the stack
	getCurrentFile()
	{
		return this.#stack[this.#stack.length - 1];
	}
	
	// Gets the current started file
	// (the last element in the stack)
	// Returns {path, dir, before, after}
	getCurrentReadyFile()
	{
		var l = this.#stack.length, c = this.#stack[l - 1];
		return c.ready ? c : this.#stack[l - 2];
	}

	// Gets the parent file of the last pushed file
	// (the element before the last one in the stack)
	// Returns {path, dir, before, after}
	getParent()
	{
		return this.#stack[this.#stack.length - 2];
	}

	// Gets the parent file of the last pushed file
	// (the element before the last one in the stack)
	// Returns {path, dir, before, after}
	getNonInsertedParent()
	{
		var p, i = this.#stack.length - 2;
		while((p = this.#stack[i]))
		{
			if(p.position != "insert" && p.position != "insertOnce")
			{
				break;
			}
			i--;
		}
		return p;
	}

// --> File information

	// Test whether or not the current file is a root file
	// i.e. it is read on the base of the stack, but it can
	// have a parent if the file is included after or later.
	isRootFile()
	{
		// The first element of the stack is the root directory
		return this.#stack.length === 1;
	}

// --> Stack handling

	push(fileData, isReady)
	{
		this.#stack.push({path: fileData.path, dir: fileData.dirPath,
						before: [], after: [],
						position: fileData.position,
						ready: isReady ? true : false});
		return this;
	}

	pop()
	{
		return this.#stack.pop();
	}
}

// ---> Exports the class

module.exports = GSFileBranch;