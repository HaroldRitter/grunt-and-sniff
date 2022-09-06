"use strict";

require("D.js");

<%=debug("Declares the comment template function")%>
<%
// Defines the comment method
$.comment = function(str)
{
	return "/* \\_) " +
	str.replace("/*", "/ *") +
	" (_/ */";
};
%>
require("after:F.js");
require("later:G.js");

var B =
{
	randomTree: function()
	{
		return new Tree(2 + Math.random() * 5,
			new Color.random(parseInt(Math.random()*256),
							parseInt(Math.random()*256),
							parseInt(Math.random()*256)));
	}
};

require("later:C.js");

B.yellow = new Color(255, 255, 0);