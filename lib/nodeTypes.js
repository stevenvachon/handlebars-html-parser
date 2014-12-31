module.exports = 
{
	HBSHelper: function(statement)
	{
		return {
			type: "HBS_HELPER",
			id: statement.mustache.id.string,
			params: statement.mustache.params.map( function(param){ return param.string }),
			statement: statement
		};
	},
	
	HBSSection: function(statement)
	{
		return {
			type: "HBS_SECTION",
			id: statement.mustache.id.string,
			params: statement.mustache.params.parts,	// ?
			statement: statement
		};
	},
	
	HBSVariable: function(statement)
	{
		return {
			type: "HBS_VARIABLE",
			id: statement.id.string,
			statement: statement
		};
	},
	
	
	
	HTMLAttribute: function(name, value)
	{
		return {
			type: "HTML_ATTRIBUTE",
			name: name,
			value: value
		};
	},
	
	HTMLComment: function(text)
	{
		return {
			type: "HTML_COMMENT",
			text: text
		};
	},
	
	HTMLElement: function(name, attributes, content)
	{
		return {
			type: "HTML_ELEMENT",
			name: name,
			attributes: attributes,
			content: content
		};
	},
	
	
	
	Text: function(text/*, statement*/)
	{
		return {
			type: "TEXT",
			text: text,
			//statement: statement
		};
	}
};
