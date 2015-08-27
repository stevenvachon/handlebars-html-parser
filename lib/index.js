"use strict";
var devlog    = require("./devlog");
var NodeType  = require("./NodeType");
var parseHtml = require("./parseHtml");

var handlebars = require("handlebars");
var objectAssign = require("object-assign");

var defaultOptions = 
{
	htmlParser:
	{
		decodeEntities: true,
		recognizeSelfClosing: true
	},
	ignoreHbsComments: false,
	ignoreHtmlComments: false,
	mustacheOnly: false,
	normalizeWhitespace: false
};



function parser(options)
{
	this.options = objectAssign({}, defaultOptions, options);
}



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
