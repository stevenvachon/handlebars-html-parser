"use strict";
var devlog    = require("./devlog");
var each      = require("./each");
var NodeType  = require("./NodeType");
var parseHtml = require("./parseHtml");

var handlebars = require("handlebars");
var objectAssign = require("object-assign");

var defaultOptions = 
{
	// Undocumented
	// TODO :: this isn't cloned
	htmlParser:
	{
		decodeEntities: true,
		lowerCaseAttributeNames: true,
		lowerCaseTags: true,
		recognizeSelfClosing: true
	},
	
	// Documented
	ignoreHbsComments: false,
	ignoreHtmlComments: false,
	normalizeWhitespace: false,
	xmlMode: false
};



function parser(options)
{
	this.options = objectAssign({}, defaultOptions, options);
	
	this.options.htmlParser.xmlMode = this.options.xmlMode;
	
	if (this.options.xmlMode === true)
	{
		this.options.htmlParser.lowerCaseAttributeNames = true;
		this.options.htmlParser.lowerCaseTags = true;
	}
}



parser.each = each;
parser.type = NodeType;



/*
	Build a linear program of HTML pieces and Handlebars expressions.
*/
parser.prototype.parse = function(input)
{
	//devlog.basic(input);
	
	this.orgProgram = handlebars.parse(input);
	this.newProgram = [];
	
	// Used for iterating through Handlebars statements within `orgProgram`
	//this.orgProgramCurrent = null;
	
	// Convenience
	this.type = parser.type;
	
	// Start with root-level (no children) program
	parseHtml(this, this.orgProgram);
	
	//devlog(this.orgProgram);
	
	// TODO :: loop through newProgram in test
	//devlog(this.newProgram);
	
	// ?
	return this.newProgram;
};



module.exports = parser;
