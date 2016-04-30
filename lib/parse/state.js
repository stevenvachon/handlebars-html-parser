"use strict";
var eventAttributes = require("event-attributes");



function createState(parentState)
{
	return {
		isAttr: false,
		
		isPreformattedTag: parentState.isPreformattedTag===true,
		
		isJSAttr: false,
		isJSLink: false,
		isJSTag: false,
		isScriptTag: false,
		
		isCSSAttr: false,
		isCSSTag: false,
		isStyleTag: false
	};
}



function updateState_attr(parentState, state, name, value)
{
	state.isAttr = true;
	
	if (eventAttributes.html[name]===true || eventAttributes.svg[name]===true)
	{
		state.isJSAttr = true;
	}
	
	// https://html.spec.whatwg.org/multipage/infrastructure.html#valid-url-potentially-surrounded-by-spaces
	if (name==="href" && value.trim().toLowerCase().indexOf("javascript:")===0)
	{
		state.isJSLink = true;
	}
	
	if (parentState.isScriptTag === true)
	{
		// Accepts: `type="text/javascript"`, `type=""`, `type` and absent type attribute
		// Rejects: `type="{{alias#}}"`, `type="anyting else"`
		if (name==="type" && value.toLowerCase()!=="text/javascript" && value!=="")
		{
			parentState.isJSTag = false;
		}
	}
	
	if (name === "style")
	{
		state.isCSSAttr = true;
	}
	
	if (parentState.isStyleTag === true)
	{
		// Accepts: `type="text/css"`, `type=""`, `type` and absent type attribute
		// Rejects: `type="{{alias#}}"`, `type="anyting else"`
		if (name==="type" && value.toLowerCase()!=="text/css" && value!=="")
		{
			parentState.isCSSTag = false;
		}
	}
}



function updateState_tag(parentState, state, name)
{
	if (state.isPreformattedTag === false)
	{
		state.isPreformattedTag = name==="pre" || name==="script" || name==="style" || name==="textarea";
	}
	
	state.isCSSTag = state.isStyleTag  = name === "style";
	state.isJSTag  = state.isScriptTag = name === "script";
}



module.exports = 
{
	attr: updateState_attr,
	create: createState,
	tag: updateState_tag
};
