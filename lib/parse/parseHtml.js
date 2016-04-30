"use strict";
var aliases = require("./aliases");
var maybe   = require("./maybe");
var Node    = require("./Node");
var push    = require("./push");
var state   = require("./state");

var each = require("promise-each");
var parse5 = new require("parse5");



function eachAttr(attrs, env)
{
	return Promise.resolve(attrs).then( each(attr =>
	{
		state.attr(env.getState(), env.addState(), attr.name, attr.value);
		
		push(Node.HTML_ATTR_START, env);
		push(Node.HTML_ATTR_NAME_START, env);
		
		// Parse any aliases in attribute name
		return env.parseHbs(attr.name).then(() =>
		{
			push(Node.HTML_ATTR_NAME_END, env);
			push(Node.HTML_ATTR_VALUE_START, env);
			
			// Parse any aliases in attribute value
			// TODO :: how to handle helper/block-wrapped attributes?
			return env.parseHbs(attr.value);
		})
		.then(() =>
		{
			maybe.pushEmptyTextNode(env);
			maybe.processScript(env);
			
			return maybe.processStyles(env);
		})
		.then(() =>
		{
			push(Node.HTML_ATTR_VALUE_END, env);
			push(Node.HTML_ATTR_END, env);
			
			env.removeState();
		});
	}));
}



function eachChild(childNodes, env)
{
	return Promise.resolve(childNodes).then( each(childNode =>
	{
		if (childNode.nodeName === "#comment")
		{
			return pushComment(childNode, env);
		}
		else if (childNode.nodeName === "#text")
		{
			return pushText(childNode, env);
		}
		else
		{
			return pushTag(childNode, env);
		}
	}));
}



function parseHtml(env)
{
	return Promise.resolve().then(() =>
	{
		var html = parse5.parseFragment( aliases.stringify( env.getHbsProgram() ) );
		
		return eachChild(html.childNodes, env);
	});
}



function pushComment(childNode, env)
{
	if (env.options.ignoreHtmlComments !== true)
	{
		push(Node.HTML_COMMENT_START, env);
		
		// Parse any aliases in comment data
		return env.parseHbs(childNode.data).then(() =>
		{
			push(Node.HTML_COMMENT_END, env);
		});
	}
}



function pushTag(childNode, env)
{
	state.tag(env.getState(), env.addState(), childNode.tagName);
	
	push(Node.HTML_TAG_START(), env);
	push(Node.HTML_TAG_NAME_START, env);
	
	// Parse any aliases in opening tag name
	return env.parseHbs(childNode.tagName).then(() =>
	{
		push(Node.HTML_TAG_NAME_END, env);
		
		return eachAttr(childNode.attrs, env);
	})
	.then(() =>
	{
		push(Node.HTML_TAG_END, env);
		
		return eachChild(childNode.childNodes, env);
	})
	.then(() => maybe.processScript(env))
	.then(() => maybe.processStyles(env))
	.then(() =>
	{
		maybe.popEmptyTextNode(env);
		
		push(Node.HTML_TAG_START(true), env);
		push(Node.HTML_TAG_NAME_START, env);
		
		// Parse any aliases in closing tag name
		return env.parseHbs(childNode.tagName);
	})
	.then(() =>
	{
		push(Node.HTML_TAG_NAME_END, env);
		push(Node.HTML_TAG_END, env);
		
		env.removeState();
	});
}



function pushText(childNode, env)
{
	// Parse any aliases in text
	return env.parseHbs(childNode.value);
}



module.exports = parseHtml;
