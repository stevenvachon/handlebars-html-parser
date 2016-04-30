"use strict";
var aliases = require("./aliases");
var maybe   = require("./maybe");
var Node    = require("./Node");
var push    = require("./push");

var each = require("promise-each");



function getStatement(program, index)
{
	return program.body[index];
}



function getStatementProgram(statement, type)
{
	return statement[type];
}



function getStatementType(statement)
{
	return statement.type;
}



// TODO :: move to maybe.js ?
function maybePushProgram(statement, statementProgramType, hasBothTypes, env)
{
	return Promise.resolve().then(() =>
	{
		var statementProgram = getStatementProgram(statement, statementProgramType);
		
		// If program type is not defined -- `pushBlock()` handles when/if both are not defined
		if (statementProgram === undefined) return;
		
		if (programIsEmpty(statementProgram) === true)
		{
			throw new Error("This should never happen");
		}
		
		var newNodeStart = Node.HBS_TAG_START(statement, statementProgramType);
		maybe.trimTextNode(newNodeStart, env);
		maybe.popEmptyTextNode(env);
		
		push(newNodeStart, env);
		
		// Not `{{#path}} {{else}} {{/path}}`
		// Not `{{#path}} {{^}} {{/path}}`
		// `{{#path}} {{/path}}`
		if (hasBothTypes===false || statementProgramType==="program")
		{
			push(Node.HBS_EXPRESSION(statement), env);
		}
		
		push(Node.HBS_TAG_END(statement), env);
		
		env.addHbsProgram(statementProgram);
		
		// Handle any and all nested expressions
		return env.parseHtml().then(() =>
		{
			env.removeHbsProgram();
		});
	});
}



function parseAlias(part, env)
{
	var statement     = getStatement(env.getHbsProgram(), part);
	var statementType = getStatementType(statement);
	
	switch (statementType)
	{
		case "BlockStatement":
		{
			return pushBlock(statement, env);
		}
		case "CommentStatement":
		{
			return pushComment(statement, env);
		}
		case "MustacheStatement":
		case "PartialStatement":
		{
			return pushMustache(statement, env);
		}
		default:
		{
			throw new Error("This should never happen");
		}
	}
}



/*
	Convert any aliases into Handlebars, HTML or Text nodes.
*/
function parseHbs(text, env)
{
	var partType;
	
	return Promise.resolve()
	.then(() => aliases.split(text))
	.then( each(part =>
	{
		partType = typeof part;
		
		// If alias index
		if (partType === "number")
		{
			return parseAlias(part, env);
		}
		// If text node
		else if (partType === "string")
		{
			maybe.concatOrPushTextNode(part, env);
		}
	}));
}



function programIsEmpty(program)
{
	return program.body.length <= 0;
}



function pushBlock(statement, env)
{
	var hasInverseType = statement.inverse !== undefined;
	var hasProgramType = statement.program !== undefined;
	var hasBothTypes = hasInverseType===true && hasProgramType===true;
	
	if (hasInverseType===true || hasProgramType===true)
	{
		return maybePushProgram(statement, "program", hasBothTypes, env)
		.then(() => maybePushProgram(statement, "inverse", hasBothTypes, env))
		.then(() =>
		{
			var newNodeStart = Node.HBS_TAG_START(statement, null, true);
			maybe.trimTextNode(newNodeStart, env);
			maybe.popEmptyTextNode(env);
			
			push(newNodeStart, env);
			push(Node.HBS_EXPRESSION(statement, true), env);
			push(Node.HBS_TAG_END(statement, true), env);
		});
	}
	else
	{
		throw new Error("This should never happen");
	}
}



function pushComment(statement, env)
{
	var newNodeStart = Node.HBS_TAG_START(statement);
	
	maybe.trimTextNode(newNodeStart, env);
	maybe.popEmptyTextNode(env);
	
	if (env.options.ignoreHbsComments !== true)
	{
		if (env.options.convertHbsComments !== true)
		{
			push(newNodeStart, env);
			push(Node.LITERAL(statement.value), env);
			push(Node.HBS_TAG_END(statement), env);
		}
		else if (env.options.ignoreHtmlComments !== true)
		{
			push(Node.HTML_COMMENT_START, env);
			push(Node.LITERAL(statement.value), env);
			push(Node.HTML_COMMENT_END, env);
		}
	}
}



function pushMustache(statement, env)
{
	var newNodeStart = Node.HBS_TAG_START(statement);
	
	maybe.trimTextNode(newNodeStart, env);
	maybe.popEmptyTextNode(env);
	
	push(newNodeStart, env);
	push(Node.HBS_EXPRESSION(statement), env);
	push(Node.HBS_TAG_END(statement), env);
}



module.exports = parseHbs;
