"use strict";



/*
	Collapse multiple whitespace characters to
	a single space.
	
	Serves as simple HTML minification.
	
	Note: 0xA0 or &nbsp; (non-breaking space)
	and 0xFEFF or &#65279; (zero-width non-breaking space)
	and 0x200B or &#8203; (zero-width breaking space)
	will not be altered.
*/
function collapse(str)
{
	return str
	       .replace(/[\n\r\t]+/g, " ")  // convert non-spaces to spaces
	       .replace(/[ ]+/g, " ");      // convert multiple spaces to single
}



/*
	Remove whitespace from the left side of a string.
*/
function trimLeft(str)
{
	return str.replace(/^\s+/g, "");
}



/*
	Remove whitespace from the right side of a string.
*/
function trimRight(str)
{
	return str.replace(/\s+$/g, "");
}



module.exports = 
{
	collapse: collapse,
	trimLeft: trimLeft,
	trimRight: trimRight
};
