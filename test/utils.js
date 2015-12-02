"use strict";

var chai = require("chai");
chai.config.includeStack = true;
chai.use( require("chai-as-promised") );

require("es6-promise").polyfill();
require("object.assign").shim();
