"use strict";

// The path module
const path = require("path");

// The collection of paths
const PATH =
{
	SOURCE_DIR: "test/source",
	DEST: "test/final"
};
PATH.DEST_FULL = PATH.DEST + "/full";
PATH.SOURCE = PATH.SOURCE_DIR + "/A.js";

// Module function
module.exports = function(grunt)
{
	// Configures grunt-and-sniff
	const GSTask = require("./index.js");
	const gstask = new GSTask(grunt,
			PATH.SOURCE_DIR,
			{
				verbose: 2,
				copyDest: PATH.DEST_FULL,
				separator: "\n", // This is indeed the default one
				header: "/* [---o---[ [FILE] <%=path%> ]---o---] */\n\n",
				footer: "\n\n/* [---x---[ [END FILE] <%=path%> ]---x---] */",
				$: {testVar: "The content of the test variable"}
			});
	
	// Configures grunt
	grunt.initConfig(
	{
		pkg: grunt.file.readJSON("package.json"),

		// Concatenates all files by reading all the file dependencies
		concat:
		{
			options:
			{
				process: gstask.process
			},
			files:
			{
				src: PATH.SOURCE,
				dest: path.join(PATH.DEST, "test.js")
			}
		}
	});

	// Loads all the grunt tasks
	grunt.loadNpmTasks("grunt-contrib-concat");

	// Deletes the destination folder
	grunt.registerTask("delete", "Delete the destination file",
	() =>
	{
		if(grunt.file.exists(PATH.DEST))
		{
			grunt.file.delete(PATH.DEST);
			console.log("%s \x1b[32m%s\x1b[0m",
						"Destination folder deleted:", 	PATH.DEST);
		}
	});
	
	// Register the default and test task (for now it is the same)
	grunt.registerTask("default", ["delete", "concat"]);
	grunt.registerTask("test", [ "delete", 
								"concat",
								 gstask.task("exportMap",
									{dest: PATH.DEST + "/test.filelist"}),
								gstask.task("dependencyReport",
									{dest: PATH.DEST + "/test-report.html"})]);
};