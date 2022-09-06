"use strict";

function Fox(name)
{
	this.name = name || "Foxy";
}

Fox.prototype.makeNoise = function()
{
	console.log("I do not know how it sounds.");
};