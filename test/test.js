var fs = require("fs");
var log = require("./devlog.js").log;
var parser = require("../lib");

var test = __dirname+"/templates/test.hbs";
//var test = __dirname+"/templates/test.html";
test = fs.readFileSync(test, {encoding:"utf8"});

console.log(test);

//return require("dombars").compile(test)({});

test = new parser(
{
	hbsComment: function(text)
	{
		// text == 'comment text';
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
	},
	hbsSectionStart: function(id)
	{
		log(["hbsSectionStart", id]);
	},
	hbsSectionEnd: function(id)
	{
		log(["hbsSectionEnd", id]);
	},
	hbsVariable: function(id)
	{
		log(["hbsVariable", id]);
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
	htmlComment: function(text)
	{
		// text == 'comment text';
	},
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
	text: function(text)
	{
		log(["text", text]);
		// text == 'value5';
	},
	processingInstruction: function(name, data)
	{
		log(["processingInstruction", name, data]);
	},
	error: function(error)
	{
		log(["error", error]);
	}
}).parse(test);
