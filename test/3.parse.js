"use strict";
//var devlog  = require("../lib/parse/devlog");
var options = require("../lib/options");
var parse   = require("../lib/parse");

var expect = require("chai").expect;
var fs = require("fs");



describe("parse()", function()
{
	describe("comments", function()
	{
		// TODO :: test {{#! block comment? }}, {{^! inverse comment? }} and {{{! comment }}}
		it("should be supported", function(done)
		{
			var result = parse("{{! comment }} content {{!-- comment --}}", options());
			
			expect(result).to.deep.equal(
			[
				{ type:"hbsTagStart", comment:true },
				{ type:"text", value:" comment " },
				{ type:"hbsTagEnd" },
				
				{ type:"text", value:" content " },
				
				{ type:"hbsTagStart", comment:true },
				{ type:"text", value:" comment " },
				{ type:"hbsTagEnd" }
			]);
			
			done();
		});
	});
	
	
	
	describe("non-blocks", function()
	{
		// TODO :: test {{undefined}}, {{null}}, {{true}}, {{1}}
		it("should be supported", function(done)
		{
			var result = parse("{{path}} content {{path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support dot-segmented paths", function(done)
		{
			var result = parse("{{path.path}} content {{../parentPath}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support standard parameters", function(done)
		{
			var result = parse("{{path 'param0' path.param1}} content {{path 'param0' path.param1}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it.skip("should support sub-expression parameters", function(done)
		{
			var result = parse("{{path (path 'param0')}} content {{path (path 'param0')}}", options());
			
			/*expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support hash parameters", function(done)
		{
			var result = parse("{{path param0=path.path param1='string'}} content {{path param0=path.path param1='string'}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support standard and hash parameters", function(done)
		{
			var result = parse("{{path 'param0' path.param1 param2=path.path param3='string'}} content {{path 'param0' path.param1 param2=path.path param3='string'}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support non-escape", function(done)
		{
			var result = parse("{{{path}}} content {{{path}}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support whitespace control", function(done)
		{
			var result = parse("{{path~}} content {{~path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
	});
	
	
	
	describe("blocks", function()
	{
		it("should be supported", function(done)
		{
			var result = parse("{{#path}} content {{/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support dot-segmented paths", function(done)
		{
			var result = parse("{{#path.path}} content {{/path.path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support standard parameters", function(done)
		{
			var result = parse("{{#path 'param0' path.param1}} content {{/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support hash parameters", function(done)
		{
			var result = parse("{{#path param0=path.path param1='string'}} content {{/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support standard and hash parameters", function(done)
		{
			var result = parse("{{#path 'param0' path.param1 param2=path.path param3='string'}} content {{/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		// TODO :: move to a "behaviors" test file -- for when/if core Handlebars changes, I'll know
		it("should not support non-escape", function(done)
		{
			var result = function()
			{
				parse("{{{#path param0 param1}}} content {{{/path}}}", options());
			};
			
			expect(result).to.throw(Error);
			
			done();
		});
		
		
		
		it("should support whitespace control", function(done)
		{
			//console.log( require("handlebars").compile("{{#path}} content {{/path}}")({path:[0,2]}) );
			//console.log( require("handlebars").compile("{{^path}} content {{/path}}")({path:false}) );
			//console.log( require("handlebars").parse("{{#path~}} content {{~/path}}").body[0] );
			
			var result = parse("{{#path~}} content {{~/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support inverse", function(done)
		{
			var result = parse("{{^path}} content {{/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
		
		
		
		it("should support inverse with whitespace control", function(done)
		{
			var result = parse("{{^path~}} content {{~/path}}", options());
			
			expect(result).to.deep.equal(
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
			
			done();
		});
	});
	
	
	
	describe("more complex templates", function()
	{
		it.skip("should support everything in one template", function(done)
		{
			var test = __dirname+"/templates/test.hbs";
			//var test = __dirname+"/templates/test.html";
			test = fs.readFileSync(test, {encoding:"utf8"});
			
			new parser({ collapseWhitespace:true }).parse(test);
			
			done();
		});
	});
	
	
	
	describe("options", function()
	{
		it("convertHbsComments = true", function(done)
		{
			var result = parse("{{! comment }} content {{!-- comment --}}", options({ convertHbsComments:true }));
			
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
		
		
		
		// TODO :: move to `.each()`
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
