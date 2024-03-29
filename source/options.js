"use strict";

const GSOptions = require("./options/Options.class");

module.exports = GSOptions.Set.newReadonly(
{ 
	removeSourceUseStrict: true,
	forceDestUseStrict: [".js"], // Or a single extension as a string or a bool
	replaceAllRequires: true,
	trimmed: true,
	preprocess: null,
	process: null,
	postprocess: null,
	header: "",
	separator: "\n",
	footer: "",
	insertSurrounder: "",
	copyDest: "",
	$: {},
	// 0 = Complete silence (also the debug function)
	// 1 = Prints the necessary
	// 2 = Prints more details
	verbose: 1,
	encoding: "utf-8"
});