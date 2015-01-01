var fs = require("fs");
var devlog = require("../lib/devlog");
var parser = require("../lib");

var test = __dirname+"/templates/test.hbs";
//var test = __dirname+"/templates/test.html";
test = fs.readFileSync(test, {encoding:"utf8"});

new parser().parse(test);
