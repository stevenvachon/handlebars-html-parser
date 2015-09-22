"use strict";
var splitAliases     = require("../lib/splitAliases");
var stringifyProgram = require("../lib/stringifyProgram");

var expect = require("chai").expect;
var fs = require("fs");
var handlebars = require("handlebars");



describe("splitAliases()", function()
{
	it("should support aliases in the middle of the string", function(done)
	{
		var hbs = "string{{alias0}}string{{alias1}}string";
		hbs = splitAliases(hbs);
		
		expect(hbs).to.deep.equal(["string",0,"string",1,"string"]);
		done();
	});
	
	
	
	it("should support aliases at the beginning/end of the string", function(done)
	{
		var hbs = "{{alias0}}string{{alias1}}";
		hbs = splitAliases(hbs);
		
		expect(hbs).to.deep.equal([0,"string",1]);
		done();
	});
	
	
	
	it("should ignore {'s and {{{'s", function(done)
	{
		var hbs = "string{{alias0}}string{{alias1}}string{string}string{{{string}}}";
		hbs = splitAliases(hbs);
		
		expect(hbs).to.deep.equal(["string",0,"string",1,"string{string}string{{{string}}}"]);
		done();
	});
	
	
	
	it("should ignore expressions with no \"alias#\"", function(done)
	{
		var hbs = "string{{alias0}}string{{alias1a}}string{{alias#}}string{{alias}}string";
		hbs = splitAliases(hbs);
		
		expect(hbs).to.deep.equal(["string",0,"string{{alias1a}}string{{alias#}}string{{alias}}string"]);
		done();
	});
	
	
	
	it("should support no aliases", function(done)
	{
		var hbs = "string{string}string{{string}}string{{string0}}string{{{string}}}";
		hbs = splitAliases(hbs);
		
		expect(hbs).to.deep.equal(["string{string}string{{string}}string{{string0}}string{{{string}}}"]);
		done();
	});
	
	
	
	it("should support html", function(done)
	{
		var hbs = __dirname + "/templates/test.hbs";
		hbs = fs.readFileSync(hbs, {encoding:"utf8"});
		hbs = handlebars.parse(hbs);
		hbs = stringifyProgram(hbs);
		
		hbs = splitAliases(hbs);
		
		expect(hbs).to.deep.equal(
		[
			'<',1,' ',3,' attr="',5,'" attr',7,'="asdf" ',9,'>\n\t',
			11,' ',13,
			'\n\t<!-- comment -->\n\tvalue1\n</',15,'>\n'
		  ]);
		
		done();
	});
});
