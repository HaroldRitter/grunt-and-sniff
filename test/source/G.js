"use strict";

require("D.js");

function Tree(size, leafColor)
{
	this.size = size;
	this.leafColor = leafColor || Tree.defaultLeafColor;
}

Tree.defaultLeafColor = new Color(123, 197, 78);