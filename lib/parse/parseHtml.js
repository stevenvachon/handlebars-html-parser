"use strict";
//var devlog  = require("../devlog");

var aliases = require("./aliases");
var each    = require("./each");
var maybe   = require("./maybe");
var Node    = require("./Node");
var push    = require("./push");
var state   = require("./state");

var parse5 = require("parse5");
parse5 = new parse5.Parser();



function eachAttr(attrs, env)
{
	var currentState = env.getState();
	
	return each(attrs, function(attr, i, nextAttr)
	{
		state.updateAttrStart(currentState, attr.name, attr.value);
		
		push(Node.HTML_ATTR_START, env);
		push(Node.HTML_ATTR_NAME_START, env);
		
		// Parse any aliases in attribute name
		return env.parseHbs(attr.name).then( function()
		{
			push(Node.HTML_ATTR_NAME_END, env);
			push(Node.HTML_ATTR_VALUE_START, env);
			
			// Parse any aliases in attribute value
			// TODO :: how to handle helper/block-wrapped attributes?
			return env.parseHbs(attr.value);
		})
		.then( function()
		{
			maybe.pushEmptyTextNode(env);
			maybe.processScript(env);
			
			return maybe.processStyles(env);
		})
		.then( function()
		{
			push(Node.HTML_ATTR_VALUE_END, env);
			push(Node.HTML_ATTR_END, env);
			
			state.updateAttrEnd(currentState);
			
			nextAttr();
		});
	});
}



function eachChild(childNodes, env)
{
	return each(childNodes, function(childNode, i, nextChild)
	{
		if (childNode.nodeName === "#comment")
		{
			return pushComment(childNode, env).then(nextChild);
		}
		else if (childNode.nodeName === "#text")
		{
			return pushText(childNode, env).then(nextChild);
		}
		else
		{
			return pushTag(childNode, env).then(nextChild);
		}
	});
}



function parseHtml(env)
{
	var html = parse5.parseFragment( aliases.stringify( env.getHbsProgram() ) );
	
	env.addState();
	
	return eachChild(html.childNodes, env).then( function()
	{
		env.removeState();
	});
}



function pushComment(childNode, env)
{
	if (env.options.ignoreHtmlComments !== true)
	{
		push(Node.HTML_COMMENT_START, env);
		
		// Parse any aliases in comment data
		return env.parseHbs(childNode.data).then( function()
		{
			push(Node.HTML_COMMENT_END, env);
		});
	}
	
	// Chainable
	return Promise.resolve();
}



function pushTag(childNode, env)
{
	var currentState = env.getState();
	state.updateTagStart(currentState, childNode.tagName);
	
	push(Node.HTML_TAG_START(), env);
	push(Node.HTML_TAG_NAME_START, env);
	
	// Parse any aliases in opening tag name
	return env.parseHbs(childNode.tagName).then( function()
	{
		push(Node.HTML_TAG_NAME_END, env);
		
		return eachAttr(childNode.attrs, env);
	})
	.then( function()
	{
		push(Node.HTML_TAG_END, env);
		
		return eachChild(childNode.childNodes, env);
	})
	.then( function()
	{
		// TODO :: should remove previous text node if <script></script>
		maybe.processScript(env);
	}).then( function()
	{
		// TODO :: should remove previous text node if <style></style> (and minification is disabled)
		return maybe.processStyles(env);
	})
	.then( function()
	{
		push(Node.HTML_TAG_START(true), env);
		push(Node.HTML_TAG_NAME_START, env);
		
		// Parse any aliases in closing tag name
		return env.parseHbs(childNode.tagName);
	})
	.then( function()
	{
		push(Node.HTML_TAG_NAME_END, env);
		push(Node.HTML_TAG_END, env);
		
		state.updateTagEnd(currentState);
	});
}



function pushText(childNode, env)
{
	// Parse any aliases in text
	return env.parseHbs(childNode.value);
}



module.exports = parseHtml;
