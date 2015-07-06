"use strict";

var aliasPattern = new RegExp([
	"([^{]+)?",                   // any text, affixed or otherwise (not required)
	"(?:\\{\\{alias([\\d]+)}})?"  // alias (not required)
].join(""), "g");



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
	
	// Merely a precaution, and unlikely to be necessary for its purpose
	if (typeof text==="string" || text instanceof String===true)
	{
		// Reset any iterations
		aliasPattern.lastIndex = 0;
		
		// Repeat regexp until end of string or error
		while ( (part = aliasPattern.exec(text)) !== null )
		{
			// If matched anything
			if (part[0] !== "")
			{
				// Text
				if (part[1]) parts.push( part[1] );
				
				// Alias -- parseInt is slower than multiplication
				if (part[2]) parts.push( part[2] * 1 );
			}
			else
			{
				// Went beyond end of string
				break;
			}
		}
	}
	
	return parts;
}



module.exports = splitAliases;
