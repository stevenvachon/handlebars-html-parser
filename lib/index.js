var handlebars = require("handlebars");
var htmlparser2 = require("htmlparser2");
var objectAssign = require("object-assign");

var log = require("../test/devlog.js").log;

var defaultOptions = 
{
	collapseWhitespace: false,
	ignoreComments: false,
	mustacheOnly: false
};



function dispatch(thisObj, event, arguments)
{
	if (typeof thisObj.handlers[event] === "function")
	{
		thisObj.handlers[event].apply(thisObj, arguments);
	}
}



function parseProgram(thisObj, program)
{
	program.statements.forEach( function(statement)
	{
		switch (statement.type)
		{
			case "content":
			{
				// TODO :: use statement.original?
				thisObj.htmlParser.write(statement.string);
				break;
			}
			case "mustache":
			{
				dispatch(thisObj, "hbsVariable", [statement.id.string]);
				break;
			}
			case "block":
			{
				if (statement.mustache.isHelper)
				{
					// No point continuing if there's nothing inside
					if (statement.program.statements.length)
					{
						var params = statement.mustache.params.map( function(param){ return param.string });
						
						dispatch(thisObj, "hbsHelperStart", [statement.mustache.id.string, params]);
						
						// Handle any and all nested helpers
						parseProgram(thisObj, statement.program);
						
						dispatch(thisObj, "hbsHelperEnd", [statement.mustache.id.string]);
					}
					else
					{
						log(statement);
					}
				}
				else
				{
					//dispatch(thisObj, "hbsSectionStart", [statement.mustache.id.string, statement.mustache.params.parts]);
					log(statement);
				}
				
				break;
			}
			default:
			{
				log(statement.type);
			}
		}
	});
}



function parseTemplate(thisObj, input)
{
	thisObj.htmlParser = new htmlparser2.Parser(
	{
		onopentagname: function(name)
		{
			dispatch(thisObj, "htmlTagStart", [name]);
		},
		onclosetag: function(name)
		{
			dispatch(thisObj, "htmlTagEnd", [name]);
		},
		onattribute: function(name, value)
		{
			dispatch(thisObj, "htmlAttributeStart", [name, value]);
		},
		ontext: function(text)
		{
			dispatch(thisObj, "htmlText", [text]);
		},
		oncomment: function(data)
		{
			
		},
		oncommentend: function()
		{
			
		},
		onerror: function(error)
		{
			console.log("error");
		}
	},{
		recognizeSelfClosing: true
	});
	
	parseProgram(thisObj, handlebars.parse(input));
	
	thisObj.htmlParser.end();
}



// Public API



function parser(handlers, options)
{
	this.handlers = handlers || {};
	this.options = objectAssign({}, defaultOptions, options);
}



parser.prototype.parse = function(input)
{
	parseTemplate(this, input);
	// Chainable
	return this;
};



module.exports = parser;
