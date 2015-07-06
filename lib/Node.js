//"use strict";
var NodeType = require("./NodeType");

var i;
var Node = {};



for (i in NodeType)
{
	if (NodeType.hasOwnProperty(i) === false) continue;
	
	switch (NodeType[i])
	{
		case NodeType.HBS_COMMENT_END:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_COMMENT_END,
					stripWhitespace: statement.strip.close
				};
			};
			break;
		}
		
		
		
		case NodeType.HBS_COMMENT_START:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_COMMENT_START,
					stripWhitespace: statement.strip.open
				};
			};
			break;
		}
		
		
		case NodeType.HBS_HELPER_END:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_HELPER_END,
					id: statement.path.original,
					stripWhitespaceLeft:  statement.closeStrip.open,
					stripWhitespaceRight: statement.closeStrip.close,
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeType.HBS_HELPER_START:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_HELPER_START,
					id: statement.path.original,
					params: statement.params.map( function(param){ return param.original }),  // TODO :: there's also param.parts[]
					stripWhitespaceLeft:  statement.openStrip.open,  // TODO :: what is statement.inverseStrip and statement.inverse ?
					stripWhitespaceRight: statement.openStrip.close,
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeType.HBS_SECTION_END:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_SECTION_END,
					id: statement.path.original,
					stripWhitespaceLeft:  statement.closeStrip.open,
					stripWhitespaceRight: statement.closeStrip.close,
					//statement: statement
				};
			};
			break;
		}
		
		
		// TODO :: how are these handled in handlebars v3?
		case NodeType.HBS_SECTION_START:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_SECTION_START,
					id: statement.path.original,
					params: statement.params.parts,	// ?
					stripWhitespaceLeft:  statement.openStrip.open,
					stripWhitespaceRight: statement.openStrip.close,
					//statement: statement
				};
			};
			break;
		}
		
		
		// TODO :: add HBS_TAG_START with `stripWhitespace` and `block` (for `{{#if}}`)
		// TODO :: add HBS_EXPRESSION for tag content (maybe put `block` here)
		// TODO :: add HBS_TAG_END with `stripWhitespace`
		// these are consistent with the HTML tags
		
		
		case NodeType.HBS_VARIABLE:
		{
			Node[i] = function(statement)
			{
				return {
					type: NodeType.HBS_VARIABLE,
					id: statement.path.original,
					stripWhitespaceLeft:  statement.strip.open,
					stripWhitespaceRight: statement.strip.close,
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeType.HTML_TAG_START:
		{
			Node[i] = function(closing)
			{
				return {
					type: NodeType.HTML_TAG_START,
					closing: closing === true
				};
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
