"use strict";



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



module.exports = stringifyProgram;
