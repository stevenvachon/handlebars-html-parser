# handlebars-html-parser
> Parse Handlebars and HTML.

Parse this:
```handlebars
<{{tag}}>value</{{tag}}>
```
into this:
```js
[
    { type:"htmlTagStart", closing:false },
    { type:"htmlTagNameStart" },
    { type:"hbsVariable", id:"tag" },
    { type:"htmlTagNameEnd" },
    { type:"text", text:"value" },
    { type:"htmlTagStart", closing:true },
    { type:"htmlTagNameStart" },
    { type:"hbsVariable", id:"tag" },
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
As of v1.2.0, it is not forgiving enough, in that it will parse `<{{tag}}>asdf</{{tag}}>` as text instead of HTML.

## Roadmap Features
* add support for sub-expressions, whitespace control, etc
* `options.collapseWhitespace` (except on `<pre>` tags) to lighten file size and improve runtime performance
* `options.ignoreComments` to omit html comments from compiling
* `options.mustacheOnly` that disables helpers

## Changelog
* 0.0.1–0.0.3 pre-releases
