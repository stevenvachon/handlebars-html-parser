var fs = require("fs");
var log = require("./devlog.js").log;
var parser = require("../lib");

var test = __dirname+"/templates/basic.hbs";
//var test = __dirname+"/templates/test.html";
test = fs.readFileSync(test, {encoding:"utf8"});

test = new parser(
{
	htmlTagStart: function(tagName/*, hasAttributes*/)
	{
		log(["htmlTagStart", tagName]);
		// React.DOM[tagName] || React.createElement(tagName)
		// tagName == 'span';
		// hasAttributes == true;
	},
	htmlTagEnd: function(tagName/*, selfClosing*/)
	{
		log(["htmlTagEnd", tagName]);
		// tagName == 'span';
		// selfClosing == false;
	},
	htmlAttributeStart: function(attributeName, attributeValue)
	{
		log(["htmlAttributeStart", attributeName, attributeValue]);
		// attributeName == 'data-attr';
		// encapsulator == '"' || "'" || '';
	},
	/*htmlAttributeEnd: function(encapsulator)
	{
		// encapsulator == '"' || "'" || '';
	},
	htmlAttributeValue: function(text)
	{
		// text == 'value3 value4';
	},*/
	htmlText: function(text)
	{
		log(["htmlText", text]);
		// text == 'value5';
	},
	htmlComment: function(text)
	{
		// text == 'comment text';
	},
	hbsComment: function(text)
	{
		// text == 'comment text';
	},
	hbsVariable: function(id)
	{
		log(["hbsVariable", id]);
	},
	hbsSectionStart: function(id)
	{
		log(["hbsSectionStart", id]);
	},
	hbsSectionEnd: function(id)
	{
		log(["hbsSectionEnd", id]);
	},
	hbsHelperStart: function(id, params)
	{
		log(["hbsHelperStart", id, params]);
		// type == 'if';
		// params == ['variable1'];
	},
	hbsHelperEnd: function(id)
	{
		log(["hbsHelperEnd", id]);
		// text == 'if';
	}
}).parse(test);

// TEMP
//log(test);
