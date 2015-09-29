"use strict";



/*
	Push content or elements of an array to the
	output linear program.
*/
// TODO :: do we ever push an array?
function push(content, env)
{
	var i,numElements;
	
	if (Array.isArray(content) === false)
	{
		env.outputProgram.push(content);
	}
	else
	{
		numElements = content.length;
		
		for (i=0; i<numElements; i++)
		{
			env.outputProgram.push( content[i] );
		}
	}
}



module.exports = push;
