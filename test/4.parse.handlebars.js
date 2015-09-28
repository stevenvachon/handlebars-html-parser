"use strict";
//var devlog  = require("../lib/parse/devlog");
var options = require("../lib/options");
var parse   = require("../lib/parse");

var chai = require("chai");
//var fs = require("fs");

var expect = chai.expect;
chai.use( require("chai-as-promised") );



describe("parse()", function()
{
	describe("Handlebars", function()
	{
		describe("comments", function()
		{
			// TODO :: test {{#! block comment? }}, {{^! inverse comment? }} and {{{! comment }}}
			it("should be supported", function()
			{
				var result = parse('{{! comment }} content {{!-- comment --}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", comment:true },
					{ type:"text", value:" comment " },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", comment:true },
					{ type:"text", value:" comment " },
					{ type:"hbsTagEnd" }
				]);
			});
		});
		
		
		
		describe("non-blocks", function()
		{
			// TODO :: test {{undefined}}, {{null}}, {{true}}, {{1}}
			it("should be supported", function()
			{
				var result = parse('{{path}} content {{path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support dot-segmented paths", function()
			{
				var result = parse('{{path.path}} content {{../parentPath}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path","path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["parentPath"] },  // ".." ignored because no traversing has occcurred (`{{#with}}`, etc)
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard parameters", function()
			{
				var result = parse('{{path "param0" path.param1}} content {{path "param0" path.param1}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionParam", value:["path","param1"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionParam", value:["path","param1"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it.skip("should support sub-expression parameters", function()
			{
				var result = parse('{{path (path "param0")}} content {{path (path "param0")}}', options());
				
				/*return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);*/
			});
			
			
			
			it("should support hash parameters", function()
			{
				var result = parse('{{path param0=path.path param1="string"}} content {{path param0=path.path param1="string"}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionHashParam", key:"param0", value:["path","path"] },
					{ type:"hbsExpressionHashParam", key:"param1", value:"string" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionHashParam", key:"param0", value:["path","path"] },
					{ type:"hbsExpressionHashParam", key:"param1", value:"string" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard and hash parameters", function()
			{
				var result = parse('{{path "param0" path.param1 param2=path.path param3="string"}} content {{path "param0" path.param1 param2=path.path param3="string"}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionParam", value:["path","param1"] },
					{ type:"hbsExpressionHashParam", key:"param2", value:["path","path"] },
					{ type:"hbsExpressionHashParam", key:"param3", value:"string" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionParam", value:["path","param1"] },
					{ type:"hbsExpressionHashParam", key:"param2", value:["path","path"] },
					{ type:"hbsExpressionHashParam", key:"param3", value:"string" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support non-escape", function()
			{
				var result = parse('{{{path}}} content {{{path}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
				]);
			});
			
			
			
			it("should support whitespace control", function()
			{
				var result = parse('{{path~}} content {{~path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", stripWhitespace:true },
					
					{ type:"text", value:"content" },
					
					{ type:"hbsTagStart", stripWhitespace:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
		});
		
		
		
		describe("blocks", function()
		{
			it("should be supported", function()
			{
				var result = parse('{{#path}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support dot-segmented paths", function()
			{
				var result = parse('{{#path.path}} content {{/path.path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path","path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path","path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard parameters", function()
			{
				var result = parse('{{#path "param0" path.param1}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionParam", value:["path","param1"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support hash parameters", function()
			{
				var result = parse('{{#path param0=path.path param1="string"}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionHashParam", key:"param0", value:["path","path"] },
					{ type:"hbsExpressionHashParam", key:"param1", value:"string" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard and hash parameters", function()
			{
				var result = parse('{{#path "param0" path.param1 param2=path.path param3="string"}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionParam", value:"param0" },
					{ type:"hbsExpressionParam", value:["path","param1"] },
					{ type:"hbsExpressionHashParam", key:"param2", value:["path","path"] },
					{ type:"hbsExpressionHashParam", key:"param3", value:"string" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			// TODO :: move to a "behaviors" test file -- for when/if core Handlebars changes, I'll know
			it("should not support non-escape", function()
			{
				var result = parse("{{{#path param0 param1}}} content {{{/path}}}", options());
				
				return expect(result).to.be.rejected;
			});
			
			
			
			it("should support whitespace control", function()
			{
				//console.log( require("handlebars").compile('{{#path}} content {{/path}}')({path:[0,2]}) );
				//console.log( require("handlebars").compile('{{^path}} content {{/path}}')({path:false}) );
				//console.log( require("handlebars").var result = parse('{{#path~}} content {{~/path}}').body[0] );
				
				var result = parse('{{#path~}} content {{~/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", stripWhitespace:true },
					
					{ type:"text", value:"content" },
					
					{ type:"hbsTagStart", stripWhitespace:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support inverse", function()
			{
				var result = parse('{{^path}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true, inverted:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support inverse with whitespace control", function()
			{
				var result = parse('{{^path~}} content {{~/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true, inverted:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", stripWhitespace:true },
					
					{ type:"text", value:"content" },
					
					{ type:"hbsTagStart", stripWhitespace:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
		});
	});
});
