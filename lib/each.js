"use strict";
var NodeType = require("./NodeType");



function addTop(stack, value)
{
	if (value === undefined) value = 0;
	
	stack.push(value);
}



function each(program, callback)
{
	var i;
	var numNodes = program.length;
	var state = 
	{
		// Stacks indexed by parent tag depth -- first index is a "document" node (root/top-level nodes container)
		attrCounts:     [0],      // atributes per element in stack
		childCounts:    [0],      // child count per element in stack
		//hbsCounts:      [0],      // Handlebar expression count per element's text content in stack
		
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
	};
	
	for (i=0; i<numNodes; i++)
	{
		eachNode(program[i], state, callback);
	}
}



function eachNode(node, state, callback)
{
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
		
		
		case NodeType.HBS_EXPRESSION_HASH_PARAM:
		{
			break;
		}
		
		
		case NodeType.HBS_EXPRESSION_PARAM:
		{
			break;
		}
		
		
		case NodeType.HBS_EXPRESSION_PATH:
		{
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
			
			if (state.isClosingTag === true)
			{
				removeTop(state.attrCounts);
				removeTop(state.childCounts);
				
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
				addTop(state.attrCounts);
				incrementTop(state.childCounts);
				addTop(state.childCounts);
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
		
		
		case NodeType.TEXT:
		{
			if (state.isTag === true)
			{
				if (state.isTagName === true)
				{
					if (state.isClosingTag === false)
					{
						// Force lower case for consistency
						node.value = node.value.toLowerCase();
						
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
						// Force lower case for consistency
						node.value = node.value.toLowerCase();
						
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
	if (node.type !== NodeType.HTML_TAG_END)
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
