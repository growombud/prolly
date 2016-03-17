# ¯\\_(ツ)_/¯ prolly [![Build Status](https://travis-ci.org/growombud/prolly.svg?branch=master)](https://travis-ci.org/growombud/prolly) [![npm version](https://badge.fury.io/js/prolly.svg)](https://badge.fury.io/js/prolly)
A minimalist utility library for ES6 Native Promises

### Overview
Prolly is a small utility library intended to bridge the gap between Native ES6 Promises and more fully-featured Promise libraries like Bluebird, when, and Q.

Native promises are awesome, but a few useful abstractions we've come to depend upon, like sequence(), parallel(), and delay() are missing from the native implementation of Promises. Consequently, we find our code littered with blocks that look similar to this:

```javascript
// A function that returns a chunked sequence of Promises with a little help from lodash
const chunkPromise = (arr, fn, size) => _.reduce(_.chunk(arr, size), (p, batch) =>
    p.then(prevResults => Promise.resolve(fn.call(fn, batch))
      .then(results => prevResults.concat(results))), Promise.resolve([]));
```

With Prolly, you could rewrite that as:
```javascript
const chunkPromise = (arr, fn, size) => Prolly.mapSequence(_.chunk(arr, size), fn);
```

Doesn't that feel better?

If you need everything that a more robust Promise library provides, then Prolly is not a great fit for your needs. If, however, ES6 Native Promises are almost - but just not quite - good enough, give Prolly a try.

### License

The MIT License (MIT)

Copyright (c) 2016 Ombud

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
