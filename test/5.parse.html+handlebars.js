"use strict";
var devlog  = require("../lib/parse/devlog");
var options = require("../lib/options");
var parse   = require("../lib/parse");

var expect = require("chai").expect;
var fs = require("fs");



describe("parse()", function()
{
	describe("HTML+Handlebars", function()
	{
		describe("options", function()
		{
			it("convertHbsComments = true", function(done)
			{
				var result = parse('{{! comment }} content {{!-- comment --}}', options({ convertHbsComments:true }));
				
				expect(result).to.deep.equal(
				[
					{ type:"htmlCommentStart" },
					{ type:"text", value:" comment " },
					{ type:"htmlCommentEnd" },
					
					{ type:"text", value:" content " },
					
					{ type:"htmlCommentStart" },
					{ type:"text", value:" comment " },
					{ type:"htmlCommentEnd" },
				]);
				
				done();
			});
			
			
			
			it("minifyJS = true; script tags (#1)", function(done)
			{
				var result,script;
				
				script  = '\n';
				script += 'function funcA (arg)\n';
				script += '{\n';
				script += '	funcB(arg, "arg");\n';
				script += '}\n';
				
				result = parse('<script>'+script+'</script>', options({ minifyJS:true }));
				expect(result).to.deep.equal(
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
				
				result = parse('<script type="text/javascript">'+script+'</script>', options({ minifyJS:true }));
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
					
					{ type:"text", value:'function funcA(n){funcB(n,"arg")}' },
					
					{ type:"htmlTagStart", closing:true },
					{ type:"htmlTagNameStart" },
					{ type:"text", value:"script" },
					{ type:"htmlTagNameEnd" },
					{ type:"htmlTagEnd" }
				]);
				
				result = parse('<script type="text/not-javascript">'+script+'</script>', options({ minifyJS:true }));
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
					
					{ type:"text", value:script },
					
					{ type:"htmlTagStart", closing:true },
					{ type:"htmlTagNameStart" },
					{ type:"text", value:"script" },
					{ type:"htmlTagNameEnd" },
					{ type:"htmlTagEnd" }
				]);
				
				result = parse('<{{path}} type="text/javascript">'+script+'</{{path}}>', options({ minifyJS:true }));
				expect(result).to.deep.equal(
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
				
				result = parse('<script type="{{path}}">'+script+'</script>', options({ minifyJS:true }));
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
				
				/*result = parse('<script {{path}}>'+script+'</script>', options({ minifyJS:true }));
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
				]);*/
				
				result = parse('<script> </script>', options({ minifyJS:true }));
				expect(result).to.deep.equal(
				[
					{ type:"htmlTagStart" },
					{ type:"htmlTagNameStart" },
					{ type:"text", value:"script" },
					{ type:"htmlTagNameEnd" },
					{ type:"htmlTagEnd" },
					
					{ type:"text", value:"" },  // TODO :: have this removed?
					
					{ type:"htmlTagStart", closing:true },
					{ type:"htmlTagNameStart" },
					{ type:"text", value:"script" },
					{ type:"htmlTagNameEnd" },
					{ type:"htmlTagEnd" }
				]);
				
				done();
			});
			
			
			
			it("minifyJS = true; script tags (#2)", function(done)
			{
				var result,script_p1,script_p2;
				
				script_p1 = '\nfunction funcA(arg){ funcB(arg, "';
				script_p2 = '"); }\n';
				
				result = parse('<script>'+script_p1+'{{path}}'+script_p2+'</script>', options({ minifyJS:true }));
				
				expect(result).to.deep.equal(
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
				
				done();
			});
			
			
			
			it("minifyJS = true; event attributes", function(done)
			{
				var result;
				
				result = parse('<tag onevent="funcA(); if(something){ funcB() }">text</tag>', options({ minifyJS:true }));
				expect(result).to.deep.equal(
				[
					{ type:"htmlTagStart" },
					{ type:"htmlTagNameStart" },
					{ type:"text", value:"tag" },
					{ type:"htmlTagNameEnd" },
					{ type:"htmlAttrStart" },
					{ type:"htmlAttrNameStart" },
					{ type:"text", value:"onevent" },
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
				
				result = parse('<tag onevent=" ">text</tag>', options({ minifyJS:true }));
				expect(result).to.deep.equal(
				[
					{ type:"htmlTagStart" },
					{ type:"htmlTagNameStart" },
					{ type:"text", value:"tag" },
					{ type:"htmlTagNameEnd" },
					{ type:"htmlAttrStart" },
					{ type:"htmlAttrNameStart" },
					{ type:"text", value:"onevent" },
					{ type:"htmlAttrNameEnd" },
					{ type:"htmlAttrValueStart" },
					{ type:"text", value:"" },  // TODO :: have this removed?
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
				
				done();
			});
			
			
			
			it("minifyJS = true; javascript links", function(done)
			{
				var result = parse('<tag href="javascript: funcA(); if(something){ funcB() }">text</tag>', options({ minifyJS:true }));
				
				expect(result).to.deep.equal(
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
				
				done();
			});
			
			
			
			// TODO :: move to `.each()`?
			it("normalizeWhitespace = true", function(done)
			{
				var result = parse("text©&copy; &nbsp;  ", options({ normalizeWhitespace:true }));
				
				expect(result).to.deep.equal(
				[
					{ type:"text", value:"text©©   " },
				]);
				
				done();
			});
		});
	});
});
