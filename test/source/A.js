"use strict";

require("B.js");

<%=insert("specials/comment.insert.js", {str: $.testVar} /*testVar is passed in options*/)%>

B.violet = new Color(163, 112, 214);
B.hello = function()
{
	hello("B");
}

console.log("B.red", B.color().toString());

<%=insert("specials/comment.insert.js", {str: "Creates a random color"})%>
console.log("B.randomColor",
			B.randomColor().toString());

require("insertOnce: specials/Content.js" /*inserted*/);
require("insert: specials/Content.js"     /*inserted*/);
require("insertOnce: specials/Content.js" /*not inserted*/);

require("E.js");