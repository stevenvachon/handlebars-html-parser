"use strict";
//var devlog  = require("../lib/devlog");
var options = require("../lib/parseOptions");
var parse   = require("../lib/parse");

var utils = require("./utils");

var expect = require("chai").expect;
//var fs = require("fs");



describe("parse()", () =>
{
	describe("HTML", () =>
	{
		it("should support a tag", () =>
		{
			var result = parse('<tag></tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support a self-closing tag", () =>
		{
			var result = parse('<tag/>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support an attribute", () =>
		{
			var result = parse('<tag attr="value"></tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"value" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support an attribute with an empty value", () =>
		{
			var result = parse('<tag attr=""></tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support an attribute with no value", () =>
		{
			var result = parse('<tag attr></tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support attributes", () =>
		{
			var result = parse('<tag attr1="value1" attr-2="value2" attr3="" attr4></tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr1" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"value1" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr-2" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"value2" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr3" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"attr4" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support text content", () =>
		{
			var result = parse('<tag>text</tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:"text" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support nested tags and text content", () =>
		{
			var result = parse('<tag><tag></tag>text</tag>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:"text" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});	
		
		
		
		it("should support <script> tags", () =>
		{
			var result = parse('<script>function a(arg){ b(arg,"arg") }</script>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:'function a(arg){ b(arg,"arg") }' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it('should support <script type="text/javascript"> tags', () =>
		{
			var result = parse('<script type="text/javascript">function a(arg){ b(arg,"arg") }</script>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"type" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"text/javascript" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:'function a(arg){ b(arg,"arg") }' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		it("should support unrecognized <script> tags", () =>
		{
			var result = parse('<script type="text/not-javascript"><tag attr="value">text</tag></script>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"literal", value:"type" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"literal", value:"text/not-javascript" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:'<tag attr="value">text</tag>' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		// TODO :: https://github.com/inikulin/parse5/issues/107
		it.skip("should support <template> tags", () =>
		{
			var result = parse('<template><tag attr="value">text</tag></template>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"template" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:'<tag attr="value">text</tag>' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"template" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
		});
		
		
		
		// TODO :: test `<template>{{path}}<tag></tag></template`
		
		
		
		it("should support a comment", () =>
		{
			var result = parse('<!-- text -->', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlCommentStart" },
				{ type:"literal", value:" text " },
				{ type:"htmlCommentEnd" }
			]);
		});
		
		
		
		it("should support a downlevel-hidden Explorer conditional comment", () =>
		{
			var result = parse('<!--[if lt IE 8]><![if gt IE 7]><tag>text</tag><![endif]><![endif]-->', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlCommentStart" },
				{ type:"literal", value:'[if lt IE 8]><![if gt IE 7]><tag>text</tag><![endif]><![endif]' },
				{ type:"htmlCommentEnd" }
			]);
		});
		
		
		
		it("should not support a downlevel-reveal Explorer conditional comment", () =>
		{
			var result = parse('<![if lt IE 8]><tag>text</tag><![endif]>', options());
			
			return expect(result).to.eventually.deep.equal(
			[
				{ type:"htmlCommentStart" },
				{ type:"literal", value:"[if lt IE 8]" },
				{ type:"htmlCommentEnd" },
				
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"literal", value:"text" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"literal", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlCommentStart" },
				{ type:"literal", value:"[endif]" },
				{ type:"htmlCommentEnd" }
			]);
		});
	});
});
