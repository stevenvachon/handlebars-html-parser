"use strict";
var parser = require("../lib");

var utils = require("./utils");

var expect = require("chai").expect;



describe("Public API", function()
{
	describe(".parse()", function()
	{
		it("should work", function()
		{
			var result = new parser().parse("template");
			
			return Promise.all(
			[
				expect(result).to.eventually.be.an("object"),
				expect(result).to.eventually.have.property("options").that.is.an("object"),
				expect(result).to.eventually.have.property("program").that.deep.equals(
				[
					{ type:"text", value:"template" }
				])
			]);
		});
	});
	
	
	
	describe(".each()", function()
	{
		it("should work", function(done)
		{
			new parser().parse("<tag>{{var}}</tag>").then
			(
				parser.each( function(node, state)
				{
					switch(node.type)
					{
						case parser.type.HBS_EXPRESSION_START:
						{
							// is expression start node
							break;
						}
						case parser.type.HTML_TAG_START:
						{
							// is html tag start node
							break;
						}
					}
				})
			).then( function()
			{
				done();
			});
		});
	});
});
