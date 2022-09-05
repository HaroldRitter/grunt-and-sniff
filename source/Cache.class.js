"use strict";

// ---------- CLASS GSCache ---------- //

class GSCache
{
// ------> GSCache - Attributes
	
	#stack = [];

// ------> GSCache - Constructor

	constructor(){}

// ------> GSCache - Public readonly Attributes

	get length()
	{
		return this.#stack.length;
	}

// ------> GSCache - Public Methods

	contains(fileData)
	{
		return this.#stack.indexOf(fileData.absPath) > -1;
	}

	push(fileData)
	{
		this.#stack.push(fileData.absPath);
		return this;
	}
	
	reset()
	{
		this.#stack.splice(0, this.#stack.length);
		return this;
	}
}

// ---> Exports the class

module.exports = GSCache;