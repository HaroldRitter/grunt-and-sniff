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
			else if(GSOptions.#DEFAULTS.hasOwnProperty(a))
			{
				this[a] = b;
			}
		}
		return this;
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

// ------> GSOptions - Public Static Attributes

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
		insertSurrounder: ""
	}
}

// ---> Exports the class

module.exports = GSOptions;