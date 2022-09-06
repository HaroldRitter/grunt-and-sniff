"use strict";

// ---------- CLASS GSOptions ---------- //

// The default options are set at the end
class GSOptions
{
// ------> GSOptions - Public Static Methods

	// default()
	// default(name: string)
	// default(names: string[])
	static default(name)
	{
		if(name)
		{
			if(name && name instanceof Array)
			{
				name.forEach(function(name)
				{
					res[name] = this[name];
				});
				return res;
			}
			return GSOptions.#DEFAULTS[name];
		}
		return Object.assign({}, GSOptions.#DEFAULTS);
	}

// ------> GSOptions - Constructor

	constructor(options)
	{
		Object.assign(this, GSOptions.#DEFAULTS);
		this.set(options);
	}

// ------> GSOptions - Public Methods

	// set(name: string, value: *)
	// set(options: object)
	set(a, b)
	{
		if(a)
		{
			// set(options: object)
			if(typeof(a) == "object")
			{
				var optNames = Object.getOwnPropertyNames(a),
					self = this;
				optNames.forEach(function(name)
				{
					self.set(name, a[name]);
				});
			}
			// set(name: string, value: *)
			else
			{
				b = this.#value(a, b);
				if(b !== undefined)
				{
					this[a] = b;
				}
			}
		}
		return this;
	}

	get(name)
	{
		return this[name];
	}

	clone()
	{
		return new GSOptions(this);
	}

	//	default()
	//	default(name: string)
	//	default(names: string[])
	default(a)
	{
		return GSOptions.default(a);
	}

// ------> GSOptions - Private Methods

	// Checks the existence and the type of the default
	// value, and returns a value converted to this type
	// or undefined if the options does not exist, or
	// the value is invalid
	#value(name, value)
	{
		const dft = GSOptions.#DEFAULTS[name];
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

// ------> GSOptions - Private Static Attributes

	static #DEFAULTS =
	{ 
		removeSourceUseStrict: true,
		forceDestUseStrict: true,
		replaceAllRequires: true,
		trimmed: true,
		preprocess: null,
		process: null,
		postprocess: null,
		header: "",
		separator: "",
		footer: "",
		insertSurrounder: "",
		copyDest: ""
	}
}

// ---> Exports the class

module.exports = GSOptions;