"use strict";
var eachSeries = require("each-series");



function each(array, callback)
{
	return new Promise( function(resolve, reject)
	{
		eachSeries(array, callback, function(error)
		{
			if (error != null) throw error;
			resolve();
		});
	});
}



module.exports = each;
