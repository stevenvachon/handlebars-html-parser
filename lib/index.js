"use strict";
var handlebars = require("handlebars");
var htmlparser2 = require("htmlparser2");
var objectAssign = require("object-assign");

var devlog = require("./devlog");
var Nodes = require("./Nodes");
var NodeTypes = require("./NodeTypes");


var aliasPattern = new RegExp([
	"([^{]+)?",						// any text, affixed or otherwise (not required)
	"(?:\\{\\{alias([\\d]+)}})?"	// alias (not required)
].join(""), "g");

var defaultOptions = 
{
	collapseWhitespace: false,
	htmlParser:
	{
		decodeEntities: true,
		recognizeSelfClosing: true
	},
	ignoreComments: false,
	mustacheOnly: false
};



/*
	Add tag's closing bracket (">") node.
*/
function encloseTag(thisObj, unenclosedTag)
{
	if (unenclosedTag === true)
	{
		thisObj.newProgram.push( Nodes.HTML_TAG_END );
		unenclosedTag = false;
	}
	
	return unenclosedTag;
}



/*
	Turn any aliases into Handlebars, HTML or Text nodes.
*/
function parseAliases(thisObj, originalProgram, text)
{
	splitAliases(text).forEach( function(part)
	{
		switch (typeof part)
		{
			case "number":
			{
				// `part` is an alias index
				var statement = originalProgram.statements[part];
				
				switch (statement.type)
				{
					case "block":
					{
						if (statement.mustache.isHelper === true)
						{
							// No point continuing if there's nothing inside
							if (statement.program.statements.length > 0)
							{
								thisObj.newProgram.push( Nodes.HBS_HELPER_START(statement) );
								
								// Handle any and all nested expressions
								parseHtml(thisObj, statement.program);
								
								thisObj.newProgram.push( Nodes.HBS_HELPER_END(statement) );
							}
							else
							{
								devlog(["EMPTY STATEMENT?", statement]);
							}
						}
						else
						{
							//dispatch(thisObj, "hbsSectionStart", [statement.mustache.id.string, statement.mustache.params.parts]);
							devlog(["NOT HELPER", statement]);
						}
						break;
					}
					case "comment":
					{
						if (thisObj.options.ignoreComments !== true)
						{
							thisObj.newProgram.push( Nodes.HBS_COMMENT_START );
							thisObj.newProgram.push( Nodes.TEXT(statement.comment) );
							thisObj.newProgram.push( Nodes.HBS_COMMENT_END );
						}
						break;
					}
					case "content":
					{
						// This type shouldn't end up here
						devlog(["HUH?", statement.string, statement]);
						break;
					}
					case "mustache":
					{
						thisObj.newProgram.push( Nodes.HBS_VARIABLE(statement) );
						break;
					}
					default:
					{
						devlog(["DUNNO", statement]);
					}
				}
				
				break;
			}
			case "string":
			{
				thisObj.newProgram.push( Nodes.TEXT(part) );
				break;
			}
		}
	});
}



function parseHtml(thisObj, program)
{
	// TODO :: move `input` to inside `write()`
	var input = stringifyProgram(program);
	var unenclosedTag = false;
	
	devlog.basic(input);
	
	var htmlParser = new htmlparser2.Parser(
	{
		onopentagname: function(name)
		{
			encloseTag(thisObj, unenclosedTag);
			unenclosedTag = true;
			
			thisObj.newProgram.push( Nodes.HTML_TAG_START() );
			thisObj.newProgram.push( Nodes.HTML_TAG_NAME_START );
			
			parseAliases(thisObj, program, name);
			
			thisObj.newProgram.push( Nodes.HTML_TAG_NAME_END );
		},
		onclosetag: function(name)
		{
			unenclosedTag = encloseTag(thisObj, unenclosedTag);
			
			thisObj.newProgram.push( Nodes.HTML_TAG_START(true) );
			thisObj.newProgram.push( Nodes.HTML_TAG_NAME_START );
			
			parseAliases(thisObj, program, name);
			
			thisObj.newProgram.push( Nodes.HTML_TAG_NAME_END );
			thisObj.newProgram.push( Nodes.HTML_TAG_END );
		},
		onattribute: function(name, value)
		{
			thisObj.newProgram.push( Nodes.HTML_ATTR_START );
			thisObj.newProgram.push( Nodes.HTML_ATTR_NAME_START );
			
			parseAliases(thisObj, program, name);
			
			thisObj.newProgram.push( Nodes.HTML_ATTR_NAME_END );
			thisObj.newProgram.push( Nodes.HTML_ATTR_VALUE_START );
			
			// TODO :: how to handle value=='', aliases with no value and helper/block-wrapped attributes?
			parseAliases(thisObj, program, value);
			
			thisObj.newProgram.push( Nodes.HTML_ATTR_VALUE_END );
			thisObj.newProgram.push( Nodes.HTML_ATTR_END );
		},
		ontext: function(text)
		{
			unenclosedTag = encloseTag(thisObj, unenclosedTag);
			
			parseAliases(thisObj, program, text);
		},
		oncomment: function(data)
		{
			if (thisObj.options.ignoreComments !== true)
			{
				thisObj.newProgram.push( Nodes.HTML_COMMENT_START );
				
				parseAliases(thisObj, program, data);
			}
		},
		oncommentend: function()
		{
			if (thisObj.options.ignoreComments !== true)
			{
				thisObj.newProgram.push( Nodes.HTML_COMMENT_END );
			}
		},
		onprocessinginstruction: function(name, data)	// Doctypes and XML stuff
		{
			unenclosedTag = encloseTag(thisObj, unenclosedTag);
		},
		onerror: function(error)
		{
			// It is possible, however unlikely, that the value of `handlers.error` could be changed
			// by a user, so it is placed in here rather than `onerror: thisObj.handlers.error`
			//thisObj.handlers.error(error);
			throw error;
		}
	}, thisObj.options.htmlParser);
	
	htmlParser.write(input);
	// Catch any unclosed tags
	htmlParser.end();
}



/*
	Separate alias indexes from text. Parses:
	
	"prefix{{alias0}}infix{{alias1}}suffix"
	
	into:
	
	["prefix", 0, "infix", 1, "suffix"]
	
	Uses regexp instead of Handlebars for speed.
*/
function splitAliases(text)
{
	var part, parts=[];
	
	// Merely a precaution, and unlikely to be necessary for its purpose
	if (typeof text === "string")
	{
		// Reset any iterations
		aliasPattern.lastIndex = 0;
		
		// Repeat regexp until end of string or error
		while ( (part = aliasPattern.exec(text)) !== null )
		{
			// If matched anything
			if (part[0] !== "")
			{
				// Text
				if (part[1]) parts.push( part[1] );
				
				// Alias -- parseInt is slower than multiplication
				if (part[2]) parts.push( part[2] * 1 );
			}
			else
			{
				// Went beyond end of string
				break;
			}
		}
	}
	
	return parts;
}



/*
	Shallow-convert a Handlebars syntax tree (parsed template) back into a string with
	expressions converted to aliases so that a "forgiving" HTML parser can avoid issues:
	
	<{{tag}} {{#if something}}attr="{{attr}}"{{/if}}>content</{{tag}}>
	
	is converted to:
	
	<{{alias0}} {{alias1}}>content</{{alias2}}>
	
	Note: nested programs are not converted
*/
function stringifyProgram(program)
{
	var html = "";
	
	program.statements.forEach( function(statement, i)
	{
		if (statement.type === "content")
		{
			html += statement.string;
		}
		else
		{
			html += "{{alias"+i+"}}";
		}
	});
	
	return html;
}



// Public API



function parser(options)
{
	this.options = objectAssign({}, defaultOptions, options);
}



parser.types = NodeTypes;



/*
	Build a linear program of HTML pieces and Handlebars expressions.
*/
parser.prototype.parse = function(input)
{
	devlog.basic(input);
	
	this.orgProgram = handlebars.parse(input);
	this.newProgram = [];
	
	// Used for iterating through Handlebars statements within `orgProgram`
	this.orgProgramCurrent = null;
	
	// Convenience
	this.types = parser.types;
	
	// Start with root-level (no children) program
	parseHtml(this, this.orgProgram);
	
	// TODO :: loop through newProgram in test
	devlog(this.newProgram);
};



module.exports = parser;
