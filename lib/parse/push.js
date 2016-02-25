"use strict";



/*
	Push content or elements of an array to the
	output linear program.
*/
function push(content, env)
{
	if (Array.isArray(content) === false)
	{
		env.outputProgram.push(content);
	}
	else
	{
		env.outputProgram.push(...content);
	}
}



module.exports = push;
