"use strict";
//var devlog  = require("../lib/devlog");
var options = require("../lib/parseOptions");
var parse   = require("../lib/parse");

var utils = require("./utils");

var expect = require("chai").expect;
//var fs = require("fs");



describe("parse()", function()
{
	describe("Handlebars", function()
	{
		describe("comments", function()
		{
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
			
			
			
			it("should not support a \"block comment\"", function()
			{
				var result = parse('{{#! block comment? }}', options());
				
				return expect(result).to.eventually.be.rejected;
			});
			
			
			
			it("should not support an \"inverse comment\"", function()
			{
				var result = parse('{{^! inverse comment? }}', options());
				
				return expect(result).to.eventually.be.rejected;
			});
			
			
			
			it("should not support an \"unescaped comment\"", function()
			{
				var result = parse('{{{! unescaped comment? }}}', options());
				
				return expect(result).to.eventually.be.rejected;
			});
		});
		
		
		
		describe("non-blocks", function()
		{
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
				var hbs = '';
				hbs += '{{path param0=path.path param1="string"}}';
				hbs += ' content ';
				hbs += '{{path param0=path.path param1="string"}}';
				
				var result = parse(hbs, options());
				
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
				var hbs = '';
				hbs += '{{path "param0" path.param1 param2=path.path param3="string"}}';
				hbs += ' content ';
				hbs += '{{path "param0" path.param1 param2=path.path param3="string"}}';
				
				var result = parse(hbs, options());
				
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
			
			
			
			it("should support unescape", function()
			{
				var result = parse('{{{path}}} content {{{path}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", notEscaped:true },  // TODO :: rename to `unescaped`
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
				// TODO :: https://github.com/wycats/handlebars.js/issues/1181
				//var result = parse('{{path~}} content {{{~path}}}', options());
				
				var result = parse('{{path~}} content {{~path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", stripWhitespace:true },
					
					{ type:"text", value:"content" },
					
					{ type:"hbsTagStart"/*, notEscaped:true*/, stripWhitespace:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd"/*, notEscaped:true*/ }
				]);
			});
			
			
			
			it("should support data references", function()
			{
				var result = parse('{{@path}} content {{{@path}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"], data:true },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:["path"], data:true },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
				]);
			});
			
			
			
			it("should support undefined", function()
			{
				var result = parse('{{undefined}} content {{{undefined}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[undefined] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[undefined] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
				]);
			});
			
			
			
			it("should support null", function()
			{
				var result = parse('{{null}} content {{{null}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[null] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[null] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
				]);
			});
			
			
			
			it("should support booleans", function()
			{
				var result = parse('{{true}} content {{{false}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[true] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[false] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
				]);
			});
			
			
			
			it("should support integers", function()
			{
				var result = parse('{{1}} content {{{1}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[1] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[1] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
				]);
			});
			
			
			
			it("should support floats", function()
			{
				var result = parse('{{1.1}} content {{{1.1}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[1.1] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"hbsTagStart", notEscaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsExpressionPath", value:[1.1] },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", notEscaped:true }
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
			it("should not support unescape", function()
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
