"use strict";
var devlog    = require("./devlog");
var each      = require("./each");
var NodeType  = require("./NodeType");
var parseHtml = require("./parseHtml");

var handlebars = require("handlebars");
var objectAssign = require("object-assign");

var defaultOptions = 
{
	convertHbsComments: false,
	ignoreHbsComments: false,
	ignoreHtmlComments: false,
	normalizeWhitespace: false,
	xmlMode: false
};

var htmlParserOptions = 
{
	decodeEntities: true,
	lowerCaseAttributeNames: true,  // TODO :: what about inline SVG?
	lowerCaseTags: true,  // TODO :: what about inline SVG?
	recognizeSelfClosing: true,
	xmlMode: false
};



function parser(options)
{
	this.options = objectAssign({}, defaultOptions, options);
	
	this.options.htmlParser = objectAssign({}, htmlParserOptions);
	
	if (this.options.xmlMode === true)
	{
		this.options.htmlParser.lowerCaseAttributeNames = false;
		this.options.htmlParser.lowerCaseTags = false;
		this.options.htmlParser.xmlMode = true;
	}
	
	// Convenience
	this.type = parser.type;
}



parser.type = NodeType;



/*
	Run a provided function once per element in a linear program containing
	HTML pieces and Handlebars expressions.
*/
parser.prototype.parse = function(input, callback)
{
	//devlog.basic(input);
	
	var orgProgram = handlebars.parse(input);
	//devlog(orgProgram);
	
	// Start with root-level (no children) program
	var newProgram = parseHtml([], orgProgram, this.options);
	//devlog(newProgram);
	
	if (typeof callback === "function")
	{
		each(newProgram, this.options, callback);
	}
	
	// For testing and curious minds
	return newProgram;
};



module.exports = parser;
