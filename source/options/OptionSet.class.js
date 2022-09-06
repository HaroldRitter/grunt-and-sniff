"use strict";

const GSOptionBase = require("./OptionBase.class");

// ---------- CLASS GSOptionSet ---------- //

// The values of the option set defined the
// the possible options with their default values.
class GSOptionSet extends GSOptionBase
{
// ------> GSOptionSet - Static Public Methods

	static newReadonly(options)
	{
		return new GSOptionSet(options, true);
	}

// ------> GSOptionSet - Constructor

	constructor(options, readonly)
	{
		super(options, readonly);
	}

// ------> GSOptionSet - Public Methods

	// Creates options
	options(options)
	{
		const GSOptions = require("./Options.class");
		return new GSOptions(this, options);
	}
}

// ---> Exports the class

module.exports = GSOptionSet;