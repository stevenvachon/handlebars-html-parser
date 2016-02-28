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



function getStatementOperationType(statement)
{
	// `{{#path}} {{/path}}`
	if (statement.program !== undefined)
	{
		return "program";
	}
	// `{{^path}} {{/path}}`
	else if (statement.inverse !== undefined)
	{
		return "inverse";
	}
	else
	{
		return null;
	}
}



function getStatementProgram(statement)
{
	var type = getStatementOperationType(statement);
	
	if (type !== null)
	{
		return statement[type];
	}
	else
	{
		return null;
	}
}



function getStatementType(statement)
{
	return statement.type;
}



function programIsNotEmpty(program)
{
	return program.body.length > 0;
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
		else if (partType==="string" || part instanceof String===true)
		{
			maybe.concatOrPushTextNode(part, env);
		}
	}));
}



function pushBlock(statement, env)
{
	var newNodeStart;
	var statementProgram = getStatementProgram(statement)
	
	if (statementProgram !== null)
	{
		// No point continuing if there's nothing inside
		if (programIsNotEmpty(statementProgram) === true)
		{
			newNodeStart = Node.HBS_TAG_START(statement);
			maybe.trimTextNode(newNodeStart, env);
			maybe.popEmptyTextNode(env);
			
			push(newNodeStart, env);
			push(Node.HBS_EXPRESSION(statement), env);
			push(Node.HBS_TAG_END(statement), env);
			
			env.addHbsProgram(statementProgram);
			
			// Handle any and all nested expressions
			return env.parseHtml().then(() =>
			{
				env.removeHbsProgram();
				
				newNodeStart = Node.HBS_TAG_START(statement, true);
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
