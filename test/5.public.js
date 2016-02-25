"use strict";
var parser = require("../lib");

var utils = require("./utils");

var expect = require("chai").expect;



describe("Public API", () =>
{
	describe(".parse()", () =>
	{
		it("should work", () =>
		{
			var result = new parser().parse("template");
			
			return Promise.all(
			[
				expect(result).to.eventually.be.an("object"),
				expect(result).to.eventually.have.property("options").that.is.an("object"),
				expect(result).to.eventually.have.property("program").that.deep.equals(
				[
					{ type:"literal", value:"template" }
				])
			]);
		});
	});
	
	
	
	describe(".each()", () =>
	{
		it("should work", done =>
		{
			new parser().parse("<tag>{{var}}</tag>").then
			(
				parser.each((node, state) =>
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
			).then(program =>
			{
				expect(program).to.be.instanceOf(Object);
				done();
			});
		});
	});
	
	
	
	describe(".beautifyJS()", () =>
	{
		it("should work", () =>
		{
			var result = parser.beautifyJS("function test (varname) { 'asdf' }");
			
			expect(result).to.equal("function test(varname) {\n  \"asdf\";\n}");
		});
	});
});
