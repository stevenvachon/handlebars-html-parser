"use strict";
var objectAssign = require("object-assign");

var defaultOptions = 
{
	convertHbsComments: false,
	ignoreHbsComments: false,
	ignoreHtmlComments: false,
	normalizeWhitespace: false,
	processCSS: false,
	processJS: false
};



function options(customOptions)
{
	return objectAssign({}, defaultOptions, customOptions);
}



module.exports = options;
