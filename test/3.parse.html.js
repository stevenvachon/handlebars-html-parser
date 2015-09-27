"use strict";
//var devlog  = require("../lib/parse/devlog");
var options = require("../lib/options");
var parse   = require("../lib/parse");

var expect = require("chai").expect;
var fs = require("fs");



describe("parse()", function()
{
	describe("HTML", function()
	{
		it("should support a tag", function(done)
		{
			var result = parse('<tag></tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support a self-closing tag", function(done)
		{
			var result = parse('<tag/>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support an attribute", function(done)
		{
			var result = parse('<tag attr="value"></tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"value" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support an attribute with an empty value", function(done)
		{
			var result = parse('<tag attr=""></tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support an attribute with no value", function(done)
		{
			var result = parse('<tag attr></tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support attributes", function(done)
		{
			var result = parse('<tag attr1="value1" attr-2="value2" attr3="" attr4></tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr1" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"value1" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr-2" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"value2" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr3" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"attr4" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support text content", function(done)
		{
			var result = parse('<tag>text</tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"text", value:"text" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support nested tags and text content", function(done)
		{
			var result = parse('<tag><tag/>text<tag/></tag>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"text", value:"text" },
				
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"tag" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});	
		
		
		
		it("should support <script> tags", function(done)
		{
			var result = parse('<script>function a(arg){ b(arg,"arg") }</script>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"text", value:'function a(arg){ b(arg,"arg") }' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it('should support <script type="text/javascript"> tags', function(done)
		{
			var result = parse('<script type="text/javascript">function a(arg){ b(arg,"arg") }</script>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"type" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"text/javascript" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"text", value:'function a(arg){ b(arg,"arg") }' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
		
		
		
		it("should support unrecognized <script> tags", function(done)
		{
			var result = parse('<script type="text/not-javascript"><tag attr="value">text</tag></script>', options());
			
			expect(result).to.deep.equal(
			[
				{ type:"htmlTagStart" },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlAttrStart" },
				{ type:"htmlAttrNameStart" },
				{ type:"text", value:"type" },
				{ type:"htmlAttrNameEnd" },
				{ type:"htmlAttrValueStart" },
				{ type:"text", value:"text/not-javascript" },
				{ type:"htmlAttrValueEnd" },
				{ type:"htmlAttrEnd" },
				{ type:"htmlTagEnd" },
				
				{ type:"text", value:'<tag attr="value">text</tag>' },
				
				{ type:"htmlTagStart", closing:true },
				{ type:"htmlTagNameStart" },
				{ type:"text", value:"script" },
				{ type:"htmlTagNameEnd" },
				{ type:"htmlTagEnd" }
			]);
			
			done();
		});
	});
});
