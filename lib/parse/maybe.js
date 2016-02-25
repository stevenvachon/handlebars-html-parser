"use strict";
var Node     = require("./Node");
var NodeType = require("../NodeType");
var push     = require("./push");

var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var normalizeWhitespace = require("normalize-html-whitespace");
var postcss = require("postcss");
var trimLeft = require("trim-left");
var trimRight = require("trim-right");
var uglify = require("uglify-js");

var uglifyOptions = { fromString:true };



/*
	Get node from the top of the stack.
*/
function getTopNode(env, offset)
{
	if (offset === undefined) offset = 0;
	
	return env.outputProgram[ env.outputProgram.length - 1 + offset ];
}



/*
	Concat HTML text with any previous text node, or
	push a new one to the program.
*/
function maybeConcatOrPushTextNode(part, env)
{
	var lastNode = getTopNode(env);
	
	// If previous node is also text -- likely caused by an infixed comment
	if (lastNode!==undefined && lastNode.type===NodeType.LITERAL)
	{
		// Concatenate
		part = lastNode.value + part;
		
		if (env.options.normalizeWhitespace===true && env.isPreformatted()===false)
		{
			part = normalizeWhitespace(part);
		}
		
		lastNode.value = part;
	}
	else
	{
		// If previous node strips whitespace (on right)
		if (lastNode!==undefined && lastNode.strip===true)
		{
			// Strip text on left
			part = trimLeft(part);
		}
		
		if (env.options.normalizeWhitespace===true && env.isPreformatted()===false)
		{
			part = normalizeWhitespace(part);
		}
		
		if (part !== "")
		{
			push(Node.LITERAL(part), env);
		}
	}
}



/*
	Remove the last node if it is empty text.
*/
function maybePopEmptyTextNode(env)
{
	var lastNode = getTopNode(env);
	
	if (lastNode!==undefined && lastNode.type===NodeType.LITERAL && lastNode.value==="")
	{
		// Remove empty text node
		env.outputProgram.pop();
	}
}



/*
	Add an empty text node if last pushed node was
	of a certain type.
*/
function maybePushEmptyTextNode(env)
{
	if (getTopNode(env).type === NodeType.HTML_ATTR_VALUE_START)
	{
		push(Node.LITERAL(""), env);
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
		scriptTextNode = getTopNode(env);
		
		if (scriptTextNode.type === NodeType.LITERAL)
		{
			currentState = env.getState();
			prefix = "";
			previousNode = getTopNode(env, -1);
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
		styleTextNode = getTopNode(env);
		
		if (styleTextNode.type === NodeType.LITERAL)
		{
			currentState = env.getState();
			previousNode = getTopNode(env, -1);
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
			
			return postcss([ autoprefixer, cssnano ]).process(styles).then(result =>
			{
			    styleTextNode.value = result.css;
			});
		}
	}
	
	// Chainable
	return Promise.resolve();
}



/*
	Strip whitespace from last text node if specified node
	has whitespace control.
*/
function maybeTrimTextNode(newNodeStart, env)
{
	var lastNode;
	
	if (newNodeStart.strip === true)
	{
		lastNode = getTopNode(env);
		
		if (lastNode!==undefined && lastNode.type===NodeType.LITERAL)
		{
			lastNode.value = trimRight(lastNode.value);
		}
	}
}



module.exports = 
{
	concatOrPushTextNode: maybeConcatOrPushTextNode,
	processScript: maybeProcessScript,
	processStyles: maybeProcessStyles,
	popEmptyTextNode: maybePopEmptyTextNode,
	pushEmptyTextNode: maybePushEmptyTextNode,
	trimTextNode: maybeTrimTextNode
};
