"use strict";

// ---------- CLASS GSOptionBase ---------- //

// The base class for the options proxy
class GSOptionBase
{
// ------> GSOptionBase - Constructor

	constructor(options, readonly)
	{
		this.set(options);

		// Must be defines after the options
		// are set to allows the options to be set
		// one time.
		readonly = readonly ? true : false;
		Object.defineProperty(this, "readonly",
						{enumerable: true, value: readonly});
	}

// ------> GSOptionBase - Public Methods

	has(name)
	{
		return this.#options.hasOwnProperty(name);
	}

	// val(name)
	//		Returns the option value with the given name.
	// val(name, value)
	//		Sets the value of the option with the given name
	//		to the given value.
	val(name, value)
	{
		if(value === undefined)
		{
			return this.#options[name];
		}
		if(this.readonly)
		{
			return this;
		}
		if(!this.#options.hasOwnProperty(name))
		{
			this.#createProxy(name);
		}
		this.#options[name] = value;
		return this;
	}

	// get(names: string[])
	//		Returns an object with all the option values
	//		with the given names.
	// get(name)
	//		Returns the option value with the given name.
	// get()
	//		Returns a copy of the options in a simple object.
	get(name)
	{
		if(name !== undefined)
		{
			if(name && name instanceof Array)
			{
				var res = [], self = this;
				name.forEach(function(name)
				{
					if(this.#options.hasOwnProperty(name))
					{
						res[name] = this.#options[name];
					}
				});
				return res;
			}
			return this.#options[name];
		}
		return Object.assign({}, this.#options);
	}

	// set(options: object)
	//		Sets all the given options with the corresponding
	//		values in the passed object.
	// set(name: String, value: *)
	//		Sets the option with the given name to the given value
	set(a, b)
	{
		if(a)
		{
			// set(options: object)
			if(typeof(a) == "object")
			{
				var optNames = a instanceof GSOptionBase ?
									a.properties() :
									Object.getOwnPropertyNames(a),
					self = this;
				optNames.forEach(function(name)
				{
					self.set(name, a[name]);
				});
			}
			// set(name: string, value: *)
			else
			{
				this.val(a, b);
			}
		}
		return this;
	}

	// Returns String[] - Gets the option property names
	properties()
	{
		return Object.getOwnPropertyNames(this.#options);
	}

	copy(options)
	{
		if(options && typeof(options) == "object")
		{
			return this.set(options);
		}
		return this;
	}

	// Returns a copy of this option object
	clone()
	{
		return new this.constructor(this.#options,
									this.readonly);
	}

	toString(long)
	{
		const name = this.constructor.name, self = this;
		return 	"[" + name + "]" +
				(this.readonly ? " [readonly]" : "") +
				(long ? "\n" +
						JSON.stringify(this.get(), null, 3) : "");
	}

// ------> GSOptionBase - Private Attributes

	// Inner option object used in the proxy
	#options = {};

// ------> GSOptionBase - Private Methods

	#createProxy(name)
	{
		// Checks if it is already used
		if(this[name])
		{
			throw new Error("[OptionBase] Cannot create the \"" +
							name +
							"\" option because the name is " +
							"already used");
		}
		// Creates the proxy
		var n = "\"" + name + "\"";
		Object.defineProperty(this, name,
		{
			enumerable: true,
			get: new Function("return this.get(" + n + ");"),
			set: new Function("value",
							"this.set(" + n + ", value);")
		});

		return this;
	}

	#optValToStr(name)
	{
		var val = this.#options[name];
		if(typeof(val) == "string")
		{
			val = val.replace(/\n/g, "\\n")
					 .replace(/\r/g, "\\r")
					 .replace(/\t/g, "\\t")
					 .replace(/"/g, "\\\"");
			val = "\"" + val + "\"";
		}
		return val;
	}
}

// ---> Exports the class

module.exports = GSOptionBase;