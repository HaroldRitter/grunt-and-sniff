"use strict";

// ---------- SMALL REGEXP ELEMENTS ---------- //

// White space
const ws = "\\s*";

// Quotes
const quote = "(?<quote>" + "[\"']" + ")";
const close_quote = "\\k<quote>";

// Opening and closing of a long comment
const oc = "\\/\\*", cc = "\\*\\/";

// Comments
const comment = "(?:" + ws + "\\/\\*" + ".*?" + "\\*\\/" + ws + ")*";
const longcomment = oc + "[\s\S]*?" + cc + ws;
const shortcomment = "\\/\\/.*?\\r?\\n";

// Opening and closing of a template
const ot = "<%=", ct = "%>";

// The include regular expression
const include = "include(?<incType>After|Later)?" + ws + "\\(" +
				ws + comment +
				/*<quote>*/quote +
				"(?<source>" + ".*?" + ")" +
				close_quote + 
				comment + ws + "\\)";

// ---------- BUILDER FUNCTIONS ---------- //

function buildRequireRegExp(type)
{
	return new RegExp(
				"(?<separator>^|\\r?\\n)" + 
				"(?<statement>" + 
					"[ \\t]*" + "require" + ws + "\\(" + 
					"(?<require>" +
					 	ws +
					 	"(?<leadcomment>" + comment + ")" +
					 	/*<quote>*/quote +
						"(?<type>" + (type || "") + ")" +
						(type ? "[ \\t]*:[ \\t]*" : "") +
						"(?<url>" + ".*?" + ")" +
						close_quote +
					 	"(?<trailcomment>" + comment + ")" +
					 	ws +
					")" +
					"\\)" + ws + ";?" + "[ \\t]*" +
				")",
				"g");
}

function buildIncludesRegExp()
{
	return new RegExp(ws + 
				"(?<comments>"+
					"(?:" + ws + "(?:" + longcomment + "|" + shortcomment + ")" + ")*" +
				")" +
				"(?<include>" +
					"(?:" + ws + ot + ws + include + ws + ct + ")+" + ws +
				")",
				"g");
}

// ---------- FINAL REGULAR EXPRESSIONS ---------- //

const regex =
{
	// Detects the different require statements
	require:
	{
		all: buildRequireRegExp(),
		include: buildRequireRegExp("include"),
		insert: buildRequireRegExp("insert"),
		insertOnce: buildRequireRegExp("insertOnce"),
		before: buildRequireRegExp("before"),
		after: buildRequireRegExp("after"),
		later: buildRequireRegExp("later")
	},

	// Detects the inclusion groups and read the content
	includes: buildIncludesRegExp(),

	// Detects
	useStrict: /^\s*("use strict"|'use strict')\s*;?\s*\r?\n?/
};

// ---> Exports the regular expressions

module.exports = regex;