"use strict";
var objectAssign = require("object-assign");

var defaultOptions = 
{
	convertHbsComments: false,
	ignoreHbsComments: false,
	ignoreHtmlComments: false,
	normalizeWhitespace: false,
	processCSS: false,
	processJS: false,
	xmlMode: false
};

var htmlParserOptions = 
{
	decodeEntities: true,
	lowerCaseAttributeNames: true,  // TODO :: what about inline SVG?
	lowerCaseTags: true,  // TODO :: what about inline SVG?
	recognizeSelfClosing: true,
	xmlMode: false
};



function options(customOptions)
{
	var result = objectAssign({}, defaultOptions, customOptions);
	
	result.htmlParser = objectAssign({}, htmlParserOptions);
	
	if (result.xmlMode === true)
	{
		result.htmlParser.lowerCaseAttributeNames = false;
		result.htmlParser.lowerCaseTags = false;
		result.htmlParser.xmlMode = true;
	}
	
	return result;
}



module.exports = options;
