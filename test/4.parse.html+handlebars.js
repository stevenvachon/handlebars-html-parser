"use strict";
//var devlog  = require("../lib/devlog");
var options = require("../lib/parseOptions");
var parse   = require("../lib/parse");

var utils = require("./utils");

var expect = require("chai").expect;
var fs = require("fs");



describe("parse()", function()
{
	describe("HTML+Handlebars", function()
	{
		describe("compound templates", function()
		{
			it.skip("should support everything in one template", function()
			{
				var template = __dirname+"/templates/test.hbs";
				//var template = __dirname+"/templates/test.html";
				template = fs.readFileSync(template, {encoding:"utf8"});
				
				var result = parse(template, options(/*{ collapseWhitespace:true }*/));
			});
		});
		
		
		
		describe("options", function()
		{
			describe("convertHbsComments = true", function()
			{
				it("should work", function()
				{
					var result = parse('{{! comment }} content {{!-- comment --}}', options({ convertHbsComments:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlCommentStart" },
						{ type:"text", value:" comment " },
						{ type:"htmlCommentEnd" },
						
						{ type:"text", value:" content " },
						
						{ type:"htmlCommentStart" },
						{ type:"text", value:" comment " },
						{ type:"htmlCommentEnd" },
					]);
				});
			});
			
			
			
			describe("normalizeWhitespace = true", function()
			{
				it("should work", function()
				{
					var result = parse("text©&copy; &nbsp;  ", options({ normalizeWhitespace:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"text", value:"text©©   " },
					]);
				});
				
				
				
				it("should not support preformatted elements", function()
				{
					var html = '<pre>   </pre><script>   </script><style>   </style><textarea>   </textarea>';
					var result = parse(html, options({ normalizeWhitespace:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"pre" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"text", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"pre" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"text", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"text", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"textarea" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						{ type:"text", value:"   " },
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"textarea" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
			});
			
			
			
			// NOTE :: autoprefixer not tested because its results change over time
			describe("processCSS = true", function()
			{
				var styles;
				styles  = '\n';
				styles += '.classname\n';
				styles += '{\n';
				styles += '	property: value;\n';
				styles += '}\n';
				
				
				
				it("should support <style>", function()
				{
					var result = parse('<style>'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:'.classname{property:value}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should support <style type="text/css">', function()
				{
					var result = parse('<style type="text/css">'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"text/css" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:'.classname{property:value}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <style type="text/not-css">', function()
				{
					var result = parse('<style type="text/not-css">'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"text/not-css" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <{{path}} type="text/css">', function()
				{
					var result = parse('<{{path}} type="text/css">'+styles+'</{{path}}>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"text/css" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <style type="{{path}}">', function()
				{
					var result = parse('<style type="{{path}}">'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it.skip('should not support <style {{path}}>', function()
				{
					var result = parse('<style {{path}}>'+styles+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"type" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:styles },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should support empty <style>', function()
				{
					var result = parse('<style> </style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support style tags containing a Handlebars expression", function()
				{
					var result,styles_p1,styles_p2;
					
					styles_p1 = '\n.classname { property: ';
					styles_p2 = '; }\n';
					
					result = parse('<style>'+styles_p1+'{{path}}'+styles_p2+'</style>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:styles_p1 },
						
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						
						{ type:"text", value:styles_p2 },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support style attributes", function()
				{
					var result = parse('<tag style=" property: value; ">text</tag>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:'property:value;' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support style attributes with a whitespace value", function()
				{
					var result = parse('<tag style=" ">text</tag>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support style attributes with an empty value", function()
				{
					var result = parse('<tag style="">text</tag>', options({ processCSS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"style" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
			});
			
			
			
			describe("processJS = true", function()
			{
				var script;
				script  = '\n';
				script += 'function funcA (arg)\n';
				script += '{\n';
				script += '	funcB(arg, "arg");\n';
				script += '}\n';
				
				
				
				it("should support <script>", function()
				{
					var result = parse('<script>'+script+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:'function funcA(n){funcB(n,"arg")}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should support <script type="text/javascript">', function()
				{
					var result = parse('<script type="text/javascript">'+script+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
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
						
						{ type:"text", value:'function funcA(n){funcB(n,"arg")}' },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <script type="text/not-javascript">', function()
				{
					var result = parse('<script type="text/not-javascript">'+script+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
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
						
						{ type:"text", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <{{path}} type="text/javascript">', function()
				{
					var result = parse('<{{path}} type="text/javascript">'+script+'</{{path}}>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
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
						
						{ type:"text", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it('should not support <script type="{{path}}">', function()
				{
					var result = parse('<script type="{{path}}">'+script+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
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
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				it.skip('should not support <script {{path}}>', function()
				{
					var result = parse('<script {{path}}>'+script+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
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
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:script },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support empty <script>", function()
				{
					var result = parse('<script> </script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should not support script tags containing a Handlebars expression", function()
				{
					var result,script_p1,script_p2;
					
					script_p1 = '\nfunction funcA(arg){ funcB(arg, "';
					script_p2 = '"); }\n';
					
					result = parse('<script>'+script_p1+'{{path}}'+script_p2+'</script>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:script_p1 },
						
						{ type:"hbsTagStart" },
						{ type:"hbsExpressionStart" },
						{ type:"hbsExpressionPath", value:["path"] },
						{ type:"hbsExpressionEnd" },
						{ type:"hbsTagEnd" },
						
						{ type:"text", value:script_p2 },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"script" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support event attributes", function()
				{
					var html = '<tag onclick="funcA(); if(something){ funcB() }">text</tag>';
					var result = parse(html, options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:'funcA(),something&&funcB();' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support event attributes with a whitespace value", function()
				{
					var result = parse('<tag onclick=" ">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support event attributes with an empty value", function()
				{
					var result = parse('<tag onclick="">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"onclick" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:"" },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it.skip("should not support event attributes containing a Handlebars expression", function()
				{
					
				});
				
				
				
				it("should support javascript links", function()
				{
					var html = '<tag href="javascript: funcA(); if(something){ funcB() }">text</tag>';
					var result = parse(html, options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:'javascript:funcA(),something&&funcB();' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it("should support javascript links with only a scheme", function()
				{
					var result = parse('<tag href="javascript:">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:'javascript:' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
				
				
				
				it.skip("should not support javascript links containing a Handlebars expression", function()
				{
					
				});
				
				
				
				it("should not support non-javascript links", function()
				{
					var result = parse('<tag href="not-javascript">text</tag>', options({ processJS:true }));
					
					return expect(result).to.eventually.deep.equal(
					[
						{ type:"htmlTagStart" },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlAttrStart" },
						{ type:"htmlAttrNameStart" },
						{ type:"text", value:"href" },
						{ type:"htmlAttrNameEnd" },
						{ type:"htmlAttrValueStart" },
						{ type:"text", value:'not-javascript' },
						{ type:"htmlAttrValueEnd" },
						{ type:"htmlAttrEnd" },
						{ type:"htmlTagEnd" },
						
						{ type:"text", value:"text" },
						
						{ type:"htmlTagStart", closing:true },
						{ type:"htmlTagNameStart" },
						{ type:"text", value:"tag" },
						{ type:"htmlTagNameEnd" },
						{ type:"htmlTagEnd" }
					]);
				});
			});
		});
	});
});
