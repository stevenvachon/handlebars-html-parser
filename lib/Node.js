"use strict";
var NodeType = require("./NodeType");

var i;
var Node = {};



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
		// TODO :: { type:"hbsBlockStart", escaped:false, stripWhitespace:true, closing:true }
		// TODO :: { type:"hbsBlockEnd", escaped:false, stripWhitespace:true }
		
		// TODO :: { type:"hbsCommentStart" }
		// TODO :: { type:"hbsCommentEnd" }
		
		// TODO :: { type:"hbsSimpleStart", escaped:false, stripWhitespace:true }
		// TODO :: { type:"hbsSimpleEnd", escaped:false, stripWhitespace:true }
		
		
		
		case NodeType.HBS_EXPRESSION:
		{
			Node[i] = function(statement, closing)
			{
				var node = { type:NodeType.HBS_EXPRESSION };
				
				node.path = statement.path.original;
				//node.parts = statement.path.parts;  // TODO :: is this ever length>1 ?
				
				if (closing !== true)
				{
					node.params = statement.params.map( function(param){ return param.original });  // TODO :: there's also param.parts[]
				}
				
				return node;
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
				
				// TODO :: include `statement` ?
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
					text: text
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
