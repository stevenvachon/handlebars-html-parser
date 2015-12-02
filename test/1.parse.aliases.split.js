"use strict";
var aliases = require("../lib/parse/aliases");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");
var handlebars = require("handlebars");



describe("aliases.split()", function()
{
	it("should support aliases in the middle of the string", function()
	{
		var hbs = "string";
		hbs += "handlebars-html-parser-0-alias";
		hbs += "string";
		hbs += "handlebars-html-parser-1-alias";
		hbs += "string";
		hbs = aliases.split(hbs);
		
		expect(hbs).to.deep.equal(["string",0,"string",1,"string"]);
	});
	
	
	
	it("should support aliases at the beginning/end of the string", function()
	{
		var hbs = "handlebars-html-parser-0-alias";
		hbs += "string";
		hbs += "handlebars-html-parser-1-alias";
		hbs = aliases.split(hbs);
		
		expect(hbs).to.deep.equal([0,"string",1]);
	});
	
	
	
	it("should ignore expressions with no \"aliasX\"", function()
	{
		var hbs = "string";
		hbs += "handlebars-html-parser-0-alias";
		hbs += "string";
		hbs += "handlebars-html-parser-#-alias";
		hbs += "string";
		hbs += "handlebars-html-parser-alias";
		hbs += "string";
		hbs = aliases.split(hbs);
		
		expect(hbs).to.deep.equal(["string",0,"stringhandlebars-html-parser-#-aliasstringhandlebars-html-parser-aliasstring"]);
	});
	
	
	
	it("should support no aliases", function()
	{
		var hbs = "string";
		hbs += "handlebars-html-parser-alias";
		hbs += "string";
		hbs += "handlebars-html-parser-alias";
		hbs = aliases.split(hbs);
		
		expect(hbs).to.deep.equal(["stringhandlebars-html-parser-aliasstringhandlebars-html-parser-alias"]);
	});
	
	
	
	it("should support html", function()
	{
		var hbs = __dirname + "/templates/test.hbs";
		hbs = fs.readFileSync(hbs, {encoding:"utf8"});
		hbs = handlebars.parse(hbs);
		hbs = aliases.stringify(hbs);
		
		hbs = aliases.split(hbs);
		
		expect(hbs).to.deep.equal(
		[
			'<',1,' ',3,' attr="',5,'" attr',7,'="asdf" ',9,'>\n\t',
			11,' ',13,
			'\n\t<!-- comment -->\n\tvalue1\n</',15,'>\n'
		]);
	});
});
