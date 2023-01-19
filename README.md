# Grunt and Sniff

The **grunt-and-sniff** module is not a grunt task,
but it is a *toolkit* that enhances the *grunt-contrib-concat*
plugin to grant the usage of many kind of inclusions and insertions.
Concatenating files is pretty usefull for JavaScript Frontend
applications and **grunt-and-sniff** makes average or
bigger project easier to export by providing an inclusion system. 

*grunt-and-sniff* provides the following services:
- A bunch of inclusion functions in the grunt template:
``include``, ``includeAfter``, ``includeLater``, ``insert``,
``insertOnce``.
- A specific syntax that uses the ``require`` keyword to
improve the code readability.
- The export of an HTML dependency report.
- Creates a map.
- Many information to the templates, including a ``$``
object passed to the grunt templates in all files in 
which the user can write functions common to a project.
- A way to also copy files in a folder.
- And more features...

## Starting with a simple example

This example shows the behavior of a very simple case, but
*Grunt and Sniff* can deal with more complex situations.

Source: **source/index.js**

```js
require("hello.func.js");
require("names.js");

names.forEach(function(name)
{
	hello(name);
});

require("continuation.js");
```

Included 1: **source/hello.func.js**

```js
function hello(name)
{
	console.log("Hello " + name + "!");
}
```

Included 2: **source/names.js**

```js
var names = ["Leo", "Clara", "Rosa"];
```

Included 3: **source/continuation.js**

```js
console.log("Is everything OK for you all?");
```

Result: **destination/concat.js**

```js
function hello(name)
{
	console.log("Hello " + name + "!");
}

var names = ["Leo", "Clara", "Rosa"];

names.forEach(function(name)
{
	hello(name);
});

console.log("Is everything OK for you all?");
```

Resulting map: **map.filelist**

```js
/destination/full/source/hello.func.js
/destination/full/source/names.js
/destination/full/source/index.js
```

## Using grunt-and-sniff

The *grunt-and-sniff* module exports the ``GSTask`` class
that provides the process function that can be used in 
the grunt configuration.

The ``GSTask`` constructor takes three argument:

| Name | Type | Description |
| --- | --- | --- |
| **``grunt``** | ``Object`` | The grunt object passed to the function exported in ``GruntFile.js``. |
| **``sourceDir``** | ``String`` | The path of the source directory relative to the path of the project. |
| **``options``** [optional] | ``Object`` | A set of options that are described in the **"The Options** chapter. |

### Grunt configuration

```js
// Initializes all paths
const SOURCE_DIR = "source";
const DEST_DIR = "destination";
const DEST_FULL_DIR = DEST_DIR + "/full";
const DEST = DEST_DIR + "/concat.js";

// Creates the GSTask from the grunt object,
// the source directory, and the options
const GSTask = require("grunt-and-sniff");
const gs = new GSTask(grunt, SOURCE,
{
	// This will also copy the files one per
	// one in the given destination directory.
	// Using the contrib-copy will not interpret
	// the insert and insertOnce statements
	// and the variables passed to the files
	// by grunt-and-sniff will not be defined.
	copyTest: DEST_FULL_DIR,

	// Indeed, grunt-and-sniff takes care of the
	// inclusions, so the separator, the headers
	// and the footers must be defined in the GSTask.

	// Separates the files
	// ("\n" is indeed the default value)
	separator: "\n",

	// The header and the footer are interpreted
	// with the grunt template in the same way as
	// the files, so <%=path%> will be 
	// replaced with the file path.
	header: "/* [---o---[ [FILE] <%=path%> ]---o---] */\n\n",
	footer: "\n\n/* [---x---[ [END FILE] <%=path%> ]---x---] */"
});

// Configures grunt
grunt.initConfig(
{
	// grunt-and-sniff works with the contrib-concat plugin
	concat:
	{
		options:
		{
			// This is what you need to do to use
			// grunt-and-sniff: GSTask provides
			// a file processor.
			process: gs.process
		},
		files:
		{
			src: SOURCE_DIR + "/**",
			dest: DEST
		}
	}
});
```

### The process method

This method must be used as the process function in the
grunt configuration file. It should not have any other usage,
but here are the arguments:

``process(source, filePath): String``
``process(filePath): String``

| Name | Type | Description |
| --- | --- | --- |
| **``source``** | ``String`` | The content of the file. |
| **``filePath``** | ``String`` | The path of the file. |

## The options

The *grunt_and_sniff* module offers many options in a
``GSOption`` object:

### Surrounders (separator, header and footer)

Because *grunt-and-sniff* takes care of the
inclusions, the **separator**, the **header**
and the **footer** must be defined in the ``GSTask``
and not in the *contrib-concat* plugin.

The **header** and the **footer** are interpreted
with the grunt template in the same way as
the files. For example ``<%=path%>`` is 
replaced with the file path.

- **``separator``**: ``String`` [optional=``"\n"``]

	Added between two files.

- **``header``**: ``String|Function`` [optional=``""``]

	Either a grunt template ``String`` or a callback
	(``function(data:FileData): String``) that returns
	a ``String``. The result will be added at
	the begining of the file, after the *before*
	inclusions.

- **``footer``**: ``String|Function`` [optional=``""``]

	The same as the header, but the result is copied at the
	end of the file, before the *after* and *later* inclusions.

- **``insertSurrounder``**: ``String`` [optional=``""``]

	A ``"shf"`` case-insensitive flags for *separator*, *header*
	and *footer* that specify which type of surrounder are used
	for inserted files.
	By default, no surrounder is used for inserted files.

### The ``"use strict";`` statement

- **``removeSourceUseStrict``**: ``Boolean`` [optional=``true``]
	
	Removes the ``"use strict"`` statement at the begining of the source
	files. It is recommended to leave this option as ``true`` because
	it is unatural to have ``"use strict"`` at the begining of each
	original file in the final concatened version.
	If a ``copyDest`` is supplied, ``removeSourceUseStrict`` does not
	affect the copied file because it does not make any sens, it only´
	affects the concatenated file.

- **``forceDestUseStrict``**: ``Boolean`` [optional=``true``]

	Adds ``"use strict";`` at the begining of every destination files:
	the concatenated file, and the copied files if a ``copyDest``
	is supplied.
	It is not the opposite of the ``removeUseStrict`` option
	because ``removeUseStrict`` removes ``"use strict";``
	at the begining of the **source** files, and ``forceDestUseStrict``
	adds it at the begining of the **destination** files.

### Require

- **``replaceAllRequires``**: ``Boolean`` [optional=``true``]

	If it is set to true, the includer will replace all require
	statement by considering than those who does not start with
	"insert:" or "include:" are single inclusions.

### Format

- **``trimmed``**: ``Boolean`` [optional=``true``]

	Removes the heading and leading spaces for each file before it is
	added in the concatenated file.

### Copying

- **``copyDest``**: ``String`` [optional=``""``]

	The directory where to copy the computed file.
	This is an additional feature to make a copy of a file by executing
	all the templates in an order that allows files to declares properties
	in ``$`` that can be used in the parent files.

### Process

- **``verbose``**: ``integer`` [optional=``1``]

	0. Does not log anything but the errors in the console.
	1. Logs the necessary information (default)
	2. Logs more details about the process
<br/><br/>
- **``$``**: ``object`` [optional=``{}``]

	The object passed to every templates of the files.

### Process callbacks

The process callback functions all takes the same argument and
they must return a string. The ``source`` argument is a bit different
for each processor because this is the result of different steps.

```js
function(	src: String,
			data: GSFileData,
			fileOptions: GSOptions): String
```

**Callback arguments**:
- **``source``**: ``String`` - The content of the file.
- **``data``**: ``GSFileData`` - The data of the file (see the chapter).
- **``options``**: ``GSOptions`` - The options described in this chapter.

**Callback return**: ``String`` - The callback must return the new source of the file.

- **``preprocess``**: ``Function`` [optional=``null``]

	A callback that handles the content of a source file before the 
	header's require statement replacements
	and returns the result that must be writen in the destination file.

- **``process``**: ``Function`` [optional=``null``]

	A callback that handles the content of a source file after the header's 
	require statement replacements and returns the result that must be
	writen in the destination file.

	If this callback is not set, *grunt-and-sniff* will nevertheless
	proceed the grunt template.

- **``postprocess``**: ``Function`` [optional=``null``]

	A callback  that handles the content of a source file after
	the header's require statement replacements and even after the
	header and footer was added, and then returns the result that
	must be writen in the destination file.

- **``copyprocess``**: ``Function`` [optional=``null``]

	A callback  that
	treats the content of a source file before it is copied if a ``copyDest`` option was supplied.
	If the ``"use strict";`` statement must be added because the
	``forceDestUseStrict`` option is set to ``true``, it is added on the source
	sent to the callback.

## The Inclusions

*grunt-and-sniff* provides five different types of inclusion
that are detailed in the specific sub-chapter:
**before**, **after**, **later**, **insert** and **insertOnce**.

For each type, there is a function in the grunt template
and the corresponding ``require`` prefix.

### Including using the grunt template

```js
<%=include("./MyVarClass.class.js")%>

const theVar = new MyVarClass();
function makeSuperVar()
{
	<%=insert("./theVarComment.insert.js")%>
	return new Super(theVar);
}

<%=includeAfter("./extendTheX.js")%>
<%=includeLater("./Super.class.js")%>
```

### Including using the require statements

```js
require("./MyVarClass.class.js");

const theVar = new MyVarClass();
function makeSuperVar()
{
	require("insert:./theVarComment.insert.js");
	return new Super(theVar);
}

require("after:./extendTheX.js");
require("later:./Super.class.js");
// Or 
// require("./Super.class.js");
```

If the ``replaceAllRequires`` option is set to ``true`` (default),
it is possible to use require without any prefix,
it will be replaced either by ``include`` or by
``includeLater`` depending on the position of the statement.

### The different inclusion types

Information about the documentation of the inclusion types:

- **Name**: The name of the inclusion type, also called a
position.
- **Statement**: The statement to use in the template, for example:
``<%=include("A.js")%>``
- **Require**: The prefix to use in the Javascript ``require``
function, for example: ``require("after:C.js")``

In the examples, an arrow between two files ``A``
and ``B`` means that ``A`` includes ``B``: (``A``&nbsp;*before*→&nbsp;``B``).

#### Before

| Name | Statement | Require |
| --- | --- | --- |
| **before** | ``include("<path>")``(\*) | ``require("<path>)``(\*)(\*\*)<br/>``require("before:<path>)`` |

| Description |
| --- |
| The default inclusion type. It includes the file before the parent, only if it was never included. |

| Example |
| --- |
| ``A``&nbsp;*before*→&nbsp;``B``&nbsp;*before*→&nbsp;``C`` = *``C B A``* |

(\*) *``require("<path>)`` and ``include("<path>")`` can only be*
*used at the beginning of the file, otherwise the file is included*
*later.*

(\*\*) *``require("<path>)`` is detected only if the*
*``replaceAllRequires`` option is set to ``ture`` (default).*

#### After

| Name | Statement | Require |
| --- | --- | --- |
| **after** | ``includeAfter("<path>")`` | ``require("after:<path>)`` |

| Description |
| --- |
| Includes the file right after the parent, only if it was never included. This is usefull when ``C`` extends the content of ``B`` and is required immediately when ``B`` is required. |

| Example |
| --- |
| ``A``&nbsp;*before*→&nbsp;``B``&nbsp;*after*→&nbsp;``C`` = *``B C A``* |

#### Later

| Name | Statement | Require |
| --- | --- | --- |
| **later** | ``includeAfter("<path>")``(\*) | ``require("<path>)``(\*\*)(\*\*\*)<br/>``require("later:<path>)`` |

| Description |
| --- |
| Includes the file later in the process, after the root of the inclusion tree was included, only if it was never included. In other words, when *grunt-and-sniff* find a **later** inclusion, it waits for every files that depend into the root file to be included. This is usefull when ``B`` requires ``C``, but not to read the ``B`` file. |

| Example |
| --- |
| ``A``&nbsp;*before*→&nbsp;``B``&nbsp;*later*→&nbsp;``C`` = *``B A C``* |

(\*) *``include("<path>)`` can also be used after the last before*
*inclusion at beginning of the file. However, it is recommended*
*to use ``includeAfter("<path>)``*

(\*\*) *``require("<path>)`` can only be used after the last before*
*inclusion at beginning of the file. It is recommended to use*
*this syntax at the end of the file. At this place, this is*
*obvious that the file is not included before.*

(\*\*\*) *``require("<path>)`` is detected only if the*
*``replaceAllRequires`` option is set to ``ture`` (default).*

#### Insert

| Name | Statement | Require |
| --- | --- | --- |
| **insert** | ``includeAfter("<path>")`` | ``require("insert:<path>)`` |

| Description |
| --- |
| Inserts the file at the position of the statement in the parent file, even if the file was already included. |

| Example |
| --- |
| **``A``** = ``var i = 0; require("insert:B") var k = 0;``<br/>**``B``** = ``var j = 1;``<br/>**Result** = ``var i = 0; var j = 1; var k = 0;`` |

#### Insert Once

| Name | Statement | Require |
| --- | --- | --- |
| **inertOnce** | ``includeAfter("<path>")`` | ``require("inertOnce:<path>)`` |

| Description |
| --- |
| Inserts the file at the position of the statement in the parent file, only if the file was never included. |

| Example |
| --- |
| **``A``** = ``var i = 0; require("insertOnce:B") var k = 0;``<br/>**``B``** = ``var j = 1;``<br/>**Result** (B was never included) = ``var i = 0; var j = 1; var k = 0;``<br/>**Result** (B was included) = ``var i = 0;  var k = 0;`` |

### The inclusion statements file positions

The **before** inclusions that are found in the files after
the begining of the file are converted to some *later* inclusions.

## Advanced Tasks

The *grunt-and-sniff* module offers a task system that adds some features to your project. To use the task system, simply register a task of *grunt-and-sniff* into grunt by using the ``GSTask#task`` (or ``GSTask#registerTask``) method:

```js
			// The *grunt-and-sniff* task name
gstask.task("exportMap",
			// The options passed to the task
		   {dest: PATH.DEST + "/test.filelist"})
grunt.registerTask("test", ["concat", "exportMap"]);
```

Each *grunt-and-sniff* task takes specific options.

### Task: exportMap

The *exportMap* task creates a text file with all the included files exported by *grunt-and-sniff* in order.

The options are:

- [**``dest``**]: The path of the destination file. By default it is the ``copyDest`` option of the *grunt-and-sniff* with the name of the package and the ``.filelist`` extension: ``<copyDest> "/" <pkgName> ".filelist"`` 
- [**``dir``** = ``copyDest``]: The path of the directory where the compiled files are exported. By default, it uses the ``copyDest`` option of the *grunt-and-sniff* ``GSTask`` object.

## Template

Every file that are processed with *grunt-and-sniff* can
access to the file data in a ``GSFileData`` object.
This provides a lot of information and also the inclusion
functions.

### GSFileData

This object provides usefull information passed in the
templates during the process, including
the state of the file that is included/processed.

| Name | Type | Description |
| --- | --- | --- |
***Paths***
| **passedPath** | String | The file path as passed to the require statement |
| **path** | String | The file path relative to the source directory path |
| **cwdPath** | String | The file path relative to the project root |
| **absPath** | String | The absolute file path |
| **dir** | String | The directory path relative to the project root |
| **dirPath** | String | The full directory path |
| **sourceDir** | String | The source directory of the project |
***File Info*** 
| **parent** | String/null | The path of the parent of the dependency, relative to the source directory path |
| **position** | String | The position of the file, i.e. the include type: ``"before"``, ``"insert"``, ``"insertOnce"``, ``"after"`` or ``"later"``. |
| **inserted** | uint | The number of files already included |
***Configuration*** 
| **pkg** | Object | The node.js project package |
| **config** | Object | The grunt config |
| **options** | GSOptions | The *grunt-and-sniff* options |
***Code Help***
| **$** | Object | An object passed to every files to write common functions and data |
| **debug** | Object | The debug function writes the message in the console |
| **tplOpen** | String | The opening of a template (``"<%"``) |
***Inclusions***
| **include** | Function | Includes a file before the current one |
| **includeAfter** | Function | Includes a file right after the current one |
| **includeLater** | Function | Includes a file after the root file was written |
| **insert** | Function | Inserts a file a the given position |
| **insertOnce** | Function | Inserts a file a the given position only if it was never inserted/included |