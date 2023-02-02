"use strict";

/*
Builds a dependency report.

Options:
	- [dest: string] - The destination file path.
	- [info: Object] - Additional information to add to the 
	header of the report.
	- [ordered: boolean=true] - Specifies whether or not the
	ordered file list (without insertions) is added to the report.
	- [tree: boolean=true] - Specifies whether or not the
	inclusion tree (with insertions) is added to the report.
	- [missing: boolean=true] - Specifies whether or not the
	missing files are added to the report.
*/

const destPath = require("./destPath.js");

const GSTask = require("../Task.class.js");
const logger = require("../utils/logger.js");
const HTMLDocument = require("../simple-html.js");

const EXT = "-dependency-report.html";
const START_TIME = Date.now();

GSTask.addTask(
{
	name: "dependencyReport",

	description: "Creates a dependency report.",

	task: function(gsTask, map, opts = {})
	{
		const grunt = gsTask.grunt,
			  addMissing = opts.missing ?? true,
			  addOrdered = opts.ordered ?? true,
			  addTree = opts.tree ?? true,
			  info = opts.info ?
			  	Object.keys(opts.info).map(k => [k, opts.info[k]]) :
				[],
			  pkg = grunt.config.get("pkg"),
			  src = gsTask.sourceDir,
			  file = destPath(gsTask,
							(pkg) => `${pkg.name.toLowerCase()}${EXT}`,
							opts),
			  allFiles = this.getDependencyList(map),
			  missing = addMissing ? this.getMissingFiles(gsTask,
											this.getAllFiles(map)) :
						null;

		// Writes the report
		const TITLE = pkg.name + " - Dependency Report";
		const INCLUDED = map.deepLength;

		var html = new HTMLDocument(null, TITLE, "utf8", "default");
		html.head.style(
		{
			"body":
			{
				margin: "10px"
			},

			"ul[name=children]": 
			{
				borderLeft: "1px dotted #aaa"
			},

			"li[position] > div:before":
			{
				display: "inline-block",
				fontWeight: "bold",
				width: "13px",
				height: "13px",
				textAlign: "center",
				lineHeight: "12px",
				background: "#fff",
				marginRight: "3px",
				boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.5)",
				borderRadius: "20px"
			},

			"li[position=before] > div:before": 
			{
				content: '"-"',
				color: "#833"
			},

			"li[position=after] > div:before": 
			{
				content: '"+"',
				color: "#57b"
			},

			"li[position=later] > div:before": 
			{
				content: '"+"',
				color: "#383"
			},

			"li[position=insert] > div:before": 
			{
				content: '"i"',
				color: "#daa738"
			},

			"li[position=insertOnce] > div:before": 
			{
				content: '"i"',
				color: "#c97ed5"
			},

			".file-id":
			{
				fontStyle: "italic",
				color: "#888"
			}
		});

		html.body
			.h1(TITLE) ["<"]
			.table([
				["Project", 	pkg.name],
				["Version", 	pkg.version],
				["Author", 		pkg.author],
				["Date", 		new Date().toUTCString()],
				["Elapsed*", 	(Date.now() - START_TIME)/1000 + "sec"],
				["Source", 		src],
				["Destination", gsTask.options.copyDest],
				["Included", 	INCLUDED],
				missing ? ["Missing", 	missing.length] : null,
				...info
			]) ["<"]
			.p().i("* The elapsed time is computed from the inclusion of the dependencyReport plugin.") ["<<"]

		if(addOrdered)
		{
			html.body
				.h2("Files in order of inclusion (" + INCLUDED + ")") ["<"]
				.if(INCLUDED)
					.then(elt => elt.p().i("The inserted files are not added to the following ordered list."))
				.endif()
				.ul({id: "files-ordered", count: INCLUDED, class: "lines"},
					map.dependencyList().map(function(f){return f.path;})) ["<"]
				.if(!INCLUDED)
					.then(elt => elt.p("No files were included in the project."))
				.endif();
		}

		if(addTree)
		{
			html.body
				.h2("Inclusion Tree") ["<"]
				.div({class: "box"})
					.h3("Legend") ["<"]
					.ul([ [{position: "before"}, "<div> <b>Before</b>: the file is included before the parent</div>"],
						[{position: "after"}, "<div> <b>After</b>: the file is included right after the parent</div>"],
						[{position: "later"}, "<div> <b>Later</b>: the file is included after the root</div>"],
						[{position: "insert"}, "<div> <b>Insert</b>: the file is inserted at the same place in the file and can be inserted/included again</div>"],
						[{position: "insertOnce"}, "<div> <b>Insert Once</b>: the file is inserted at the same place in the file and cannot be inserted/included again</div>"]
						]);

			var ul = html.body.ul({id: "files-tree"}),
				stack = [[ul, ""]], li, currDepth = 0;
			
			map.eachMap((file, depth, idInDepth, totalId, before) =>
			{
				if(depth > currDepth)
				{
					stack.push([ul, file]);
					ul = li.ul({name: "children"});
				}
				else if(depth < currDepth)
				{
					var diff = currDepth - depth;
					ul = stack.splice(stack.length - diff, diff)[0][0];
				}
				currDepth = depth;
				
				li = ul 
					.li({fileID: totalId,
						even: totalId % 2 ? "yes" : "no",
						file: file.path,
						position: file.position})
					.div()
					.span({class: "file-id"}, "#" + totalId + ":") ["<"]
					.span({name: "file"}, this.path(file)) ["<"] ["<"];
			});
			
			html.body
				.if(!INCLUDED)
					.then(elt => elt.p("No files were included in the project."))
				.endif();
		}
		
		if(addMissing)
		{
			html.body
				.h2("Missing files (" + missing.length + ")") ["<"]
				.if(missing.length)
				.then(elt => 
				{
					elt.p(`The files bellow were found in the source (${src}) but not included in the project:`) ["<"]
					.ul({id: "files-missing", count: missing.length, class: "lines"}, 
						missing);
				})
				.elif(allFiles.length, elt =>
				{
					elt.p(`Every files in the source (<i>${src}</i>) were included in the destination.`);
				})
				.else(elt => elt.p("No files were found in the source."))
				.endif();
		}

		// Writes the result.
		grunt.file.write(file,
						html.toString(),
						{encoding: "utf-8"});

		// Log information
		logger.log(`Files detected: %{cyan}${INCLUDED}%{}`);
		logger.log(`Exported to %{lightgreen}${file}%{}`);
	},

	path: function(f)
	{
		return f.path.replace(/\\/g, "/");
	},

	getDependencyList: function(map)
	{
		return map.dependencyList()
				.reduce((a, f) => a.push(this.path(f)) && a, []);
	},

	getAllFiles: function(map)
	{
		const all = [];
		map.eachMap(f => all.push(this.path(f)));
		return all;
	},

	getMissingFiles: function(gsTask, allFiles)
	{
		const src = gsTask.sourceDir, l = src.length + 1,
			  missing = [];
		
		gsTask.grunt.file.recurse(src, file =>
		{
			if(allFiles.indexOf(file.substr(l)) == -1)
			{
				missing.push(file);
			}
		});
		
		return missing;
	}
});