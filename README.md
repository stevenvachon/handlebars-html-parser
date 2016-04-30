# handlebars-html-parser [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> Parse Handlebars and HTML.

Parse this:
```handlebars
<tag> value {{{obj.value}~}} </tag>
```
into this:
```js
[
    { type:"htmlTagStart" },
    { type:"htmlTagNameStart" },
    { type:"literal", value:"tag" },
    { type:"htmlTagNameEnd" },
    { type:"htmlTagEnd" },
    
    { type:"literal", value:" value " },
    
    { type:"hbsTagStart", unescaped:true },
    { type:"hbsExpressionStart" },
    { type:"hbsPartStart" },
    { type:"hbsPath", value:["obj","value"] },
    { type:"hbsPartEnd" },
    { type:"hbsExpressionEnd" },
    { type:"hbsTagEnd", unescaped:true, strip:true },
    
    // whitespace stripped
    
    { type:"htmlTagStart", closing:true },
    { type:"htmlTagNameStart" },
    { type:"literal", value:"tag" },
    { type:"htmlTagNameEnd" },
    { type:"htmlTagEnd" }
]
```
…for use in compiling to something like a virtual DOM, such that of [handlebars-react](https://github.com/stevenvachon/handlebars-react).

For more information on the strengths, weaknesses and implementation details of this library, check out the [wiki](https://github.com/stevenvachon/handlebars-html-parser/wiki).


## Installation
[Node.js](http://nodejs.org/) `>= 5` is required; `< 5.0` will need an ES6 compiler. ~~Type this at the command line:~~
```shell
npm install handlebars-html-parser
```


## Methods

### .parse(template)
Parse a template String into a linear program which contains HTML pieces and Handlebars expressions. A `Promise` is returned for use in chaining.


## Functions

### .beautifyJS(js)
Format a JavaScript String for increased legibility. This is a convenience function that will prevent your project from depending on multiple versions of [uglify-js](https://npmjs.com/uglify-js).

### .each(callback)
Runs a provided Function once per element in the generated linear program.

`callback` has two arguments:

* `node`, the current node being processed in the linear program
* `state`, a mutable/reused object containing the current state of `node`


## Constants

### .type.*
A map of node types. See the [full list](https://github.com/stevenvachon/handlebars-html-parser/blob/master/lib/NodeType.js).


## Options

### options.convertHbsComments
Type: `Boolean`  
Default value: `false`  
When `true`, Handlebars comments will be converted to HTML comments.

### options.ignoreHbsComments
Type: `Boolean`  
Default value: `false`  
When `true`, Handlebars comments will be excluded from output. This can result in concatenated Strings, which optimizes compilation.

### options.ignoreHtmlComments
Type: `Boolean`  
Default value: `false`  
When `true`, HTML comments will be excluded from output. This can result in concatenated Strings, which optimizes compilation.

### options.normalizeWhitespace
Type: `Boolean`  
Default value: `false`  
When `true`, will replace multiple standard whitespace characters (line breaks, tabs, regular spaces) with a single space. This helps improve runtime performance and lower compiled template file size.

* Does not affect "special" whitespace chars such as `&nbsp;`, etc.
* Does not affect text within `<pre>`,`<script>`,`<style>`,`<textarea>` elements
* Does not affect text within "dynamic" elements (`<{{tag}}>`)
* Does not affect attribute values (`<tag attr="value">`)
* Does not affect HTML's rendered appearance (unless using CSS `white-space:pre`)

### options.processCSS
Type: `Boolean`  
Default value: `false`  
When `true`, the contents of CSS tags and attributes will be [auto-prefixed](https://npmjs.com/autoprefixer) and minified. **Note:** if *any* Handlebars expressions are contained within, minification will be skipped.

### options.processJS
Type: `Boolean`  
Default value: `false`  
When `true`, the contents of JavaScript tags, attributes and `href="javascript:…"` links will be minified. **Note:** if *any* Handlebars expressions are contained within, minification will be skipped.


## Example
```js
var HandlebarsHtmlParser = require("handlebars-html-parser")

var eachNode = HandlebarsHtmlParser.each
var NodeType = HandlebarsHtmlParser.type
var parser = new HandlebarsHtmlParser(options)

parser.parse("<tag>{{var}}</tag>")
.then( eachNode((node, state) => {
	switch(node.type) {
		case NodeType.HBS_EXPRESSION_START: {
			// is expression start node
			break
		}
		case NodeType.HTML_TAG_START: {
			// is html tag start node
			break
		}
	}
}))
.then(program => console.log("done!"))
```


## FAQ
1. **How is this different from [HTMLBars](https://npmjs.com/htmlbars)?**  
HTMLBars *builds* an *opinionated* DOM whereas this library *enables* you to build a *custom* DOM with any and all reactive binding logic offloaded to a library of your choice.

2. **Why not just extend the Handlebars AST?**  
Less maintenance. The result of extending it would still require a custom compiler because the AST would be incompatible with the Handlebars compiler. Every breaking change made to Handlebars will require such to this parser, but likely not to its [compiler](https://github.com/stevenvachon/handlebars-html-compiler).


## Roadmap Features
* figure out what `inverseStrip` (in hbs ast) is used for
* support raw blocks: `{{{{raw-helper}}}} {{path}} {{{{/raw-helper}}}}`
* support `<{{tag}}></{{tag}}>` by aliasing to `<hbshtml-start1-end3></hbshtml-start1-end3>`?
* add support for `{{this}}`,`{{.}}`
* add default whitespace control to "standalone" tags: http://handlebarsjs.com/expressions.html#whitespace-control
* `options.mustacheOnly` that disables helpers, expressions and whitespace control? would have to provide parse errors
* `options.xmlMode` with [xmldoc](https://npmjs.com/xmldoc) ?


## Changelog
* 0.0.1–0.0.26 pre-releases


[npm-image]: https://img.shields.io/npm/v/handlebars-html-parser.svg
[npm-url]: https://npmjs.org/package/handlebars-html-parser
[travis-image]: https://img.shields.io/travis/stevenvachon/handlebars-html-parser.svg
[travis-url]: https://travis-ci.org/stevenvachon/handlebars-html-parser
[david-image]: https://img.shields.io/david/stevenvachon/handlebars-html-parser.svg
[david-url]: https://david-dm.org/stevenvachon/handlebars-html-parser
