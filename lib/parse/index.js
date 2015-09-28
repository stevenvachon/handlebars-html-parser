"use strict";
var devlog     = require("./devlog");

var aliases    = require("./aliases");
var hbsUtil    = require("./hbsUtil");
var Node       = require("./Node");
var NodeType   = require("../NodeType");
var whitespace = require("./whitespace");

var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var eventAttributes = require("event-attributes");
var handlebars = require("handlebars");
var htmlparser2 = require("htmlparser2");
var postcss = require("postcss");
var uglify = require("uglify-js");

var uglifyOptions = {fromString:true};



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



function doneAsync(outputProgram, state, callback)
{
	if (--state.asyncOperations<=0 /*&& state.parsed===true*/)
	{
		callback(outputProgram);
	}
}



function getPreviousNode(outputProgram, offset)
{
	if (offset === undefined) offset = -1;
	
	return outputProgram[ outputProgram.length + offset ];
}



/*
	Minify JavaScript code if any and does not contain
	any Handlebars expressions.
	
	Note: call this before related "end" nodes.
*/
function maybeProcessScript(outputProgram, tempState, options)
{
	var prefix,previousNode,script,scriptTextNode;
	
	if (options.processJS === true)
	{
		scriptTextNode = getPreviousNode(outputProgram);
		
		if (scriptTextNode.type === NodeType.TEXT)
		{
			prefix = "";
			previousNode = getPreviousNode(outputProgram, -2);
			script = scriptTextNode.value;
			
			if (previousNode.type===NodeType.HTML_ATTR_VALUE_START && tempState.isScriptAttr===true)
			{
				
			}
			else if (previousNode.type===NodeType.HTML_ATTR_VALUE_START && tempState.isScriptLink===true)
			{
				// Remove prefix from the script
				prefix = "javascript:";
				script = script.substr(prefix.length);
			}
			else if (previousNode.type===NodeType.HTML_TAG_END && tempState.isScriptTag===true)
			{
				
			}
			else
			{
				// Nothing compatible to minify
				return;
			}
			
			// Check that the compiled code is valid
			try
			{
				Function("", script);
			}
			catch (error)
			{
				// Skip minification
				return;
			}
			
			scriptTextNode.value = prefix + uglify.minify(script, uglifyOptions).code;
		}
	}
}



/*
	Minify CSS code if any and does not contain
	any Handlebars expressions.
	
	Note: call this before related "end" nodes.
*/
function maybeProcessStyles(outputProgram, tempState, state, options, callback)
{
	var previousNode,styles,styleTextNode;
	
	if (options.processCSS === true)
	{
		styleTextNode = getPreviousNode(outputProgram);
		
		if (styleTextNode.type === NodeType.TEXT)
		{
			previousNode = getPreviousNode(outputProgram, -2);
			styles = styleTextNode.value;
			
			if (previousNode.type===NodeType.HTML_ATTR_VALUE_START && tempState.isStyleAttr===true)
			{
				
			}
			else if (previousNode.type===NodeType.HTML_TAG_END && tempState.isStyleTag===true)
			{
				
			}
			else
			{
				// Nothing compatible to minify
				return;
			}
			
			// Prevent final callback from running before async operations are complete
			state.asyncOperations++;
			
			// Asynchronous, but should be fine since we won't be working with this node again
			postcss([ autoprefixer, cssnano ]).process(styles).then( function(result)
			{
			    styleTextNode.value = result.css;
			    
			    doneAsync(outputProgram, state, callback);
			});
		}
	}
}



/*
	Add an empty text node if last pushed node was
	of a certain type.
*/
function maybePushEmptyTextNode(outputProgram)
{
	if (getPreviousNode(outputProgram).type === NodeType.HTML_ATTR_VALUE_START)
	{
		push( outputProgram, Node.TEXT("") );
	}
}



/*
	Add tag's closing bracket (`">"`) node and
	update state.
*/
function maybePushTagEndNode(outputProgram, tempState)
{
	if (tempState.unenclosedTag === true)
	{
		push( outputProgram, Node.HTML_TAG_END );
		tempState.unenclosedTag = false;
	}
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
	return new Promise( function(resolve, reject)
	{
		var hbsProgram,outputProgram;
		
		var state = 
		{
			asyncOperations: 0/*,
			parsed: false*/
		};
		
		//devlog.basic(template);
		
		hbsProgram = handlebars.parse(template);
		//devlog(hbsProgram);
		
		// Start with root-level (no children) program
		outputProgram = [];
		outputProgram = parseHtml(outputProgram, hbsProgram, state, options, resolve);
		//devlog(outputProgram);
		
		//state.parsed = true;
		
		if (state.asyncOperations <= 0)
		{
			resolve(outputProgram);
		}
	});
}



/*
	Convert any aliases into Handlebars, HTML or Text nodes.
*/
function parseAliases(outputProgram, hbsProgram, text, state, options, callback)
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
							parseHtml(outputProgram, statementProgram, state, options, callback);
							
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



function parseHtml(outputProgram, hbsProgram, state, options, callback)
{
	// TODO :: move `aliasedTemplate` to inside `write()`
	var aliasedTemplate = aliases.stringify(hbsProgram);
	var tempState = 
	{
		isScriptAttr: false,
		isScriptLink: false,
		isScriptTag: false,
		isStyleAttr: false,
		isStyleTag: false,
		unenclosedTag: false
	}
	
	//devlog.basic(aliasedTemplate);
	
	var htmlParser = new htmlparser2.Parser(
	{
		onopentagname: function(name)
		{
			maybePushTagEndNode(outputProgram, tempState);
			
			push( outputProgram, Node.HTML_TAG_START() );
			push( outputProgram, Node.HTML_TAG_NAME_START );
			
			parseAliases(outputProgram, hbsProgram, name, state, options, callback);
			
			push( outputProgram, Node.HTML_TAG_NAME_END );
			
			tempState.isScriptTag = name === "script";
			tempState.isStyleTag = name === "style";
			tempState.unenclosedTag = true;
		},
		onclosetag: function(name)
		{
			maybeProcessScript(outputProgram, tempState, options);
			maybeProcessStyles(outputProgram, tempState, state, options, callback);
			maybePushTagEndNode(outputProgram, tempState);
			
			push( outputProgram, Node.HTML_TAG_START(true) );
			push( outputProgram, Node.HTML_TAG_NAME_START );
			
			parseAliases(outputProgram, hbsProgram, name, state, options, callback);
			
			push( outputProgram, Node.HTML_TAG_NAME_END );
			push( outputProgram, Node.HTML_TAG_END );
			
			tempState.isScriptTag = false;
			tempState.isStyleTag = false;
		},
		onattribute: function(name, value)
		{
			if (eventAttributes.html[name]===true || eventAttributes.svg[name]===true)
			{
				tempState.isScriptAttr = true;
			}
			
			// TODO :: href values can be surrounded by spaces (`" javascript:"`)
			if (name==="href" && value.indexOf("javascript:")===0)
			{
				tempState.isScriptLink = true;
			}
			
			if (tempState.isScriptTag === true)
			{
				// If contains something other than JavaScript code
				// Covers: `type="text/javascript"`, `type=""`, `type`, `type="{{alias#}}"` and absent type attribute
				if (name==="type" && value.toLowerCase()!=="text/javascript" && value!=="")
				{
					// NOTE :: if tag were `<script type="not-js" type="text/javascript">`, the
					// second attribute is ignored by the browser.
					// htmlparser2 (v3.8.3) incorrectly does not ignore such.
					tempState.isScriptTag = false;
				}
			}
			
			if (name === "style")
			{
				tempState.isStyleAttr = true;
			}
			
			if (tempState.isStyleTag === true)
			{
				// If contains something other than CSS code
				// Covers: `type="text/css"`, `type=""`, `type`, `type="{{alias#}}"` and absent type attribute
				if (name==="type" && value.toLowerCase()!=="text/css" && value!=="")
				{
					// NOTE :: if tag were `<style type="not-css" type="text/css">`, the
					// second attribute is ignored by the browser.
					// htmlparser2 (v3.8.3) incorrectly does not ignore such.
					tempState.isStyleTag = false;
				}
			}
			
			push( outputProgram, Node.HTML_ATTR_START );
			push( outputProgram, Node.HTML_ATTR_NAME_START );
			
			parseAliases(outputProgram, hbsProgram, name, state, options, callback);
			
			push( outputProgram, Node.HTML_ATTR_NAME_END );
			push( outputProgram, Node.HTML_ATTR_VALUE_START );
			
			// TODO :: how to handle helper/block-wrapped attributes?
			parseAliases(outputProgram, hbsProgram, value, state, options, callback);
			
			maybePushEmptyTextNode(outputProgram);
			maybeProcessScript(outputProgram, tempState, options);
			maybeProcessStyles(outputProgram, tempState, state, options, callback);
			
			push( outputProgram, Node.HTML_ATTR_VALUE_END );
			push( outputProgram, Node.HTML_ATTR_END );
			
			tempState.isScriptAttr = false;
			tempState.isStyleAttr = false;
		},
		ontext: function(text)
		{
			maybePushTagEndNode(outputProgram, tempState);
			
			parseAliases(outputProgram, hbsProgram, text, state, options, callback);
		},
		oncomment: function(data)
		{
			// TODO :: IE conditional comments?
			if (options.ignoreHtmlComments !== true)
			{
				push( outputProgram, Node.HTML_COMMENT_START );
				
				parseAliases(outputProgram, hbsProgram, data, state, options, callback);
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
			maybePushTagEndNode(outputProgram, tempState);
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
