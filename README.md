# handlebars-react
> Compile Handlebars templates to [React](https://facebook.github.io/react/).

## FAQ
1. **Why not use [parse5](https://npmjs.com/package/parse5)?**  
As of v1.2.0, it is not forgiving enough, in that it will parse `<{{tag}}>asdf</{{tag}}>` as text instead of HTML.

## Roadmap Features
* add support for sub-expressions, whitespace control, etc
* `options.collapseWhitespace` (except on `<pre>` tags) to lighten file size and improve runtime performance
* `options.ignoreComments` to omit html comments from compiling
* `options.mustacheOnly` that disables helpers

## api idea
https://github.com/isaacs/sax-js#usage

## ast type ideas
https://github.com/blakeembrey/dombars/blob/master/lib/compiler/base.js
https://github.com/mikepb/jade-react-compiler/blob/master/lib/builder.js

## template idea
https://github.com/duncanbeevers/jade-react
