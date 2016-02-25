"use strict";
var NodeType = require("./NodeType");



function addTop(stack, value)
{
	if (value === undefined) value = 0;
	
	stack.push(value);
}



/*
	Run a provided function once per element in the generated
	linear program.
*/
function each(program, options, callback)
{
	var i;
	var numNodes = program.length;
	var state = 
	{
		// Stacks indexed by parent tag depth -- first index is a "document" node (root/top-level nodes container)
		attrCounts:     [0],      // atributes per element in stack
		childCounts:    [0],      // child count per element in stack
		//hbsCounts:      [0],      // Handlebar expression count per element's text content in stack
		
		//hasCssMimeType:    false,  // <style type="text/css"…
		//hasJsMimeType:     false,  // <script type="text/javascript"…
		isAttribute:       false,  // <tag …
		isAttributeName:   false,  // <tag attr
		isAttributeValue:  false,  // <tag attr="value"
		isClosingTag:      false,  // </…
		isComment:         false,  // <!--…
		isStyleAttribute:  false,  // <tag style
		isTag:             false,  // <…>
		isTagName:         false,  // <tag
		isWithinScriptTag: false,  // <script>…
		isWithinStyleTag:  false   // <style>…
		
		//scriptType: null,  // <script type="…"
		//styleType:  null   // <style type="…"
	};
	
	for (i=0; i<numNodes; i++)
	{
		eachNode(program[i], state, options, callback);
	}
}



function eachNode(node, state, options, callback)
{
	var callbackInvoked = false;
	
	switch (node.type)
	{
		case NodeType.HBS_EXPRESSION_END:
		{
			break;
		}
		case NodeType.HBS_EXPRESSION_START:
		{
			break;
		}
		
		
		case NodeType.HBS_HASH_END:
		{
			break;
		}
		case NodeType.HBS_HASH_START:
		{
			break;
		}
		
		
		case NodeType.HBS_HASH_KEY_END:
		{
			break;
		}
		case NodeType.HBS_HASH_KEY_START:
		{
			break;
		}
		
		
		case NodeType.HBS_HASH_VALUE_END:
		{
			break;
		}
		case NodeType.HBS_HASH_VALUE_START:
		{
			break;
		}
		
		
		case NodeType.HBS_PART_END:
		{
			break;
		}
		case NodeType.HBS_PART_START:
		{
			break;
		}
		
		
		case NodeType.HBS_PATH:
		{
			break;
		}
		
		
		case NodeType.HBS_TAG_END:
		{
			break;
		}
		case NodeType.HBS_TAG_START:
		{
			/*if (state.isTag === false)
			{
				if (node.closing !== true)
				{
					incrementTop(state.hbsCounts);
				}
			}*/
			
			break;
		}
		
		
		case NodeType.HTML_ATTR_END:
		{
			state.isAttribute = false;
			state.isStyleAttribute = false;
			break;
		}
		case NodeType.HTML_ATTR_START:
		{
			state.isAttribute = true;
			
			incrementTop(state.attrCounts);
			
			break;
		}
		
		
		case NodeType.HTML_ATTR_NAME_END:
		{
			state.isAttributeName = false;
			break;
		}
		case NodeType.HTML_ATTR_NAME_START:
		{
			state.isAttributeName = true;
			break;
		}
		
		
		case NodeType.HTML_ATTR_VALUE_END:
		{
			state.isAttributeValue = false;
			break;
		}
		case NodeType.HTML_ATTR_VALUE_START:
		{
			state.isAttributeValue = true;
			break;
		}
		
		
		case NodeType.HTML_COMMENT_END:
		{
			state.isComment = false;
			break;
		}
		case NodeType.HTML_COMMENT_START:
		{
			state.isComment = true;
			break;
		}
		
		
		// …>
		case NodeType.HTML_TAG_END:
		{
			// NOTE :: this type invokes the callback before instead of after
			callback(node, state);
			callbackInvoked = true;
			
			if (state.isClosingTag === true)
			{
				removeTop(state.attrCounts);
				removeTop(state.childCounts);
				//removeTop(state.hbsCounts);
				
				state.isWithinScriptTag = false;
				state.isWithinStyleTag = false;
			}
			
			state.isClosingTag = false;
			state.isTag = false;
			
			break;
		}
		// <…
		case NodeType.HTML_TAG_START:
		{
			state.isClosingTag = (node.closing === true);
			state.isTag = true;
			
			if (state.isClosingTag === false)
			{
				incrementTop(state.childCounts);
				
				addTop(state.attrCounts);
				addTop(state.childCounts);
				//addTop(state.hbsCounts);
			}
			
			break;
		}
		
		
		case NodeType.HTML_TAG_NAME_END:
		{
			state.isTagName = false;
			break;
		}
		case NodeType.HTML_TAG_NAME_START:
		{
			state.isTagName = true;
			break;
		}
		
		
		case NodeType.LITERAL:
		{
			if (state.isTag === true)
			{
				if (state.isTagName === true)
				{
					if (state.isClosingTag === false)
					{
						switch (node.value)
						{
							case "script":  state.isWithinScriptTag = true; break;
							case "style":   state.isWithinStyleTag  = true; break;
						}
					}
				}
				else if (state.isAttribute === true)
				{
					if (state.isAttributeName === true)
					{
						switch (node.value)
						{
							case "style":  state.isStyleAttribute = true; break;
						}
					}
				}
			}
			else
			{
				incrementTop(state.childCounts);
			}
			
			break;
		}
		
		
		default:
		{
			// oops?
		}
	}
	
	// Some types invoke the callback at different times
	if (callbackInvoked === false)
	{
		callback(node, state);
	}
}



function incrementTop(stack)
{
	stack[stack.length - 1]++;
}



function removeTop(stack)
{
	stack.pop();
}



module.exports = each;
