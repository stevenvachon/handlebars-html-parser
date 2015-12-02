"use strict";
var devlog  = require("../devlog");

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
		case "ContentStatement":
		{
			// This type shouldn't end up here
			devlog(["CONTENT?", statement.string, statement]);
			break;
		}
		case "MustacheStatement":
		{
			return pushMustache(statement, env);
		}
		default:
		{
			devlog(["UNKNOWN?", statement]);
		}
	}
	
	// Chainable
	return Promise.resolve();
}



/*
	Convert any aliases into Handlebars, HTML or Text nodes.
*/
function parseHbs(text, env)
{
	var partType;
	var parts = aliases.split(text);
	
	return Promise.resolve(parts).then( each( function(part)
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
	var statementProgram = getStatementProgram(statement);
	
	// TODO :: throwing an error here doesn't get caught by Promise try/catch
	
	if (statementProgram !== null)
	{
		// No point continuing if there's nothing inside
		if (programIsNotEmpty(statementProgram) === true)
		{
			newNodeStart = Node.HBS_TAG_START(statement);
			maybe.stripPreviousTextNode(newNodeStart, env);
			
			push(newNodeStart, env);
			push(Node.HBS_EXPRESSION(statement), env);
			push(Node.HBS_TAG_END(statement), env);
			
			env.addHbsProgram(statementProgram);
			
			// Handle any and all nested expressions
			return env.parseHtml().then( function()
			{
				env.removeHbsProgram();
				
				newNodeStart = Node.HBS_TAG_START(statement, true);
				maybe.stripPreviousTextNode(newNodeStart, env);
				
				push(newNodeStart, env);
				push(Node.HBS_EXPRESSION(statement, true), env);
				push(Node.HBS_TAG_END(statement, true), env);
			});
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
	
	// Chainable
	return Promise.resolve();
}



function pushComment(statement, env)
{
	var newNodeStart = Node.HBS_TAG_START(statement);
	
	maybe.stripPreviousTextNode(newNodeStart, env);
	
	if (env.options.ignoreHbsComments !== true)
	{
		if (env.options.convertHbsComments !== true)
		{
			push(newNodeStart, env);
			push(Node.TEXT(statement.value), env);
			push(Node.HBS_TAG_END(statement), env);
		}
		else if (env.options.ignoreHtmlComments !== true)
		{
			push(Node.HTML_COMMENT_START, env);
			push(Node.TEXT(statement.value), env);
			push(Node.HTML_COMMENT_END, env);
		}
	}
	
	// Chainable
	return Promise.resolve();
}



function pushMustache(statement, env)
{
	var newNodeStart = Node.HBS_TAG_START(statement);
	
	maybe.stripPreviousTextNode(newNodeStart, env);
	
	push(newNodeStart, env);
	push(Node.HBS_EXPRESSION(statement), env);
	push(Node.HBS_TAG_END(statement), env);
	
	// Chainable
	return Promise.resolve();
}



module.exports = parseHbs;
