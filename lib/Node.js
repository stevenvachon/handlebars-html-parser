"use strict";
var NodeType = require("./NodeType");

var i;
var Node = {};



function stripWhitespace(statement, starting, closing)
{
	if (statement.type === "BlockStatement")
	{
		if (starting === true)
		{
			return closing!==true ? statement.openStrip.open : statement.openStrip.close;
		}
		else
		{
			return closing!==true ? statement.closeStrip.open : statement.closeStrip.close;
		}
	}
	else
	{
		return starting!==true ? statement.strip.close : statement.strip.open;
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
				return {
					type: NodeType.HBS_EXPRESSION,
					parts: statement.path.parts,
					params: statement.params.map( function(param){ return param.original })  // TODO :: there's also param.parts[]
				};
			};
			break;
		}
		
		
		
		case NodeType.HBS_TAG_END:
		{
			Node[i] = function(statement, closing)
			{
				var node = { type:NodeType.HBS_TAG_END };
				
				if (statement.escaped === false)                         node.notEscaped = true;
				if (stripWhitespace(statement, false, closing) === true) node.stripWhitespace = true;
				
				return node;
				
				/*return {
					type: NodeType.HBS_TAG_END,
					escaped: statement.escaped === true,
					stripWhitespace: stripWhitespace(statement, false, closing)
				};*/
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
				if (statement.type === "BlockStatement")                node.block = true;
				if (closing === true)                                   node.closing = true;
				if (statement.type === "CommentStatement")              node.comment = true;
				
				// TODO :: include `statement` ?
				return node;
				
				/*return {
					type: NodeType.HBS_TAG_START,
					escaped: statement.escaped === true,
					stripWhitespace: stripWhitespace(statement, true, closing),
					block: statement.type === "BlockStatement",
					closing: closing === true,
					comment: statement.type === "CommentStatement"
				};*/
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
				
				/*return {
					type: NodeType.HTML_TAG_START,
					closing: closing === true
				};*/
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
