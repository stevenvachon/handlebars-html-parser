"use strict";
var stringifyProgram = require("../lib/stringifyProgram");

var expect = require("chai").expect;
var fs = require("fs");
var handlebars = require("handlebars");



describe("stringifyProgram", function()
{
	it("should work", function(done)
	{
		var hbs = __dirname + "/templates/test.hbs";
		hbs = fs.readFileSync(hbs, {encoding:"utf8"});
		hbs = handlebars.parse(hbs);
		
		hbs = stringifyProgram(hbs);
		
		var expectedResult = '';
		expectedResult += '<{{alias1}} {{alias3}} attr="{{alias5}}" attr{{alias7}}="asdf" {{alias9}}>\n';
		expectedResult += '	{{alias11}} {{alias13}}\n';
		expectedResult += '	<!-- comment -->\n';
		expectedResult += '	value1\n';
		expectedResult += '</{{alias15}}>\n';
		
		expect(hbs).to.equal(expectedResult);
		
		done();
	});
});
