"use strict";

const readonly = function(a, b, c)
{
	// readonly(value: *)
	if(b === undefined)
	{
		return {value: a, enumerable: true};
	}

	// readonly(object, values: {})
	if(c === undefined)
	{
		var props = {};
		Object.getOwnPropertyNames(b).forEach(function(n)
		{
			props[n] = {value: b[n], enumerable: true};
		});
		return Object.defineProperties(a, props);
	}

	// readonly(object, name, value)
	Object.defineProperty(a, b, {value: c, enumerable: true});
}

module.exports = readonly;