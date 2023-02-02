"use strict";

const path = require("path");

/**
* Gets the path of the destination file.
* @param {GSTask} gsTask - The task.
* @param {String|Function} [extension="txt"] -
*				The file extension
*				(without ``.``) or a function that
*				takes the project package data as an
*				object and returns the complete file name.
*				By default the file name is the 
* @param {Object} [opts] - Some options than may contain
*				the destination path.
* @returns {String}
*/
module.exports = function(gsTask, ext = "txt", opts = {})
{
	if(opts.dest)
	{
		return opts.dest;
	}
	const copyDest = gsTask.options.copyDest,
		  pkg = gsTask.grunt.config.get("pkg"),
		  file = typeof(ext) == "function" ?
		  			ext(pkg) :
		  			pkg.name.toLowerCase() + "." + ext;

	return copyDest ? 	path.join(copyDest,
								"/", file) :
						path.join("/", file);
};