// Called by some custom function (that needs to be written somewhere)
function(React)
{
	// Passed to "render" in React.createClass()
	function()
	{
		// {{#each list}} should use list.map() instead of for()
		
		/*
		<!-- JSX -->
		<div>
			value1
			{this.props.variable1}
			{this.props.variable2 ? <span>value2</span> : "nothing"}
			<span data-attr={(this.props.variable3 ? "value3" : "") + " value4"}>value5</span>
		</div>
		*/
		
		React.createElement("div", null,
			"value1",
			this.props.variable1,
			this.props.variable2 ? React.createElement("span", null,
				"value2"
			) : "nothing",
			React.createElement("span", {"data-attr":(this.props.variable3 ? "value3" : "") + " value4"},
				"value5"
			)
		);
		
		/*
		React.DOM.div(null,
			"value1",
			this.props.variable1,
			this.props.variable2 ? React.DOM.span(null,
				"value2"
			) : "nothing",
			React.DOM.span({"data-attr":(this.props.variable3 ? "value3" : "") + " value4"},
				"value5"
			)
		);
		*/
	}
}