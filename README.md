# handlebars-react
> Compile Handlebars templates to [React](https://facebook.github.io/react/).

## api idea
https://github.com/isaacs/sax-js#usage

## ast type ideas
https://github.com/blakeembrey/dombars/blob/master/lib/compiler/base.js
https://github.com/mikepb/jade-react-compiler/blob/master/lib/builder.js

## template idea
https://github.com/duncanbeevers/jade-react

## Current Limitations
### Variable Tag Names
```js
var context = { tag:"div" };
```
```handlebars
<{{tag}}>asdfasdf</{{tag}}>
```
Result:
```html
&lt;div&gt;asdfasdf&lt;/div&gt;
```
## Wrapped Attributes
```js
var context = { attr:"value" };
```
```handlebars
<div {{#if attr}}attr="{{attr}}"{{/if}}>asdfasdf</div>
```
Result:
```html
<div>attr="value"&gt;asdfasdf</div>
```

## Roadmap Features
* add support for sub-expressions, whitespace control, etc
* switch to [parse5](https://npmjs.com/package/parse5) when it supports streaming
* `options.collapseWhitespace` (except on `<pre>` tags) to lighten file size and improve runtime performance
* `options.ignoreComments` to omit html comments from compiling
* `options.mustacheOnly` that disables helpers
