"use strict";
var whitespace = require("../lib/parse/whitespace");

var expect = require("chai").expect;



describe("whitespace.normalize()", function()
{
	it("should work", function(done)
	{
		expect( whitespace.normalize("\n\r\t asdf   \n  \t  asdf") ).to.equal(" asdf asdf");
		
		expect( whitespace.normalize(" \xA0 \uFEFF \u200B asdf") ).to.equal(" \xA0 \uFEFF \u200B asdf");
		
		done();
	});
});



describe("whitespace.trimLeft()", function()
{
	it("should work", function(done)
	{
		expect( whitespace.trimLeft("\n\r\t asdf   \n  \t") ).to.equal("asdf   \n  \t");
		
		done();
	});
});



describe("whitespace.trimRight()", function()
{
	it("should work", function(done)
	{
		expect( whitespace.trimRight("\n\r\t asdf   \n  \t") ).to.equal("\n\r\t asdf");
		
		done();
	});
});
