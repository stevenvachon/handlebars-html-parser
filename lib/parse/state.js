"use strict";
var eventAttributes = require("event-attributes");



function createNewState()
{
	return {
		isScriptAttr: false,
		isScriptLink: false,
		isScriptTag: false,
		isStyleAttr: false,
		isStyleTag: false,
	};
}



function updateState_attrEnd(state)
{
	state.isScriptAttr = false;
	state.isStyleAttr = false;
}



function updateState_attrStart(state, name, value)
{
	if (eventAttributes.html[name]===true || eventAttributes.svg[name]===true)
	{
		state.isScriptAttr = true;
	}
	
	// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
	if (name==="href" && value.trim().toLowerCase().indexOf("javascript:")===0)
	{
		state.isScriptLink = true;
	}
	
	if (state.isScriptTag === true)
	{
		// If contains something other than JavaScript code
		// Covers: `type="text/javascript"`, `type=""`, `type`, `type="{{alias#}}"` and absent type attribute
		if (name==="type" && value.toLowerCase()!=="text/javascript" && value!=="")
		{
			state.isScriptTag = false;
		}
	}
	
	if (name === "style")
	{
		state.isStyleAttr = true;
	}
	
	if (state.isStyleTag === true)
	{
		// If contains something other than CSS code
		// Covers: `type="text/css"`, `type=""`, `type`, `type="{{alias#}}"` and absent type attribute
		if (name==="type" && value.toLowerCase()!=="text/css" && value!=="")
		{
			state.isStyleTag = false;
		}
	}
}



function updateState_tagEnd(state)
{
	state.isScriptTag = false;
	state.isStyleTag = false;
}



function updateState_tagStart(state, name)
{
	state.isScriptTag = name === "script";
	state.isStyleTag  = name === "style";
}



module.exports = 
{
	createNew: createNewState,
	updateAttrEnd: updateState_attrEnd,
	updateAttrStart: updateState_attrStart,
	updateTagEnd: updateState_tagEnd,
	updateTagStart: updateState_tagStart
};
