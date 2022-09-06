"use strict";

const GSOptions = require("./options/Options.class");

module.exports = GSOptions.Set.newReadonly(
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
	copyDest: "",
	$: {}
});