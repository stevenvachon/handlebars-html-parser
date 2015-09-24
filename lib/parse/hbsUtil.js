"use strict";



function getStatement(program, index)
{
	return program.body[index];
}



function getStatementOperationType(statement)
{
	// `{{#path}} {{/path}}`
	if (statement.program !== undefined)
	{
		return "program";
	}
	// `{{^path}} {{/path}}`
	else if (statement.inverse !== undefined)
	{
		return "inverse";
	}
	else
	{
		return null;
	}
}



function getStatementProgram(statement)
{
	var type = getStatementOperationType(statement);
	
	if (type !== null)
	{
		return statement[type];
	}
	else
	{
		return null;
	}
}



function getStatementType(statement)
{
	return statement.type;
}



function programIsNotEmpty(program)
{
	return program.body.length > 0;
}



module.exports = 
{
	getStatement:              getStatement,
	getStatementOperationType: getStatementOperationType,
	getStatementProgram:       getStatementProgram,
	getStatementType:          getStatementType,
	programIsNotEmpty:         programIsNotEmpty
};
