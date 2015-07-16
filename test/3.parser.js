"use strict";
//var devlog = require("../lib/devlog");
var parser = require("../lib");

var expect = require("chai").expect;
var fs = require("fs");



// TODO :: find way to test parseHtml() independently
describe("parser.parse()", function()
{
	it("should support block helpers", function(done)
	{
		var result = new parser().parse("{{#path}} content {{/path}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart", block:true },
			{ type:"hbsExpression", path:"path", params:[] },
			{ type:"hbsTagEnd" },
			
			{ type:"text", text:" content " },
			
			{ type:"hbsTagStart", closing:true },
			{ type:"hbsExpression", path:"path" },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
	
	
	
	it("should support block helpers with parameters", function(done)
	{
		var result = new parser().parse("{{#path param0 param1}} content {{/path}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart", block:true },
			{ type:"hbsExpression", path:"path", params:["param0","param1"] },
			{ type:"hbsTagEnd" },
			
			{ type:"text", text:" content " },
			
			{ type:"hbsTagStart", closing:true },
			{ type:"hbsExpression", path:"path" },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
	
	
	
	it("should support block helpers with whitespace control", function(done)
	{
		//console.log( require("handlebars").compile("{{#path}} content {{/path}}")({path:[0,2]}) );
		//console.log( require("handlebars").compile("{{^path}} content {{/path}}")({path:false}) );
		//console.log( require("handlebars").parse("{{#path~}} content {{~/path}}").body[0] );
		
		var result = new parser().parse("{{#path~}} content {{~/path}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart", block:true },
			{ type:"hbsExpression", path:"path", params:[] },
			{ type:"hbsTagEnd", stripWhitespace:true },
			
			{ type:"text", text:"content" },
			
			{ type:"hbsTagStart", stripWhitespace:true, closing:true },
			{ type:"hbsExpression", path:"path" },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
	
	
	
	it("should support inverted block helpers", function(done)
	{
		var result = new parser().parse("{{^path}} content {{/path}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart", block:true, inverted:true },
			{ type:"hbsExpression", path:"path", params:[] },
			{ type:"hbsTagEnd" },
			
			{ type:"text", text:" content " },
			
			{ type:"hbsTagStart", closing:true },
			{ type:"hbsExpression", path:"path" },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
	
	
	
	it("should support inverted block helpers with whitespace control", function(done)
	{
		var result = new parser().parse("{{^path~}} content {{~/path}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart", block:true, inverted:true },
			{ type:"hbsExpression", path:"path", params:[] },
			{ type:"hbsTagEnd", stripWhitespace:true },
			
			{ type:"text", text:"content" },
			
			{ type:"hbsTagStart", stripWhitespace:true, closing:true },
			{ type:"hbsExpression", path:"path" },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
	
	
	
	it("should support whitespace control", function(done)
	{
		var result = new parser().parse("{{path~}} {{~path}}");
		
		expect(result).to.deep.equal(
		[
			{ type:"hbsTagStart" },
			{ type:"hbsExpression", path:"path", params:[] },
			{ type:"hbsTagEnd", stripWhitespace:true },
			
			{ type:"hbsTagStart", stripWhitespace:true },
			{ type:"hbsExpression", path:"path", params:[] },
			{ type:"hbsTagEnd" }
		]);
		
		done();
	});
	
	
	
	it.skip("should support everything in one template", function(done)
	{
		var test = __dirname+"/templates/test.hbs";
		//var test = __dirname+"/templates/test.html";
		test = fs.readFileSync(test, {encoding:"utf8"});
		
		new parser({ collapseWhitespace:true }).parse(test);
		
		done();
	});
});
