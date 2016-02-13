"use strict";

var defaultOptions = 
{
	convertHbsComments: false,
	ignoreHbsComments: false,
	ignoreHtmlComments: false,
	normalizeWhitespace: false,
	processCSS: false,
	processJS: false,
	
	// Undocumented
	preformattedElements: { pre:true, script:true, style:true, textarea:true }
};



function parseOptions(customOptions)
{
	return Object.assign({}, defaultOptions, customOptions);
}



module.exports = parseOptions;
