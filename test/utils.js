"use strict";

var chai = require("chai");
chai.config.includeStack = true;
chai.use( require("chai-as-promised") );



module.exports = 
{
	devlog: require("../lib/devlog")
};
