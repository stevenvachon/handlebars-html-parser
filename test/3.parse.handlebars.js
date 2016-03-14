"use strict";
var options = require("../lib/parseOptions");
var parse   = require("../lib/parse");

var utils = require("./utils");

var expect = require("chai").expect;



describe("parse()", () =>
{
	describe("Handlebars", () =>
	{
		describe("comments", () =>
		{
			it("should be supported", () =>
			{
				var result = parse('{{! comment }} content {{!-- comment --}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", comment:true },
					{ type:"literal", value:" comment " },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", comment:true },
					{ type:"literal", value:" comment " },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should not support a \"block comment\"", () =>
			{
				var result = parse('{{#! block comment? }}', options());
				
				return expect(result).to.eventually.be.rejected;
			});
			
			
			
			it("should not support an \"inverse comment\"", () =>
			{
				var result = parse('{{^! inverse comment? }}', options());
				
				return expect(result).to.eventually.be.rejected;
			});
			
			
			
			it("should not support an \"unescaped comment\"", () =>
			{
				var result = parse('{{{! unescaped comment? }}}', options());
				
				return expect(result).to.eventually.be.rejected;
			});
		});
		
		
		
		describe("non-blocks", () =>
		{
			it("should support paths", () =>
			{
				var result = parse('{{path}} content {{path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support unescape", () =>
			{
				var result = parse('{{path}} content {{{path}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support unescape (#2)", () =>
			{
				var result = parse('{{path}} content {{&path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support whitespace control", () =>
			{
				var result = parse('{{~path~}} content {{~{path}~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true, strip:true }
				]);
			});
			
			
			
			it("should support whitespace control (#2)", () =>
			{
				var result = parse('{{path~}} content {{~{path}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support partials", () =>
			{
				var result = parse('{{> path}} content {{> path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", partial:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", partial:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support data references", () =>
			{
				var result = parse('{{@path}} content {{{@path}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support undefined", () =>
			{
				var result = parse('{{undefined}} content {{{undefined}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:undefined },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:undefined },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support null", () =>
			{
				var result = parse('{{null}} content {{{null}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:null },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:null },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support booleans", () =>
			{
				var result = parse('{{true}} content {{{false}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:false },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support integers", () =>
			{
				var result = parse('{{1}} content {{{1}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support floats", () =>
			{
				var result = parse('{{1.1}} content {{{1.1}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1.1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1.1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support strings", () =>
			{
				var result = parse('{{"string"}} content {{{"string"}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support dot-segmented paths", () =>
			{
				var result = parse('{{path.path}} content {{{../parentPath}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["parentPath"] },  // ".." ignored because no traversing has occcurred (`{{#with}}`, etc)
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support standard parameters", () =>
			{
				var result = parse('{{path "param0" path.param1}} content {{{path "param0" path.param1}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true },
				]);
			});
			
			
			
			it("should support hash parameters", () =>
			{
				var hbs = '';
				hbs += '{{path param0=path.path param1="string" 2=2}}';
				hbs += ' content ';
				hbs += '{{{path param0=path.path param1="string" 2=2}}}';
				
				var result = parse(hbs, options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:2 },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:2 },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support standard and hash parameters", () =>
			{
				var hbs = '';
				hbs += '{{path "param0" path.param1 param2=path.path param3="string"}}';
				hbs += ' content ';
				hbs += '{{{path "param0" path.param1 param2=path.path param3="string"}}}';
				
				var result = parse(hbs, options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param3" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param3" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support sub-expressions within standard parameters", () =>
			{
				var result = parse('{{path (path "param0")}} content {{{path (path "param0")}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support sub-expressions within hash parameters", () =>
			{
				var result = parse('{{path param0=(path "param1")}} content {{{path param0=(path "param1")}}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param1" },  // TODO :: could contain html?
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param1" },  // TODO :: could contain html?
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
			
			
			
			it("should support sub-expressions within standard and hash parameters", () =>
			{
				var hbs = '';
				hbs += '{{path (path "param1") param2=(path "param2")}}';
				hbs += ' content ';
				hbs += '{{{path (path "param1") param2=(path "param2")}}}';
				
				var result = parse(hbs, options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", unescaped:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", unescaped:true }
				]);
			});
		});
		
		
		
		describe("blocks", () =>
		{
			it("should support paths", () =>
			{
				var result = parse('{{#path}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			// TODO :: move to a "behaviors" test file -- for when/if core Handlebars changes, I'll know
			it("should not support unescape", () =>
			{
				var result = parse("{{{#path param0 param1}}} content {{{/path}}}", options());
				
				return expect(result).to.be.rejected;
			});
			
			
			
			it("should not support unescape (#2)", () =>
			{
				var result = parse("{{&#path param0 param1}}} content {{/path}}", options());
				
				return expect(result).to.be.rejected;
			});
			
			
			
			it("should support whitespace control", () =>
			{
				//console.log( require("handlebars").compile('{{#path}} content {{/path}}')({path:[0,2]}) );
				//console.log( require("handlebars").compile('{{^path}} content {{/path}}')({path:false}) );
				//console.log( require("handlebars").var result = parse('{{#path~}} content {{~/path}}').body[0] );
				
				var result = parse('{{~#path~}} content {{~/path~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support whitespace control (#2)", () =>
			{
				var result = parse('{{#path~}} content {{~/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support data references", () =>
			{
				var result = parse('{{#@path}} content {{/@path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support data references with whitespace control", () =>
			{
				var result = parse('{{~#@path~}} content {{~/@path~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support undefined", () =>
			{
				var result = parse('{{#undefined}} content {{/undefined}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:undefined },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:undefined },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support strings with whitespace control", () =>
			{
				var result = parse('{{~#undefined~}} content {{~/undefined~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:undefined },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:undefined },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support null", () =>
			{
				var result = parse('{{#null}} content {{/null}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:null },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:null },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support null with whitespace control", () =>
			{
				var result = parse('{{~#null~}} content {{~/null~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:null },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:null },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support booleans", () =>
			{
				var result = parse('{{#true}} content {{/true}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support booleans with whitespace control", () =>
			{
				var result = parse('{{~#true~}} content {{~/true~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support integers", () =>
			{
				var result = parse('{{#1}} content {{/1}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support integers with whitespace control", () =>
			{
				var result = parse('{{~#1~}} content {{~/1~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support floats", () =>
			{
				var result = parse('{{#1.1}} content {{/1.1}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1.1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1.1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support floats with whitespace control", () =>
			{
				var result = parse('{{~#1.1~}} content {{~/1.1~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1.1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1.1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support strings", () =>
			{
				var result = parse('{{#"string"}} content {{/"string"}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support strings with whitespace control", () =>
			{
				var result = parse('{{~#"string"~}} content {{~/"string"~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support inverse", () =>
			{
				var result = parse('{{^path}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true, inverted:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support inverse with whitespace control", () =>
			{
				var result = parse('{{~^path~}} content {{~/path~}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", strip:true, block:true, inverted:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true },
					
					{ type:"literal", value:"content" },
					
					{ type:"hbsTagStart", strip:true, closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd", strip:true }
				]);
			});
			
			
			
			it("should support dot-segmented paths", () =>
			{
				var result = parse('{{#path.path}} content {{/path.path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard parameters", () =>
			{
				var result = parse('{{#path "param0" path.param1}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support hash parameters", () =>
			{
				var result = parse('{{#path param0=path.path param1="string"}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support block parameters", () =>
			{
				var result = parse('{{#path 1 2 3 as |param0 param1 param2|}} {{param0}} {{param1}} {{param2}} {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:1 },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:2 },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:3 },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsBlockParams", value:["param0","param1","param2"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["param0"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" " },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["param2"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard and hash parameters", () =>
			{
				var result = parse('{{#path "param0" path.param1 param2=path.path param3="string"}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param3" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support standard, hash and block parameters", () =>
			{
				var hbs = '';
				hbs += '{{#path "param0" path.param1 param2=path.path param3="string" as |param0 param1|}}';
				hbs += ' content ';
				hbs += '{{/path}}';
				
				var result = parse(hbs, options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsPath", value:["path","path"] },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param3" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"literal", value:"string" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsBlockParams", value:["param0","param1"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support sub-expressions within standard parameters", () =>
			{
				var result = parse('{{#path (path "param0")}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support sub-expressions within hash parameters", () =>
			{
				var result = parse('{{#path param0=(path "param1")}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param0" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it("should support sub-expressions within standard and hash parameters", () =>
			{
				var result = parse('{{#path (path "param1") param2=(path "param2")}} content {{/path}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param1" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsHashStart" },
					{ type:"hbsHashKeyStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsHashKeyEnd" },
					{ type:"hbsHashValueStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"literal", value:"param2" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsHashValueEnd" },
					{ type:"hbsHashEnd" },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
		});
		
		
		
		// https://github.com/wycats/handlebars.js/blob/master/spec/builtins.js
		describe("built-in helpers", () =>
		{
			it("should support each/index/key/first/last", () =>
			{
				var result = parse('{{#each path}}{{@index}}{{@key}}{{@first}}{{@last}}{{/each}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["each"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["index"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["key"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["first"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["last"], data:true },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["each"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
				]);
			});
			
			
			
			it("should support each with block parameters", () =>
			{
				var result = parse('{{#each path as |value index|}}{{value}}{{index}}{{/each}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["each"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsBlockParams", value:["value","index"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["value"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart" },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["index"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["each"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
			
			
			
			it.skip("should support if/else if/else", () =>
			{
				var result = parse('{{#if path}} content1 {{else if path}} content2 {{else}} content3 {{/if}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["if"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
				]);
			});
			
			
			
			it.skip("should support with/else", () =>
			{
				var result = parse('{{#with path}} content1 {{else}} content2 {{/with}}', options());
				
				return expect(result).to.eventually.deep.equal(
				[
					{ type:"hbsTagStart", block:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["with"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content1 " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["with"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					{ type:"hbsTagStart", block:true, inverted:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["with"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["path"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" },
					
					{ type:"literal", value:" content2 " },
					
					{ type:"hbsTagStart", closing:true },
					{ type:"hbsExpressionStart" },
					{ type:"hbsPartStart" },
					{ type:"hbsPath", value:["with"] },
					{ type:"hbsPartEnd" },
					{ type:"hbsExpressionEnd" },
					{ type:"hbsTagEnd" }
				]);
			});
		});
	});
});
