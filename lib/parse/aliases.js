"use strict";

// There is no look-behind in JavaScript, so we only search for aliases
var aliasPattern = /\{\{alias([\d]+)}}/g;



/*
	Separate alias indexes from text.
	
	Parses:
	
	"prefix{{alias0}}infix{{alias1}}suffix"
	
	into:
	
	["prefix", 0, "infix", 1, "suffix"]
	
	Uses regexp instead of Handlebars for simplicity and speed.
*/
function splitAliases(text)
{
	var part;
	var parts = [];
	var previousLastIndex = 0;
	
	// Merely a precaution, and unlikely to be necessary for its purpose
	if (typeof text==="string" || text instanceof String===true)
	{
		// Reset any iterations
		aliasPattern.lastIndex = 0;
		
		// Repeat regexp until end of string or error
		while ( (part = aliasPattern.exec(text)) !== null )
		{
			// If went beyond end of string
			if (part[0] === "") break;
			
			if (parts.length===0 && part.index>0)
			{
				// First part of string, if alias is not at start
				parts.push( text.substring(0, part.index) );
			}
			else if (part.index > previousLastIndex)
			{
				// Part of string that is between aliases
				parts.push( text.substring(previousLastIndex, part.index) );
			}
			
			previousLastIndex = aliasPattern.lastIndex;
			
			// Multiplication is faster than `parseInt()`
			parts.push( part[1] * 1 );
		}
		
		if (previousLastIndex < text.length)
		{
			// Last part of string, if alias is not at end
			// Or whole string, if no aliases found
			parts.push( text.substring(previousLastIndex, text.length) );
		}
	}
	
	return parts;
}



/*
	Shallow-convert a Handlebars syntax tree (parsed template) back into a string with
	expressions converted to aliases so that a "forgiving" HTML parser can avoid issues.
	
	Example:
	
	<{{tag}} {{#if something}}attr="{{attr}}"{{/if}}>content</{{tag}}>
	
	is converted to:
	
	<{{alias0}} {{alias1}}>content</{{alias2}}>
	
	Note: nested programs are not converted
*/
function stringifyProgram(program)
{
	var i;
	var html = "";
	var len = program.body.length;
	
	for (i=0; i<len; i++)
	{
		if (program.body[i].type === "ContentStatement")
		{
			html += program.body[i].original;
		}
		else
		{
			html += "{{alias"+i+"}}";
		}
	}
	
	return html;
}



module.exports = 
{
	split: splitAliases,
	stringify: stringifyProgram
};
