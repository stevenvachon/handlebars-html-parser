# handlebars-html-parser [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][david-image]][david-url]

> Parse Handlebars and HTML.

Parse this:
```handlebars
<{{tag}}>value</{{{~tag~}}}>
```
into this:
```js
[
    { type:"htmlTagStart", closing:false },
    { type:"htmlTagNameStart" },
    { type:"hbsTagStart", escaped:true, stripWhitespace:false, block:false, closing:false, comment:false },
    { type:"hbsExpression", parts:["tag"] },
    { type:"hbsTagEnd", escaped:true, stripWhitespace:false },
    { type:"htmlTagNameEnd" },
    { type:"text", text:"value" },
    { type:"htmlTagStart", closing:true },
    { type:"htmlTagNameStart" },
    { type:"hbsTagStart", escaped:false, stripWhitespace:true, block:false, closing:true, comment:false },
    { type:"hbsExpression", parts:["tag"] },
    { type:"hbsTagEnd", escaped:false, stripWhitespace:true },
    { type:"htmlTagNameEnd" },
    { type:"htmlTagEnd" }
]
```
…for use in compiling to something like a virtual DOM, such that of [handlebars-react](https://github.com/stevenvachon/handlebars-react).

For more information on the strengths, weaknesses and implementation details of this library, check out the [wiki](https://github.com/stevenvachon/handlebars-html-parser/wiki).


## FAQ
1. **How is this different from [HTMLBars](https://github.com/tildeio/htmlbars)?**  
HTMLBars *builds* a DOM whereas this library *allows* you to build a DOM and even a virtual DOM.

2. **Why not use [parse5](https://npmjs.com/package/parse5)?**  
As of v1.5.0, it is not at all "forgiving", in that it will parse `<{{tag}}>asdf</{{tag}}>` as text instead of HTML.


## Roadmap Features
* add support for inverse expressions, sub-expressions, whitespace control
* `options.collapseWhitespace` (except on `<pre>` tags) to lighten file size and improve runtime performance
* `options.ignoreHtmlComments` to omit html comments from compiling
* `options.mustacheOnly` that disables helpers


## Changelog
* 0.0.1–0.0.5 pre-releases


[npm-image]: https://img.shields.io/npm/v/handlebars-html-parser.svg
[npm-url]: https://npmjs.org/package/handlebars-html-parser
[travis-image]: https://img.shields.io/travis/stevenvachon/handlebars-html-parser.svg
[travis-url]: https://travis-ci.org/stevenvachon/handlebars-html-parser
[david-image]: https://img.shields.io/david/stevenvachon/handlebars-html-parser.svg
[david-url]: https://david-dm.org/stevenvachon/handlebars-html-parser
