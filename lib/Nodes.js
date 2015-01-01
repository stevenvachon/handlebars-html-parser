//"use strict";
var NodeTypes = require("./NodeTypes");
var Nodes = {};

for (var i in NodeTypes)
{
	if (NodeTypes.hasOwnProperty(i) === false) continue;
	
	switch (NodeTypes[i])
	{
		case NodeTypes.HBS_HELPER_END:
		{
			Nodes[i] = function(statement)
			{
				return {
					type: NodeTypes.HBS_HELPER_END,
					id: statement.mustache.id.string,
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeTypes.HBS_HELPER_START:
		{
			Nodes[i] = function(statement)
			{
				return {
					type: NodeTypes.HBS_HELPER_START,
					id: statement.mustache.id.string,
					params: statement.mustache.params.map( function(param){ return param.string }),
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeTypes.HBS_SECTION_END:
		{
			Nodes[i] = function(statement)
			{
				return {
					type: NodeTypes.HBS_SECTION_END,
					id: statement.mustache.id.string,
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeTypes.HBS_SECTION_START:
		{
			Nodes[i] = function(statement)
			{
				return {
					type: NodeTypes.HBS_SECTION_START,
					id: statement.mustache.id.string,
					params: statement.mustache.params.parts,	// ?
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeTypes.HBS_VARIABLE:
		{
			Nodes[i] = function(statement)
			{
				return {
					type: NodeTypes.HBS_VARIABLE,
					id: statement.id.string,
					//statement: statement
				};
			};
			break;
		}
		
		
		case NodeTypes.HTML_TAG_START:
		{
			Nodes[i] = function(closing)
			{
				return {
					type: NodeTypes.HTML_TAG_START,
					closing: !!closing
				};
			};
			break;
		}
		
		
		case NodeTypes.TEXT:
		{
			Nodes[i] = function(text)
			{
				return {
					type:NodeTypes.TEXT,
					text:text
				};
			};
			break;
		}
		
		
		default:
		{
			// Simple types are references for speed
			Nodes[i] = { type:NodeTypes[i] };
		}
	}
}



module.exports = Nodes;
