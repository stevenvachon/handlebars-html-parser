# handlebars-html-parser [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> Parse Handlebars and HTML.

Parse this:
```handlebars
<{{tag}}> value {{{obj.value~}}} </tag>
```
into this:
```js
[
    { type:"htmlTagStart" },
    { type:"htmlTagNameStart" },
    { type:"hbsTagStart" },
    { type:"hbsExpressionStart" },
    { type:"hbsExpressionPath", value:["tag"] },
    { type:"hbsExpressionEnd" },
    { type:"hbsTagEnd" },
    { type:"htmlTagNameEnd" },
    { type:"htmlTagEnd" },
    
    { type:"text", value:" value " },
    
    { type:"hbsTagStart", notEscaped:true },
    { type:"hbsExpressionStart" },
    { type:"hbsExpressionPath", value:["obj","value"] },
    { type:"hbsExpressionEnd" },
    { type:"hbsTagEnd", stripWhitespace:true, notEscaped:true },
    
    // whitespace stripped
    
    { type:"htmlTagStart", closing:true },
    { type:"htmlTagNameStart" },
    { type:"text", value:"tag" },
    { type:"htmlTagNameEnd" },
    { type:"htmlTagEnd" }
]
```
…for use in compiling to something like a virtual DOM, such that of [handlebars-react](https://github.com/stevenvachon/handlebars-react).

For more information on the strengths, weaknesses and implementation details of this library, check out the [wiki](https://github.com/stevenvachon/handlebars-html-parser/wiki).


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
When `true`, will replace multiple standard whitespace characters (line breaks, tabs, regular spaces) with a single space. This helps lower compiled template file size and improve runtime performance.

* Does not affect "special" whitespace chars such as `&nbsp;`, etc.
* Does not affect text within `<pre>`,`<script>`,`<style>` tags
* Does not affect text within "dynamic" tags (`<{{tag}}>`)
* Does not affect HTML's rendered appearance (unless using CSS `white-space:pre`)

### options.xmlMode
Type: `Boolean`  
Default value: `false`  
When `true`, XML rules will be used instead of HTML rules for parsing. This can be useful for SVG documents (that are not inlined within HTML).


## FAQ
1. **How is this different from [HTMLBars](https://npmjs.com/htmlbars)?**  
HTMLBars *builds* a DOM whereas this library *allows* you to build a DOM and especially a virtual DOM.

2. **Why not use [parse5](https://npmjs.com/parse5)?**  
As of v1.5.0, it is not at all "forgiving", in that it will parse `<{{tag}}>asdf</{{tag}}>` as text instead of HTML.


## Roadmap Features
* add support for sub-expressions
* add support for `{{#if}}`,`{{else}}`,`{{else if}}`,`{{#unless}}`
* add support for `{{#with}}`,`{{#each}}`,`{{@index}}`,`{{@key}}`,`{{this}}`,`{{.}}`,`{{undefined}}`,`{{null}}`,`{{true}}`,`{{1}}`
* add support for `{{> partial}}`
* `options.mustacheOnly` that disables helpers, expressions and whitespace control? would have to provide parse errors


## Changelog
* 0.0.1–0.0.12 pre-releases


[npm-image]: https://img.shields.io/npm/v/handlebars-html-parser.svg
[npm-url]: https://npmjs.org/package/handlebars-html-parser
[travis-image]: https://img.shields.io/travis/stevenvachon/handlebars-html-parser.svg
[travis-url]: https://travis-ci.org/stevenvachon/handlebars-html-parser
[david-image]: https://img.shields.io/david/stevenvachon/handlebars-html-parser.svg
[david-url]: https://david-dm.org/stevenvachon/handlebars-html-parser
