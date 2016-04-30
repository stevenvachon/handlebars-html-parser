"use strict";
var options = require("../lib/parseOptions");
var parse   = require("../lib/parse");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");



describe("parse()", () =>
{
	describe("HTML+Handlebars", () =>
	{
		describe("compound templates", () =>
		{
			it.skip("should support everything in one template", () =>
			{
				var template = __dirname+"/templates/test.hbs";
				//var template = __dirname+"/templates/test.html";
				template = fs.readFileSync(template, {encoding:"utf8"});
				
				var result = parse(template, options(/*{ collapseWhitespace:true }*/));
			});
		});
		
		
		
		describe("options", () =>
		{
			describe("convertHbsComments = true", () =>
			{
				it("should work", () =>
				{
					var result = parse('{{! comment }} content {{!-- comment --}}', options({ convertHbsComments:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlCommentStart" },
						{ type:"literal", value:" comment " },
						{ type:"htmlCommentEnd" },
						
						{ type:"literal", value:" content " },
						
						{ type:"htmlCommentStart" },
						{ type:"literal", value:" comment " },
						{ type:"htmlCommentEnd" },
					]);
				});
			});
			
			
			
			describe("normalizeWhitespace = true", () =>
			{
				it("should work", () =>
				{
					var result = parse("text©&copy; &nbsp;  ", options({ normalizeWhitespace:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"literal", value:"text©©   " },
					]);
				});
				
				
				
				it("should not support preformatted elements", () =>
				{
					var html = '<pre>   </pre><script>   </script><style>   </style><textarea>   </textarea>';
					var result = parse(html, options({ normalizeWhitespace:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"pre" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"literal", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"pre" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"literal", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"literal", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"textarea" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"literal", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"textarea" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support elements within preformatted elements", () =>
				{
					var html = '<pre>   <span>   </span>   </pre>';
					var result = parse(html, options({ normalizeWhitespace:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"pre" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"   " },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"span" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"   " },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"span" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"   " },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"pre" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support attribute values", () =>
				{
					var result = parse('<tag attr1="value  value"  attr2="value"></tag>', options({ normalizeWhitespace:true }));
					
					//return result.then(result => utils.devlog(result));
					
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
						{ type:"literal", value:"value  value" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"attr2" },
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
			});
			
			
			
			// NOTE :: autoprefixer not tested because its results change over time
			describe("processCSS = true", () =>
			{
				var styles;
				styles  = '\n';
				styles += '.classname\n';
				styles += '{\n';
				styles += '	property: value;\n';
				styles += '}\n';
				
				
				
				it("should support <style>", () =>
				{
					var result = parse('<style>'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:'.classname{property:value}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should support <style type="text/css">', () =>
				{
					var result = parse('<style type="text/css">'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"text/css" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:'.classname{property:value}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <style type="text/not-css">', () =>
				{
					var result = parse('<style type="text/not-css">'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"text/not-css" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <{{path}} type="text/css">', () =>
				{
					var result = parse('<{{path}} type="text/css">'+styles+'</{{path}}>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"text/css" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <style type="{{path}}">', () =>
				{
					var result = parse('<style type="{{path}}">'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it.skip('should not support <style {{path}}>', () =>
				{
					var result = parse('<style {{path}}>'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should support empty <style>', () =>
				{
					var result = parse('<style> </style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support style tags containing a Handlebars expression", () =>
				{
					var result,styles_p1,styles_p2;
					
					styles_p1 = '\n.classname { property: ';
					styles_p2 = '; }\n';
					
					result = parse('<style>'+styles_p1+'{{path}}'+styles_p2+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:styles_p1 },
						
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						
						{ type:"literal", value:styles_p2 },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support style attributes", () =>
				{
					var result = parse('<tag style=" property: value; ">text</tag>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:'property:value;' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support style attributes with a whitespace value", () =>
				{
					var result = parse('<tag style=" ">text</tag>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support style attributes with an empty value", () =>
				{
					var result = parse('<tag style="">text</tag>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"style" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
			});
			
			
			
			describe("processJS = true", () =>
			{
				var script;
				script  = '\n';
				script += 'function funcA (arg)\n';
				script += '{\n';
				script += '	funcB(arg, "arg");\n';
				script += '}\n';
				
				
				
				it("should support <script>", () =>
				{
					var result = parse('<script>'+script+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:'function funcA(n){funcB(n,"arg")}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should support <script type="text/javascript">', () =>
				{
					var result = parse('<script type="text/javascript">'+script+'</script>', options({ processJS:true }));
					
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
						
						{ type:"literal", value:'function funcA(n){funcB(n,"arg")}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <script type="text/not-javascript">', () =>
				{
					var result = parse('<script type="text/not-javascript">'+script+'</script>', options({ processJS:true }));
					
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
						
						{ type:"literal", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <{{path}} type="text/javascript">', () =>
				{
					var result = parse('<{{path}} type="text/javascript">'+script+'</{{path}}>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
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
						
						{ type:"literal", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <script type="{{path}}">', () =>
				{
					var result = parse('<script type="{{path}}">'+script+'</script>', options({ processJS:true }));
					
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
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				it.skip('should not support <script {{path}}>', () =>
				{
					var result = parse('<script {{path}}>'+script+'</script>', options({ processJS:true }));
					
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
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support empty <script>", () =>
				{
					var result = parse('<script> </script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support script tags containing a Handlebars expression", () =>
				{
					var result,script_p1,script_p2;
					
					script_p1 = '\nfunction funcA(arg){ funcB(arg, "';
					script_p2 = '"); }\n';
					
					result = parse('<script>'+script_p1+'{{path}}'+script_p2+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:script_p1 },
						
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						
						{ type:"literal", value:script_p2 },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support event attributes", () =>
				{
					var html = '<tag onclick="funcA(); if(something){ funcB() }">text</tag>';
					var result = parse(html, options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:'funcA(),something&&funcB();' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support event attributes with a whitespace value", () =>
				{
					var result = parse('<tag onclick=" ">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support event attributes with an empty value", () =>
				{
					var result = parse('<tag onclick="">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support event attributes containing a Handlebars expression", () =>
				{
					var result,script_p1,script_p2;
					
					script_p1 = 'funcA(); if(something){ funcB(\'';
					script_p2 = '\') }';
					
					result = parse('<tag onclick="'+script_p1+'{{path}}'+script_p2+'">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						
						{ type:"literal", value:script_p1 },
						
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						
						{ type:"literal", value:script_p2 },
						
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support javascript links", () =>
				{
					var html = '<tag href="javascript: funcA(); if(something){ funcB() }">text</tag>';
					var result = parse(html, options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:'javascript:funcA(),something&&funcB();' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support javascript links with only a scheme", () =>
				{
					var result = parse('<tag href="javascript:">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:'javascript:' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support javascript links containing a Handlebars expression", () =>
				{
					var result,script_p1,script_p2;
					
					script_p1 = 'javascript:funcA(); if(something){ funcB(\'';
					script_p2 = '\') }';
					
					result = parse('<tag href="'+script_p1+'{{path}}'+script_p2+'">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						
						{ type:"literal", value:script_p1 },
						
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsPartStart" },
						{ type:"hbsPath", value:["path"] },
						{ type:"hbsPartEnd" },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						
						{ type:"literal", value:script_p2 },
						
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support non-javascript links", () =>
				{
					var result = parse('<tag href="not-javascript">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"literal", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"literal", value:'not-javascript' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"literal", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"literal", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
			});
		});
	});
});
