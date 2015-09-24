"use strict";
var each     = require("./each");
var NodeType = require("./NodeType");
var options  = require("./options");
var parse    = require("./parse");



function parser(_options)
{
	this.options = options(_options);
	
	// Convenience
	this.type = parser.type;
}



parser.type = NodeType;



parser.prototype.parse = function(input, callback)
{
	var program = parse(input, this.options);
	
	if (typeof callback === "function")
	{
		each(program, this.options, callback);
	}
	
	return program;
};



module.exports = parser;
