"use strict";
var NodeType = require("../NodeType");

var i;
var Node = {};



function maybePushBlockParams(statement, nodes)
{
	if (statement.program!==undefined && statement.program.blockParams!==undefined)
	{
		nodes.push( Node.HBS_PART_START );
		nodes.push( Node.HBS_BLOCK_PARAMS(statement) );
		nodes.push( Node.HBS_PART_END );
	}
}



function maybePushHashParams(statement, nodes)
{
	var i,numPairs,pair;
	
	if (statement.hash !== undefined)
	{
		numPairs = statement.hash.pairs.length;
		
		for (i=0; i<numPairs; i++)
		{
			pair = statement.hash.pairs[i];
			
			nodes.push( Node.HBS_PART_START );
			nodes.push( Node.HBS_HASH_START );
			nodes.push( Node.HBS_HASH_KEY_START );
			nodes.push( Node.LITERAL(pair.key) );
			nodes.push( Node.HBS_HASH_KEY_END );
			nodes.push( Node.HBS_HASH_VALUE_START );
			
			pushValue(pair.value, nodes);
			
			nodes.push( Node.HBS_HASH_VALUE_END );
			nodes.push( Node.HBS_HASH_END );
			nodes.push( Node.HBS_PART_END );
		}
	}
}



function maybePushParams(statement, nodes)
{
	var i;
	var numParams = statement.params.length;
	
	for (i=0; i<numParams; i++)
	{
		nodes.push( Node.HBS_PART_START );
		
		pushValue(statement.params[i], nodes);
		
		nodes.push( Node.HBS_PART_END );
	}
}



function pushValue(statement, nodes)
{
	switch (statement.type)
	{
		case "SubExpression":
		{
			nodes.push( ... Node.HBS_EXPRESSION(statement) );
			break;
		}
		case "PathExpression":
		{
			nodes.push( Node.HBS_PATH(statement) );
			break;
		}
		default:
		{
			nodes.push( Node.LITERAL(statement.value) );
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
		case NodeType.HBS_BLOCK_PARAMS:
		{
			Node[i] = statement =>
			{
				return { type:NodeType.HBS_BLOCK_PARAMS, value:statement.program.blockParams };
			};
			break;
		}
		
		
		
		case NodeType.HBS_EXPRESSION:
		{
			Node[i] = (statement, closing) =>
			{
				var nodes = [];
				
				nodes.push( Node.HBS_EXPRESSION_START );
				nodes.push( Node.HBS_PART_START );
				
				if (statement.type !== "PartialStatement")
				{
					pushValue(statement.path, nodes);
				}
				else
				{
					pushValue(statement.name, nodes);
				}
				
				nodes.push( Node.HBS_PART_END );
				
				// If not `{{/path}}`
				if (closing !== true)
				{
					maybePushParams(statement, nodes);
					
					maybePushHashParams(statement, nodes);
					
					maybePushBlockParams(statement, nodes);
				}
				
				nodes.push( Node.HBS_EXPRESSION_END );
				
				return nodes;
			};
			break;
		}
		
		
		
		case NodeType.HBS_PATH:
		{
			Node[i] = statement =>
			{
				var node = { type:NodeType.HBS_PATH, value:statement.parts };
				
				if (statement.data === true) node.data = true;
				
				return node;
			};
			break;
		}
		
		
		
		case NodeType.HBS_TAG_END:
		{
			Node[i] = (statement, closing) =>
			{
				var node = { type:NodeType.HBS_TAG_END };
				
				if (statement.escaped === false)                         node.unescaped = true;
				if (stripWhitespace(statement, false, closing) === true) node.strip = true;
				
				return node;
			};
			break;
		}
		
		
		
		case NodeType.HBS_TAG_START:
		{
			Node[i] = (statement, statementProgramType, closing) =>
			{
				var node = { type:NodeType.HBS_TAG_START };
				
				if (stripWhitespace(statement, true, closing) === true) node.strip = true;
				if (statement.escaped === false)                        node.unescaped = true;
				
				if (closing !== true)
				{
					if (statement.type === "BlockStatement")
					{
						node.block = true;
						
						// `.inverse`
						if (statementProgramType === "inverse")
						{
							// `{{^path}} {{/path}}`
							// `{{^}}`
							// `{{else}}` -- not `{{[else]}}`
							node.inverted = true;
							
							// `{{^}}`
							// `{{else}}` -- not `{{[else]}}`
							if (statement.program !== undefined)
							{
								// Avoid conflict with `{{^path}} {{/path}}`
								node.chained = true;
							}
						}
					}
					
					if (statement.type === "CommentStatement") node.comment = true;
					if (statement.type === "PartialStatement") node.partial = true;
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
			Node[i] = closing =>
			{
				var node = { type:NodeType.HTML_TAG_START };
				
				if (closing === true) node.closing = true;
				
				return node;
			};
			break;
		}
		
		
		case NodeType.LITERAL:
		{
			Node[i] = value =>
			({
				type: NodeType.LITERAL,
				value: value
			});
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
