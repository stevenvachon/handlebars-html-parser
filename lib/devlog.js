"use strict";
// TODO :: call this debug-inspect? a plugin for debug package?
var util = require("util");

var trimPattern = new RegExp([
	"^(\\[) ?",                // group $1, must start with "[" or "[ "
	"([\\s\\S]*?)",            // group $2, any char(s) 0 or more times (matching the least amount possible)
	"(?:",                     // non-capturing group
		",?\\s*",              // optional ", " or ",    " etc
		"\\[length]: ",        // array length for `all()`
		"(?:\\x1B\\[\\d+m)?",  // optional ansi color start
		"\\d+",                // number(s)
		"(?:\\x1B\\[\\d+m)?",  // optional ansi color end
	")?",                      // optional
	" ?(])$"                   // group $3, must end in "]" or " ]"
].join(""));



function log(args, options)
{
	var data = parseArgs(args);
	var str = util.inspect(data.args, options);
	str = trim(str, data.trimLength, data.unencapsulate);
	
	console.log(str);
}



function parseArgs(args)
{
	var result, trimLength=false, unencapsulate=false;
	
	switch (args.length)
	{
		case 0:
		{
			result = "";
			break;
		}
		case 1:
		{
			result = args[0];
			
			if (Object.prototype.toString.call(result) === "[object Array]")
			{
				trimLength = true;
				unencapsulate = result.length > 0;
			}
			break;
		}
		default:
		{
			// Return regular array instead of special arguments object
			var argsArray = [];
			for (var i=0; i<args.length; i++)
			{
				argsArray.push( args[i] );
			}
			
			result = argsArray;
			trimLength = true;
			unencapsulate = true;
		}
	}
	
	return { args:result, trimLength:trimLength, unencapsulate:unencapsulate };
}



function trim(str, trimLength, unencapsulate)
{
	if (trimLength===true || unencapsulate===true)
	{
		var groups = (unencapsulate===true) ? "  $2" : "$1$2$3";
		
		return str.replace(trimPattern, groups);
	}
	else
	{
		return str;
	}
}



// Public API



function inspect()
{
	log.apply(null, [arguments, {depth:null, colors:true}]);
}



inspect.all = function()
{
	log.apply(null, [arguments, {depth:null, showHidden:true, colors:true}]);
};



inspect.basic = function()
{
	console.log.apply(null, arguments);
};



/*inspect("asdf");
inspect("asdf", 123);
inspect("asdf");

console.log("==========");

inspect.all( { asdf1:{asdf:{asdf:["asdf"]}}, asdf2:"asdf" }, ["asdf"] );
console.log( { asdf1:{asdf:{asdf:["asdf"]}}, asdf2:"asdf" }, ["asdf"] );

console.log("==========");

inspect.all([]);
inspect([]);
console.log( util.inspect([], {depth:null, colors:true}) );*/



module.exports = inspect;
