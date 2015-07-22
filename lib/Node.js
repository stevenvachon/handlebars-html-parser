"use strict";
//var hbsUtil  = require("./hbsUtil");
var NodeType = require("./NodeType");

var i;
var Node = {};



function maybePushHashParams(statement, nodes)
{
	var i,keyValuePairs,keyValuePair,numKeyValuePairs;
	
	if (statement.hash !== undefined)
	{
		numKeyValuePairs = statement.hash.pairs.length;
		
		for (i=0; i<numKeyValuePairs; i++)
		{
			nodes.push( Node.HBS_EXPRESSION_HASH_PARAM(statement, i) );
		}
	}
}



function maybePushParams(statement, nodes)
{
	var i;
	var numParams = statement.params.length;
	
	if (numParams > 0)
	{
		for (i=0; i<numParams; i++)
		{
			nodes.push( Node.HBS_EXPRESSION_PARAM(statement, i) );
		}
	}
}



function stripWhitespace(statement, starting, closing)
{
	if (statement.type === "BlockStatement")
	{
		// If not `{{/path}}`
		if (closing !== true)
		{
			// If `{{`, else `}}`
			return starting===true ? statement.openStrip.open : statement.openStrip.close;
		}
		else
		{
			// If `{{`, else `}}`
			return starting===true ? statement.closeStrip.open : statement.closeStrip.close;
		}
	}
	else
	{
		// If `{{`, else `}}`
		return starting===true ? statement.strip.open : statement.strip.close;
	}
}



for (i in NodeType)
{
	if (NodeType.hasOwnProperty(i) === false) continue;
	
	switch (NodeType[i])
	{
		case NodeType.HBS_EXPRESSION:
		{
			Node[i] = function(statement, closing)
			{
				var nodes = [];
				
				nodes.push( Node.HBS_EXPRESSION_START );
				nodes.push( Node.HBS_EXPRESSION_PATH(statement) );
				
				// If not `{{/path}}`
				if (closing !== true)
				{
					// TODO :: deal with sub-expressions
					maybePushParams(statement, nodes);
					
					maybePushHashParams(statement, nodes);
				}
				
				nodes.push( Node.HBS_EXPRESSION_END );
				
				return nodes;
			};
			break;
		}
		
		
		
		case NodeType.HBS_EXPRESSION_HASH_PARAM:
		{
			Node[i] = function(statement, index)
			{
				var pair = statement.hash.pairs[index];
				
				return {
					type: NodeType.HBS_EXPRESSION_HASH_PARAM,
					
					key: pair.key,
					
					// `parts` if the value is a path, and `value` if the value is a string
					value: pair.value.parts || pair.value.value
				};
			};
			break;
		}
		
		
		
		case NodeType.HBS_EXPRESSION_PARAM:
		{
			Node[i] = function(statement, index)
			{
				var param = statement.params[index];
				
				return {
					type: NodeType.HBS_EXPRESSION_PARAM,
					
					// `parts` if the param is a path, and `value` if the param is a string
					value: param.parts || param.value
				};
			};
			break;
		}
		
		
		
		case NodeType.HBS_EXPRESSION_PATH:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_EXPRESSION_PATH,
					value: statement.path.parts
				};
			};
			break;
		}
		
		
		
		case NodeType.HBS_TAG_END:
		{
			Node[i] = function(statement, closing)
			{
				var node = { type:NodeType.HBS_TAG_END };
				
				if (stripWhitespace(statement, false, closing) === true) node.stripWhitespace = true;
				if (statement.escaped === false)                         node.notEscaped = true;
				
				return node;
			};
			break;
		}
		
		
		
		case NodeType.HBS_TAG_START:
		{
			Node[i] = function(statement, closing)
			{
				var node = { type:NodeType.HBS_TAG_START };
				
				if (statement.escaped === false)                        node.notEscaped = true;
				if (stripWhitespace(statement, true, closing) === true) node.stripWhitespace = true;
				
				if (closing !== true)
				{
					if (statement.type === "BlockStatement")   node.block = true;
					if (statement.inverse !== undefined)       node.inverted = true;
					if (statement.type === "CommentStatement") node.comment = true;
				}
				else
				{
					node.closing = true;
				}
				
				return node;
			};
			break;
		}
		
		
		case NodeType.HTML_TAG_START:
		{
			Node[i] = function(closing)
			{
				var node = { type:NodeType.HTML_TAG_START };
				
				if (closing === true) node.closing = true;
				
				return node;
			};
			break;
		}
		
		
		case NodeType.TEXT:
		{
			Node[i] = function(text)
			{
				return {
					type: NodeType.TEXT,
					value: text
				};
			};
			break;
		}
		
		
		default:
		{
			// Simple types are references for speed
			Node[i] = { type:NodeType[i] };
		}
	}
}



module.exports = Node;
