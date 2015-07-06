"use strict";
//var devlog = require("../lib/devlog");
var parser = require("../lib");

var expect = require("chai").expect;
var fs = require("fs");



describe("parser.parse()", function()
{
	it("should work", function(done)
	{
		var test = __dirname+"/templates/test.hbs";
		//var test = __dirname+"/templates/test.html";
		test = fs.readFileSync(test, {encoding:"utf8"});
		
		new parser().parse(test);
		
		done();
	});
});
