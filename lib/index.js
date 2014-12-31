"use strict";
var handlebars = require("handlebars");
var htmlparser2 = require("htmlparser2");
var objectAssign = require("object-assign");

var NodeTypes = require("./nodeTypes");

var log = require("../test/devlog.js").log;

var defaultHandlers = 
{
	error: skip,
	hbsComment: skip,
	hbsHelperEnd: skip,
	hbsHelperStart: skip,
	hbsSectionEnd: skip,
	hbsSectionStart: skip,
	hbsVariable: skip,
	htmlAttributeEnd: skip,
	htmlAttributeStart: skip,
	htmlAttributeValue: skip,
	htmlComment: skip,
	htmlTagEnd: skip,
	htmlTagStart: skip,
	processingInstruction: skip,
	text: skip
};

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



/*function dispatch(thisObj, event, args)
{
	if (typeof thisObj.handlers[event] === "function")
	{
		thisObj.handlers[event].apply(thisObj, args);
	}
}



function parseProgram(thisObj, program)
{
	program.statements.forEach( function(statement)
	{
		switch (statement.type)
		{
			case "content":
			{
				// TODO :: use statement.original?
				thisObj.htmlParser.write(statement.string);
				break;
			}
			case "mustache":
			{
				dispatch(thisObj, "hbsVariable", [statement.id.string]);
				break;
			}
			case "block":
			{
				if (statement.mustache.isHelper)
				{
					// No point continuing if there's nothing inside
					if (statement.program.statements.length)
					{
						var params = statement.mustache.params.map( function(param){ return param.string });
						
						dispatch(thisObj, "hbsHelperStart", [statement.mustache.id.string, params]);
						
						// Handle any and all nested helpers
						//parseProgram(thisObj, statement.program);
						
						dispatch(thisObj, "hbsHelperEnd", [statement.mustache.id.string]);
					}
					else
					{
						log(statement);
					}
				}
				else
				{
					//dispatch(thisObj, "hbsSectionStart", [statement.mustache.id.string, statement.mustache.params.parts]);
					log(statement);
				}
				
				break;
			}
			default:
			{
				log(statement.type);
			}
		}
	});
}*/



/*function parseTemplate(thisObj, input)
{
	thisObj.htmlParser = new htmlparser2.Parser(
	{
		onopentagname: function(name)
		{
			dispatch(thisObj, "htmlTagStart", [name]);
		},
		onclosetag: function(name)
		{
			dispatch(thisObj, "htmlTagEnd", [name]);
		},
		onattribute: function(name, value)
		{
			dispatch(thisObj, "htmlAttributeStart", [name, value]);
		},
		ontext: function(text)
		{
			dispatch(thisObj, "text", [text]);
		},
		oncomment: function(data)
		{
			
		},
		oncommentend: function()
		{
			
		},
		onerror: function(error)
		{
			console.log("error");
		}
	},{
		recognizeSelfClosing: true
	});
	
	thisObj.htmlParser.write(input);
	
	//parseProgram(thisObj, handlebars.parse(input));
	
	thisObj.htmlParser.end();
}*/



function feedHtmlParser(thisObj, input)
{
	thisObj.htmlParser.write(input);
	// Catch any unclosed tags
	thisObj.htmlParser.end();
	// Ready for next write
	thisObj.htmlParser.reset();
}



function initHtmlParser(thisObj)
{
	var currentElement;
	
	return new htmlparser2.Parser(
	{
		onopentagname: function(name)
		{
			currentElement = NodeTypes.HTMLElement(name, [], null);
			
			// TODO :: how to handle nested elements?
			thisObj.syntaxTree.push(currentElement);
			
			// TEMP
			thisObj.handlers.htmlTagStart(name);
		},
		onclosetag: function(name)
		{
			currentElement = null;
			
			// TEMP
			thisObj.handlers.htmlTagEnd(name);
		},
		onattribute: function(name, value)
		{
			currentElement.attributes.push( NodeTypes.HTMLAttribute(name, value) );
			
			// TEMP
			thisObj.handlers.htmlAttributeStart(name, value);
		},
		ontext: function(text)
		{
			thisObj.syntaxTree.push( NodeTypes.Text(text) );
			
			// TEMP
			thisObj.handlers.text(text);
		},
		oncomment: function(data)
		{
			thisObj.syntaxTree.push( NodeTypes.HTMLComment(data) );
			
			// TEMP
			console.log("commentStart");
		},
		oncommentend: function()
		{
			console.log("commentEnd");
		},
		onprocessinginstruction: function(name, data)	// Doctypes and XML stuff
		{
			// It is possible, however unlikely, that the value of `handlers.error` could be changed
			// by a user, so it is placed in here rather than `onerror: thisObj.handlers.error`
			thisObj.handlers.processingInstruction(name, data);
		},
		onerror: function(error)
		{
			// See `onprocessinginstruction`
			thisObj.handlers.error(error);
		}
	}, thisObj.options.htmlParser);
}



function skip()
{
	// Do nothing
}



/*
	Shallow-convert a Handlebars syntax tree (parsed template) back into a string.
	Expressions are converted to aliases so that a "forgiving" HTML parser can
	avoid issues:
	
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



function parser(handlers, options)
{
	this.handlers = objectAssign({}, defaultHandlers, handlers);
	this.options  = objectAssign({}, defaultOptions,  options);
	
	this.htmlParser = initHtmlParser(this);
}



parser.prototype.parse = function(input)
{
	this.program = handlebars.parse(input);
	this.syntaxTree = [];
	
	feedHtmlParser( this, stringifyProgram(this.program) );
};



module.exports = parser;
