"use strict";

// ---------- CLASS GSError ---------- //

/*
	The Error class of Grunt and Sniff.
*/
class GSError extends Error
{
// ------> GSError - Constructor
	
	constructor(msg)
	{
		// Retrieves all the arguments
		var args = Array.prototype.slice.call(arguments, 1), i = 0;
		msg = "[Grunt And Sniff - Error] " +
			msg.replace(/%s/g, function(m){return args[i++] || m;});

		// Calls the parent constructor
		super(msg);
	}
}

// ---> Exports the class

module.exports = GSError;