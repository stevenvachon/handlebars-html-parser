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



parser.beautifyJS = js => uglify.parse(js).print_to_string(
{
	beautify: true,
	comments: true,
	indent_level: 2
});



parser.each = callback =>
{
	return result => new Promise((resolve, reject) =>
	{
		each(result.program, result.options, callback);
		
		resolve(result.program);
	});
};



parser.type = NodeType;



parser.prototype.parse = function(template)
{
	return parse(template, this.options).then(program =>
	({
		program: program,
		options: this.options
	}));
};



module.exports = parser;
