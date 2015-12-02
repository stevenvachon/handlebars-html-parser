"use strict";
var each         = require("./each");
var NodeType     = require("./NodeType");
var parse        = require("./parse");
var parseOptions = require("./parseOptions");

var uglify = require("uglify-js");



function parser(options)
{
	this.options = parseOptions(options);
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



parser.each = function(callback)
{
	return function(result)
	{
		each(result.program, result.options, callback);
		
		// Chainable
		return Promise.resolve();
	};
};



parser.type = NodeType;



parser.prototype.parse = function(template)
{
	var options = this.options;
	
	return parse(template, options).then( function(program)
	{
		return { program:program, options:options };
	});
};



module.exports = parser;
