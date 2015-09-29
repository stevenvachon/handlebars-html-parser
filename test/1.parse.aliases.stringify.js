"use strict";
var aliases = require("../lib/parse/aliases");

var expect = require("chai").expect;
var fs = require("fs");
var handlebars = require("handlebars");



describe("aliases.stringify()", function()
{
	describe("comments", function()
	{
		it("should be aliased", function(done)
		{
			var hbs = "{{! comment }} content {{!-- comment --}}";
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			expect(hbs).to.equal("handlebars-html-parser-0-alias content handlebars-html-parser-2-alias");
			
			done();
		});
	});
	
	
	
	describe("non-blocks", function()
	{
		it("should be aliased", function(done)
		{
			var hbs = "{{path}} content {{path}}";
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			expect(hbs).to.equal("handlebars-html-parser-0-alias content handlebars-html-parser-2-alias");
			
			done();
		});
		
		
		
		it("should support dot-separations", function(done)
		{
			var hbs = "{{path.path}} content {{path.path}}";
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			expect(hbs).to.equal("handlebars-html-parser-0-alias content handlebars-html-parser-2-alias");
			
			done();
		});
		
		
		
		it("should support whitespace-control", function(done)
		{
			var hbs = "{{path~}} content {{~path}}";
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			expect(hbs).to.equal("handlebars-html-parser-0-alias content handlebars-html-parser-2-alias");
			
			done();
		});
	});
	
	
	
	describe("blocks", function()
	{
		it("should be aliased", function(done)
		{
			var hbs = "{{#path}} content {{/path}}";
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			expect(hbs).to.equal("handlebars-html-parser-0-alias");
			
			done();
		});
		
		
		
		it("should alias inverse blocks", function(done)
		{
			var hbs = "{{^path}} content {{/path}}";
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			expect(hbs).to.equal("handlebars-html-parser-0-alias");
			
			done();
		});
	});
	
	
	
	describe("more complex templates", function()
	{
		// TODO :: just run this test?
		it("should support everything in one template", function(done)
		{
			var hbs = __dirname + "/templates/test.hbs";
			hbs = fs.readFileSync(hbs, {encoding:"utf8"});
			hbs = handlebars.parse(hbs);
			
			hbs = aliases.stringify(hbs);
			
			var expectedResult = '';
			expectedResult += '<handlebars-html-parser-1-alias handlebars-html-parser-3-alias attr="handlebars-html-parser-5-alias" attrhandlebars-html-parser-7-alias="asdf" handlebars-html-parser-9-alias>\n';
			expectedResult += '	handlebars-html-parser-11-alias handlebars-html-parser-13-alias\n';
			expectedResult += '	<!-- comment -->\n';
			expectedResult += '	value1\n';
			expectedResult += '</handlebars-html-parser-15-alias>\n';
			
			expect(hbs).to.equal(expectedResult);
			
			done();
		});
	});
});
