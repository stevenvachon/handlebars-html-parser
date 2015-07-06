"use strict";
var splitAliases     = require("../lib/splitAliases");
var stringifyProgram = require("../lib/stringifyProgram");

var expect = require("chai").expect;
var fs = require("fs");
var handlebars = require("handlebars");



describe("splitAliases", function()
{
	it("should work", function(done)
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
