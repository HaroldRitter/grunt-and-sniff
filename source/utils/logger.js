const logger = new (require("easyft-logger"))();

/*
* The grunt warn triggers the message modfied
* with msgCB if a warning is called during the
* execution of the cb callback.
*/
logger.gruntWarnModifier = function(grunt, msgCB, cb)
{
	var res;
	// Gets the warn method
	const w = grunt.warn;

	try
	{
		// Modifies the warn method
		grunt.warn = (e, code) =>
		{
			e.message = msgCB(e, code);
			w.call(grunt, e, code);
		};
	
		// Launches the code
		res = cb();
	}
	catch(e)
	{
		// Restores the warn method 
		grunt.warn = w;
		throw e;	
	}
	
	// Restores the warn method 
	grunt.warn = w;
	
	return res;
};

module.exports = logger;