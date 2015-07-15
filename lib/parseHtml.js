"use strict";
var devlog           = require("./devlog");

var Node               = require("./Node");
var NodeType           = require("./NodeType");
var splitAliases       = require("./splitAliases");
var stringifyProgram   = require("./stringifyProgram");
var whitespace         = require("./whitespace");

var htmlparser2 = require("htmlparser2");



/*
	Concat HTML text with any previous text node, or
	push a new one to the program.
*/
function concatOrPushTextNode(thisObj, part)
{
	//var previousPreviousNode;
	var previousNode = getPreviousNode(thisObj);
	
	// If previous node is also text -- likely caused by an infixed comment
	if (previousNode!==undefined && previousNode.type===NodeType.TEXT)
	{
		// Concatenate
		part = previousNode.text + part;
		
		// TODO :: check if not within <pre>
		if (thisObj.options.collapseWhitespace === true)
		{
			part = whitespace.collapse(part);
		}
		
		/*previousPreviousNode = getPreviousNode(thisObj, -2);
		
		// If previous node's previous node strips whitespace (on right)
		if (previousPreviousNode!==undefined && previousPreviousNode.stripWhitespace===true)
		{
			// Strip text on left
			part = whitespace.trimLeft(part);
		}*/
		
		previousNode.text = part;
	}
	else
	{
		// If previous node strips whitespace (on right)
		if (previousNode!==undefined && previousNode.stripWhitespace===true)
		{
			// Strip text on left
			part = whitespace.trimLeft(part);
		}
		
		// TODO :: check if not within <pre>
		if (thisObj.options.collapseWhitespace === true)
		{
			part = whitespace.collapse(part);
		}
		
		if (part !== "")
		{
			thisObj.newProgram.push( Node.TEXT(part) );
		}
	}
}



/*
	Add tag's closing bracket (`">"`) node.
*/
function encloseTag(thisObj, unenclosedTag)
{
	if (unenclosedTag === true)
	{
		thisObj.newProgram.push( Node.HTML_TAG_END );
		unenclosedTag = false;
	}
	
	return unenclosedTag;
}



function getPreviousNode(thisObj, offset)
{
	if (offset === undefined) offset = -1;
	
	return thisObj.newProgram[ thisObj.newProgram.length + offset ];
}



function maybeStripPreviousTextNode(thisObj, newNodeStart)
{
	var previousNode,text;
	
	if (newNodeStart.stripWhitespace === true)
	{
		previousNode = getPreviousNode(thisObj);
		
		// If previous node is text
		if (previousNode!==undefined && previousNode.type===NodeType.TEXT)
		{
			text = whitespace.trimRight(previousNode.text);
			
			if (text !== "")
			{
				previousNode.text = text;
			}
			else
			{
				// Remove empty text node
				thisObj.newProgram.pop();
			}
		}
	}
}



/*
	Convert any aliases into Handlebars, HTML or Text nodes.
*/
function parseAliases(thisObj, originalProgram, text)
{
	var i,newNodeStart,part,partType;
	var parts = splitAliases(text);
	var len = parts.length;
	
	for (i=0; i<len; i++)
	{
		part = parts[i];
		partType = typeof part;
		
		if (partType === "number")
		{
			// `part` is an alias index
			var statement = originalProgram.body[part];
			
			switch (statement.type)
			{
				case "BlockStatement":
				{
					if (statement.program !== undefined)
					{
						// No point continuing if there's nothing inside
						if (statement.program.body.length > 0)
						{
							newNodeStart = Node.HBS_TAG_START(statement);
							
							maybeStripPreviousTextNode(thisObj, newNodeStart);
							
							thisObj.newProgram.push( newNodeStart );
							thisObj.newProgram.push( Node.HBS_EXPRESSION(statement) );
							thisObj.newProgram.push( Node.HBS_TAG_END(statement) );
							
							// Handle any and all nested expressions
							parseHtml(thisObj, statement.program);
							
							thisObj.newProgram.push( Node.HBS_TAG_START(statement, true) );
							thisObj.newProgram.push( Node.HBS_EXPRESSION(statement) );
							thisObj.newProgram.push( Node.HBS_TAG_END(statement) );
						}
						else
						{
							devlog(["EMPTY STATEMENT?", statement]);
						}
					}
					else
					{
						//dispatch(thisObj, "hbsSectionStart", [statement.mustache.id.string, statement.mustache.params.parts]);
						devlog(["NO PROGRAM?", statement]);
					}
					break;
				}
				case "CommentStatement":
				{
					newNodeStart = Node.HBS_TAG_START(statement);
					
					maybeStripPreviousTextNode(thisObj, newNodeStart);
					
					if (thisObj.options.ignoreHbsComments !== true)
					{
						thisObj.newProgram.push( newNodeStart );
						
						thisObj.newProgram.push( Node.TEXT(statement.value) );
						
						thisObj.newProgram.push( Node.HBS_TAG_END(statement) );
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
					
					maybeStripPreviousTextNode(thisObj, newNodeStart);
					
					thisObj.newProgram.push( newNodeStart );
					thisObj.newProgram.push( Node.HBS_EXPRESSION(statement) );
					thisObj.newProgram.push( Node.HBS_TAG_END(statement) );
					break;
				}
				default:
				{
					devlog(["UNKNOWN?", statement]);
				}
			}
		}
		else if (partType==="string" || part instanceof String===true)
		{
			concatOrPushTextNode(thisObj, part);
		}
	}
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
			
			thisObj.newProgram.push( Node.HTML_TAG_START() );
			thisObj.newProgram.push( Node.HTML_TAG_NAME_START );
			
			parseAliases(thisObj, program, name);
			
			thisObj.newProgram.push( Node.HTML_TAG_NAME_END );
		},
		onclosetag: function(name)
		{
			unenclosedTag = encloseTag(thisObj, unenclosedTag);
			
			thisObj.newProgram.push( Node.HTML_TAG_START(true) );
			thisObj.newProgram.push( Node.HTML_TAG_NAME_START );
			
			parseAliases(thisObj, program, name);
			
			thisObj.newProgram.push( Node.HTML_TAG_NAME_END );
			thisObj.newProgram.push( Node.HTML_TAG_END );
		},
		onattribute: function(name, value)
		{
			thisObj.newProgram.push( Node.HTML_ATTR_START );
			thisObj.newProgram.push( Node.HTML_ATTR_NAME_START );
			
			parseAliases(thisObj, program, name);
			
			thisObj.newProgram.push( Node.HTML_ATTR_NAME_END );
			thisObj.newProgram.push( Node.HTML_ATTR_VALUE_START );
			
			// TODO :: how to handle value=='', aliases with no value and helper/block-wrapped attributes?
			parseAliases(thisObj, program, value);
			
			thisObj.newProgram.push( Node.HTML_ATTR_VALUE_END );
			thisObj.newProgram.push( Node.HTML_ATTR_END );
		},
		ontext: function(text)
		{
			unenclosedTag = encloseTag(thisObj, unenclosedTag);
			
			parseAliases(thisObj, program, text);
		},
		oncomment: function(data)
		{
			// TODO :: IE conditional comments?
			if (thisObj.options.ignoreHtmlComments !== true)
			{
				thisObj.newProgram.push( Node.HTML_COMMENT_START );
				
				parseAliases(thisObj, program, data);
			}
		},
		oncommentend: function()
		{
			if (thisObj.options.ignoreHtmlComments !== true)
			{
				thisObj.newProgram.push( Node.HTML_COMMENT_END );
			}
		},
		onprocessinginstruction: function(name, data)  // Doctypes and XML stuff
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
	htmlParser.end();  // Catch any unclosed tags
}



module.exports = parseHtml;
