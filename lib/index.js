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



parser.prototype.parse = function(template, callback)
{
	var _options = this.options;
	
	parse(template, _options).then( function(program)
	{
		each(program, _options, callback);
	});
};



module.exports = parser;
