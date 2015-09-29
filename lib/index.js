"use strict";
var each     = require("./each");
var NodeType = require("./NodeType");
var options  = require("./options");
var parse    = require("./parse");

var uglify = require("uglify-js");



function parser(_options)
{
	this.options = options(_options);
}



parser.beautifyJS = function(js)
{
	return uglify.parse(js).print_to_string(
	{
		beautify: true,
		comments: true,
		indent_level: 2
	});
};



parser.type = NodeType;



parser.prototype.parse = function(template, callback)
{
	var _options = this.options;
	
	return parse(template, _options).then( function(program)
	{
		if (callback !== undefined)
		{
			each(program, _options, callback);
		}
		
		return program;
	});
};



module.exports = parser;
