"use strict";

const readonly = require("./utils/readonly");

var GSIncType =
{
	// Gets the name of the position from the include type:
	// "before", "after", "later", "insert" or "insertOnce".
	// The default include type is "before".
	toString: function(incType)
	{
		return incType === GSIncType.LATER ? "later" :
					incType === GSIncType.AFTER ? "after" :
						incType === GSIncType.INSERT ? "insert" :
							incType === GSIncType.INSERT_ONCE ? "insertOnce" :
								"before";
	},

	// Gets the include type from the argument
	get: function(incType)
	{
		if(	typeof(incType) !== "number" ||
			// Does not use => and <= because it
			// does not work if the indices change
			incType != GSIncType.AFTER &&
			incType != GSIncType.LATER &&
			incType != GSIncType.INSERT &&
			incType != GSIncType.INSERT_ONCE)
		{
			return GSIncType.BEFORE;
		}
		return incType;
	}
};

readonly(GSIncType,
{
	BEFORE: 		  0,
	AFTER: 			  1,
	LATER: 			  2,
	INSERT: 		  3,
	INSERT_ONCE: 	  4
});

module.exports = GSIncType;