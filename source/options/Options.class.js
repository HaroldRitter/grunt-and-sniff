"use strict";

const logger = require("../utils/logger");
const GSOptionBase = require("./OptionBase.class");
const GSOptionSet = require("./OptionSet.class");

// ---------- CLASS GSOptions ---------- //

// GSOptions is a proxy that allows to set
// the options by checking the option types.
// It also defines the default options.
class GSOptions extends GSOptionBase
{
// ------> GSOptions - Public Static Attributes

	// GSOptions.Set returns GSOptionSet
	static get Set()
	{
		return GSOptionSet;
	}

// ------> GSOptions - Constructor

	constructor(dftOpts, options)
	{
		super();
		this.set(dftOpts.get());
		this.#defaults = dftOpts;
		this.set(options);
	}

// ------> GSOptions - Public Methods

	val(name, value)
	{
		if(value !== undefined)
		{
			value = this.#value(name, value);
			if(value !== undefined)
			{
				super.val(name, value);
			}
			return this;
		}
		return super.val(name, value);
	}

	// Returns String[] - Gets the option property names
	properties()
	{
		return this.#defaults.properties();
	}

	//	default()
	//	default(name: string)
	//	default(names: string[])
	default(name)
	{
		return this.#defaults.get(name);
	}

	clone()
	{
		return new this.constructor(this.#defaults,
									this);
	}

// ------> GSOptions - Private Attributes

	// Default values
	#defaults = null;

// ------> GSOptions - Private Methods

	// Checks the existence and the type of the default
	// value, and returns a value converted to this type
	// or undefined if the options does not exist, or
	// the value is invalid
	#value(name, value)
	{
		if(!this.#defaults)
		{
			return value;
		}
		
		const dft = this.#defaults.get(name);
		const type = dft === null ? "function" : typeof(dft); 
		switch(type)
		{
			case "boolean":
				return value ? true : false;
			case "number":
				value = parseFloat(value);
				return isNaN(value) ? undefined : value;
			case "string":
				return value === null || value === undefined ? 
						"" : value.toString();
			case "object":
				return this.#strongType(value, "object", {});
			case "function":
				return this.#strongType(value, "function", null);
		}
		return undefined;
	}

	// Returns the default value if value is null or undefined.
	// Otherwise, returns the value itself if it matches the
	// given type, else returns undefined.
	#strongType(value, type, dft)
	{
		return value === null || value === undefined ? 
					dft :
					typeof(value) == type ?
						value :
						undefined;
	}	
}

// ---> Exports the class

module.exports = GSOptions;