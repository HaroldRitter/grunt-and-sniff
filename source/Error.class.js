"use strict";

// ---------- CLASS GSError ---------- //

/*
	The Error class of Grunt and Sniff.
*/
class GSError extends Error
{
// ------> GSError - Static Public Methods

	/**
	* Opens an error group to group all the 
	* errors thrown with {@link GSError.throw} together.
	* The error are thrown when the group is closed with
	* the {@link GSError.closeGroup} method.
	*/
	static openGroup(name = "")
	{
		this.#groups.push({name: name, errors: []});
		return this;
	}

	/**
	* Closes the group and, if this is the root group,
	* throws all the error that occured since the
	* previous call of the {@link GSError.openGroup}
	* method.
	*/
	static closeGroup()
	{
		const group = this.#groups.pop(),
			  tab = "\t".repeat(this.#groups.length);
		if(group && group.errors.length)
		{
			const es = group.errors, p = es.length > 1 ? "s" : "",
				  name = group.name ? "-- " + group.name + " --\n" : "";
			this.throw(`${tab}${name}${es.length} error${p} occured:
${es.map((e, i) => tab + "\t(" + (i+1) + ") " + e.message).join("\n")}`);
		}
		return this;
	}

	/**
	* If one or more group are opened, the error message is added to .
	*/
	static throw(message)
	{
		const grp = this.#currentGroup, e = new this(message);
		if(grp)
		{
			grp.errors.push(e);
			return this;
		}
		throw e;
	}

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

// ------> GSError - Static Private Attributes

	static #groups = [];
	static get #currentGroup()
	{
		const g = this.#groups, l = g.length;
		return l ? g[l - 1] : null;
	}
}

// ---> Exports the class

module.exports = GSError;