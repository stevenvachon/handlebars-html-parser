"use strict";
var devlog     = require("./devlog");

var aliases    = require("./aliases");
var hbsUtil    = require("./hbsUtil");
var Node       = require("./Node");
var NodeType   = require("../NodeType");
var whitespace = require("./whitespace");

var handlebars = require("handlebars");
var htmlparser2 = require("htmlparser2");



/*
	Concat HTML text with any previous text node, or
	push a new one to the program.
*/
function concatOrPushTextNode(outputProgram, part, options)
{
	//var previousPreviousNode;
	var previousNode = getPreviousNode(outputProgram);
	
	// If previous node is also text -- likely caused by an infixed comment
	if (previousNode!==undefined && previousNode.type===NodeType.TEXT)
	{
		// Concatenate
		part = previousNode.value + part;
		
		// TODO :: check if not within <pre>, <script>, <style>
		// TODO :: move to `.each()`?
		if (options.normalizeWhitespace === true)
		{
			part = whitespace.normalize(part);
		}
		
		/*previousPreviousNode = getPreviousNode(outputProgram, -2);
		
		// If previous node's previous node strips whitespace (on right)
		if (previousPreviousNode!==undefined && previousPreviousNode.stripWhitespace===true)
		{
			// Strip text on left
			part = whitespace.trimLeft(part);
		}*/
		
		previousNode.value = part;
	}
	else
	{
		// If previous node strips whitespace (on right)
		if (previousNode!==undefined && previousNode.stripWhitespace===true)
		{
			// Strip text on left
			part = whitespace.trimLeft(part);
		}
		
		// TODO :: check if not within <pre>, <script>, <style>
		// TODO :: move to `.each()`?
		if (options.normalizeWhitespace === true)
		{
			part = whitespace.normalize(part);
		}
		
		if (part !== "")
		{
			push( outputProgram, Node.TEXT(part) );
		}
	}
}



/*
	Add tag's closing bracket (`">"`) node.
*/
function encloseTag(outputProgram, unenclosedTag)
{
	if (unenclosedTag === true)
	{
		push( outputProgram, Node.HTML_TAG_END );
		unenclosedTag = false;
	}
	
	return unenclosedTag;
}



function getPreviousNode(outputProgram, offset)
{
	if (offset === undefined) offset = -1;
	
	return outputProgram[ outputProgram.length + offset ];
}



/*
	Strip whitespace from previous text node if specified node
	has whitespace control.
*/
function maybeStripPreviousTextNode(outputProgram, newNodeStart)
{
	var previousNode,text;
	
	if (newNodeStart.stripWhitespace === true)
	{
		previousNode = getPreviousNode(outputProgram);
		
		// If previous node is text
		if (previousNode!==undefined && previousNode.type===NodeType.TEXT)
		{
			text = whitespace.trimRight(previousNode.value);
			
			if (text !== "")
			{
				previousNode.value = text;
			}
			else
			{
				// Remove empty text node
				outputProgram.pop();
			}
		}
	}
}



/*
	Parse a template and return a linear program containing
	HTML pieces and Handlebars expressions.
*/
function parse(template, options)
{
	var hbsProgram,outputProgram;
	
	//devlog.basic(template);
	
	hbsProgram = handlebars.parse(template);
	//devlog(hbsProgram);
	
	// Start with root-level (no children) program
	outputProgram = [];
	outputProgram = parseHtml(outputProgram, hbsProgram, options);
	//devlog(outputProgram);
	
	return outputProgram;
}



/*
	Convert any aliases into Handlebars, HTML or Text nodes.
*/
function parseAliases(outputProgram, hbsProgram, text, options)
{
	var i,newNodeStart,numParts,part,partType,statement,statementProgram,statementType;
	var parts = aliases.split(text);
	
	numParts = parts.length;
	
	for (i=0; i<numParts; i++)
	{
		part = parts[i];
		partType = typeof part;
		
		// If alias index
		if (partType === "number")
		{
			statement     = hbsUtil.getStatement(hbsProgram, part);
			statementType = hbsUtil.getStatementType(statement);
			
			switch (statementType)
			{
				case "BlockStatement":
				{
					statementProgram = hbsUtil.getStatementProgram(statement);
					
					if (statementProgram !== null)
					{
						// No point continuing if there's nothing inside
						if (hbsUtil.programIsNotEmpty(statementProgram) === true)
						{
							newNodeStart = Node.HBS_TAG_START(statement);
							maybeStripPreviousTextNode(outputProgram, newNodeStart);
							
							push( outputProgram, newNodeStart );
							push( outputProgram, Node.HBS_EXPRESSION(statement) );
							push( outputProgram, Node.HBS_TAG_END(statement) );
							
							// Handle any and all nested expressions
							parseHtml(outputProgram, statementProgram, options);
							
							newNodeStart = Node.HBS_TAG_START(statement, true);
							maybeStripPreviousTextNode(outputProgram, newNodeStart);
							
							push( outputProgram, newNodeStart );
							push( outputProgram, Node.HBS_EXPRESSION(statement, true) );
							push( outputProgram, Node.HBS_TAG_END(statement, true) );
						}
						else
						{
							devlog(["EMPTY STATEMENT?", statement]);
						}
					}
					else
					{
						devlog(["NO PROGRAM?", statement]);
					}
					break;
				}
				case "CommentStatement":
				{
					newNodeStart = Node.HBS_TAG_START(statement);
					
					maybeStripPreviousTextNode(outputProgram, newNodeStart);
					
					if (options.ignoreHbsComments !== true)
					{
						if (options.convertHbsComments !== true)
						{
							push( outputProgram, newNodeStart );
							
							push( outputProgram, Node.TEXT(statement.value) );
							
							push( outputProgram, Node.HBS_TAG_END(statement) );
						}
						else if (options.ignoreHtmlComments !== true)
						{
							push( outputProgram, Node.HTML_COMMENT_START );
							
							push( outputProgram, Node.TEXT(statement.value) );
							
							push( outputProgram, Node.HTML_COMMENT_END );
						}
					}
					break;
				}
				case "ContentStatement":
				{
					// This type shouldn't end up here
					devlog(["CONTENT?", statement.string, statement]);
					break;
				}
				case "MustacheStatement":
				{
					newNodeStart = Node.HBS_TAG_START(statement);
					
					maybeStripPreviousTextNode(outputProgram, newNodeStart);
					
					push( outputProgram, newNodeStart );
					push( outputProgram, Node.HBS_EXPRESSION(statement) );
					push( outputProgram, Node.HBS_TAG_END(statement) );
					break;
				}
				default:
				{
					devlog(["UNKNOWN?", statement]);
				}
			}
		}
		// If text node
		else if (partType==="string" || part instanceof String===true)
		{
			concatOrPushTextNode(outputProgram, part, options);
		}
	}
}



function parseHtml(outputProgram, hbsProgram, options)
{
	// TODO :: move `aliasedTemplate` to inside `write()`
	var aliasedTemplate = aliases.stringify(hbsProgram);
	var unenclosedTag = false;
	
	//devlog.basic(aliasedTemplate);
	
	var htmlParser = new htmlparser2.Parser(
	{
		onopentagname: function(name)
		{
			encloseTag(outputProgram, unenclosedTag);
			unenclosedTag = true;
			
			push( outputProgram, Node.HTML_TAG_START() );
			push( outputProgram, Node.HTML_TAG_NAME_START );
			
			parseAliases(outputProgram, hbsProgram, name, options);
			
			push( outputProgram, Node.HTML_TAG_NAME_END );
		},
		onclosetag: function(name)
		{
			unenclosedTag = encloseTag(outputProgram, unenclosedTag);
			
			push( outputProgram, Node.HTML_TAG_START(true) );
			push( outputProgram, Node.HTML_TAG_NAME_START );
			
			parseAliases(outputProgram, hbsProgram, name, options);
			
			push( outputProgram, Node.HTML_TAG_NAME_END );
			push( outputProgram, Node.HTML_TAG_END );
		},
		onattribute: function(name, value)
		{
			push( outputProgram, Node.HTML_ATTR_START );
			push( outputProgram, Node.HTML_ATTR_NAME_START );
			
			parseAliases(outputProgram, hbsProgram, name, options);
			
			push( outputProgram, Node.HTML_ATTR_NAME_END );
			push( outputProgram, Node.HTML_ATTR_VALUE_START );
			
			// TODO :: how to handle value=='', aliases with no value and helper/block-wrapped attributes?
			parseAliases(outputProgram, hbsProgram, value, options);
			
			push( outputProgram, Node.HTML_ATTR_VALUE_END );
			push( outputProgram, Node.HTML_ATTR_END );
		},
		ontext: function(text)
		{
			unenclosedTag = encloseTag(outputProgram, unenclosedTag);
			
			parseAliases(outputProgram, hbsProgram, text, options);
		},
		oncomment: function(data)
		{
			// TODO :: IE conditional comments?
			if (options.ignoreHtmlComments !== true)
			{
				push( outputProgram, Node.HTML_COMMENT_START );
				
				parseAliases(outputProgram, hbsProgram, data, options);
			}
		},
		oncommentend: function()
		{
			if (options.ignoreHtmlComments !== true)
			{
				push( outputProgram, Node.HTML_COMMENT_END );
			}
		},
		onprocessinginstruction: function(name, data)  // Doctypes and XML stuff
		{
			unenclosedTag = encloseTag(outputProgram, unenclosedTag);
		},
		onerror: function(error)
		{
			throw error;
		}
	}, options.htmlParser);
	
	htmlParser.write(aliasedTemplate);
	htmlParser.end();  // Catch any unclosed tags
	
	return outputProgram;
}



/*
	Push content or elements of an array to a target array.
*/
function push(array, content)
{
	var i,numElements;
	
	if (Array.isArray(content) === false)
	{
		array.push(content);
	}
	else
	{
		numElements = content.length;
		
		for (i=0; i<numElements; i++)
		{
			array.push( content[i] );
		}
	}
}



module.exports = parse;
