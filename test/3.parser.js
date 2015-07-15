"use strict";
//var devlog = require("../lib/devlog");
var parser = require("../lib");

var expect = require("chai").expect;
var fs = require("fs");



// TODO :: find way to test parseHtml() independently
describe("parser.parse()", function()
{
	it("should work", function(done)
	{
		var test = __dirname+"/templates/test.hbs";
		//var test = __dirname+"/templates/test.html";
		test = fs.readFileSync(test, {encoding:"utf8"});
		
		new parser({ collapseWhitespace:true }).parse(test);
		
		done();
	});
	
	
	
	it("should recognize whitespace control", function(done)
	{
		var result = new parser().parse("{{var~}} {{~var}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart" },
			{ type:"hbsExpression", parts:["var"], params:[] },
			{ type:"hbsTagEnd", stripWhitespace:true },
			
			{ type:"hbsTagStart", stripWhitespace:true },
			{ type:"hbsExpression", parts:["var"], params:[] },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
});
