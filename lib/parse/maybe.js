"use strict";
var Node       = require("./Node");
var NodeType   = require("../NodeType");
var push       = require("./push");
var whitespace = require("./whitespace");

var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var postcss = require("postcss");
var uglify = require("uglify-js");

var uglifyOptions = {fromString:true};



function getPreviousNode(env, offset)
{
	if (offset === undefined) offset = -1;
	
	return env.outputProgram[ env.outputProgram.length + offset ];
}



/*
	Concat HTML text with any previous text node, or
	push a new one to the program.
*/
function maybeConcatOrPushTextNode(part, env)
{
	//var previousPreviousNode;
	var previousNode = getPreviousNode(env);
	
	// If previous node is also text -- likely caused by an infixed comment
	if (previousNode!==undefined && previousNode.type===NodeType.TEXT)
	{
		// Concatenate
		part = previousNode.value + part;
		
		// TODO :: check if not within <pre>, <script>, <style>
		if (env.options.normalizeWhitespace === true)
		{
			part = whitespace.normalize(part);
		}
		
		/*previousPreviousNode = getPreviousNode(env, -2);
		
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
		if (env.options.normalizeWhitespace === true)
		{
			part = whitespace.normalize(part);
		}
		
		if (part !== "")
		{
			push(Node.TEXT(part), env);
		}
	}
}



/*
	Add an empty text node if last pushed node was
	of a certain type.
*/
function maybePushEmptyTextNode(env)
{
	if (getPreviousNode(env).type === NodeType.HTML_ATTR_VALUE_START)
	{
		push(Node.TEXT(""), env);
	}
}



/*
	Minify JavaScript code if any and does not contain
	any Handlebars expressions.
	
	Note: call this before related "end" nodes.
*/
function maybeProcessScript(env)
{
	var currentState,prefix,previousNode,script,scriptTextNode;
	
	if (env.options.processJS === true)
	{
		scriptTextNode = getPreviousNode(env);
		
		if (scriptTextNode.type === NodeType.TEXT)
		{
			currentState = env.getState();
			prefix = "";
			previousNode = getPreviousNode(env, -2);
			script = scriptTextNode.value;
			
			if (previousNode.type===NodeType.HTML_ATTR_VALUE_START && currentState.isScriptAttr===true)
			{
				
			}
			else if (previousNode.type===NodeType.HTML_ATTR_VALUE_START && currentState.isScriptLink===true)
			{
				// Remove prefix from the script
				prefix = "javascript:";
				script = script.substr(prefix.length);
			}
			else if (previousNode.type===NodeType.HTML_TAG_END && currentState.isScriptTag===true)
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
function maybeProcessStyles(env)
{
	var currentState,previousNode,styles,styleTextNode;
	
	if (env.options.processCSS === true)
	{
		styleTextNode = getPreviousNode(env);
		
		if (styleTextNode.type === NodeType.TEXT)
		{
			currentState = env.getState();
			previousNode = getPreviousNode(env, -2);
			styles = styleTextNode.value;
			
			if (previousNode.type===NodeType.HTML_ATTR_VALUE_START && currentState.isStyleAttr===true)
			{
				
			}
			else if (previousNode.type===NodeType.HTML_TAG_END && currentState.isStyleTag===true)
			{
				
			}
			else
			{
				// Nothing compatible to minify
				return;
			}
			
			return postcss([ autoprefixer, cssnano ]).process(styles).then( function(result)
			{
			    styleTextNode.value = result.css;
			});
		}
	}
	
	// Chainable
	return Promise.resolve();
}



/*
	Strip whitespace from previous text node if specified node
	has whitespace control.
*/
function maybeStripPreviousTextNode(newNodeStart, env)
{
	var previousNode,text;
	
	if (newNodeStart.stripWhitespace === true)
	{
		previousNode = getPreviousNode(env);
		
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
				env.outputProgram.pop();
			}
		}
	}
}



module.exports = 
{
	concatOrPushTextNode: maybeConcatOrPushTextNode,
	processScript: maybeProcessScript,
	processStyles: maybeProcessStyles,
	pushEmptyTextNode: maybePushEmptyTextNode,
	stripPreviousTextNode: maybeStripPreviousTextNode
};
