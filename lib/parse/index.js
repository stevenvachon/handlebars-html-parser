"use strict";
//var devlog    = require("../devlog");

var _parseHbs  = require("./parseHbs");
var _parseHtml = require("./parseHtml");
var state      = require("./state");

var handlebars = require("handlebars");



function addHbsProgram(hbsProgram)
{
	this.hbsProgramStack.push(hbsProgram);
}

function addState()
{
	this.stateStack.push( state.create( this.getState() ) );
	return this.getState();
}

function getHbsProgram()
{
	return getTop(this.hbsProgramStack);
}

function getState()
{
	return getTop(this.stateStack) || {};
}

function getTop(stack)
{
	return stack[ stack.length - 1 ];
}

function parseHbs(text)
{
	return _parseHbs(text, this);
}

function parseHtml()
{
	return _parseHtml(this);
}

function removeHbsProgram()
{
	this.hbsProgramStack.pop();
}

function removeState()
{
	this.stateStack.pop();
}



/*
	Parse a template and return a linear program containing
	HTML pieces and Handlebars expressions.
*/
function parse(template, options)
{
	return new Promise((resolve, reject) =>
	{
		var env = 
		{
			// Functions
			addHbsProgram: addHbsProgram,
			addState: addState,
			getHbsProgram: getHbsProgram,
			getState: getState,
			parseHbs: parseHbs,    // avoids cyclic dependencies
			parseHtml: parseHtml,  // avoids cyclic dependencies
			removeHbsProgram: removeHbsProgram,
			removeState: removeState,
			
			// Stacks
			hbsProgramStack: [],
			stateStack: [],
			
			options: options,
			
			// Start with a root-level program (no children)
			outputProgram: []
		};
		
		//devlog.basic(template);
		env.addHbsProgram( handlebars.parse(template) );
		//devlog(env.getHbsProgram());
		
		env.addState();
		
		env.parseHtml().then(() => resolve(env.outputProgram));
	});
}



module.exports = parse;
