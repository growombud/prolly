# ¯\\_(ツ)_/¯ prolly [![Build Status](https://travis-ci.org/growombud/prolly.svg?branch=master)](https://travis-ci.org/growombud/prolly) [![npm version](https://badge.fury.io/js/prolly.svg)](https://badge.fury.io/js/prolly)
A minimalist utility library for ES6 Native Promises

## Overview
Prolly is a small utility library intended to bridge the gap between Native ES6 Promises and more fully-featured Promise libraries like Bluebird, when, and Q.

Native promises are awesome, but a few useful abstractions we've come to depend upon, like sequence(), delay(), and concurrency-configurable all() are missing from the native implementation of Promises. Consequently, we find our code littered with blocks that look similar to this:

```javascript
// A function that returns a chunked sequence of Promises with a little help from lodash
const chunkPromise = (arr, fn, size) => _.reduce(_.chunk(arr, size), (p, batch) =>
    p.then(prevResults => Promise.resolve(fn.call(fn, batch))
      .then(results => prevResults.concat(results))), Promise.resolve([]));
```

With Prolly, you could rewrite that as:
```javascript
// A function that returns a chunked sequence of Promises with a little help from lodash
const chunkPromise = (arr, fn, size) => Prolly.mapSequence(_.chunk(arr, size), fn);
```

Doesn't that feel better?

#### Why should I use this library?

If you need everything that a more fully-featured Promise library provides, then Prolly is (prolly) not a great fit for your needs. If, however, ES6 Native Promises are almost - but just not quite - good enough, read on.

Because Prolly deals in ES6 Native Promises, it will not introduce new (implicit) types to your application, i.e., every function returns only native promises. Prolly will not monkey-patch, extend, mixin, or otherwise modify the native Promise prototype.

Think of it as a helper library for the functional-composition of Promise flow-control patterns.

---
## Install

```
npm install prolly
```

## Usage

```javascript
const Prolly = require('prolly');
```

# API

## sequence ( fnArray [, starting_results] )
Returns a promise that resolves after all functions have been called sequentially

##### Use Case
Resolving a sequential chain of *heterogeneous* asynchronous operations.

Useful where different operations need to be performed on the same data, but order is critical and asynchronous calls should be limited to a concurrency of 1.

##### Example

1. Persist to a Primary DB
2. If successful, denormalize to a Secondary DB
3. If successful, broadcast a message

```
const someData = { anyProperty: 'Rando' };

Prolly.sequence( [ () => saveData( someData ),
  () => denormalizeData( someData ),
  () => broadcastMessage( someData ) ] );
```

## mapSequence ( array, mapperFn, [, starting_results] )
Returns a promise that resolves after all array members have called the mapper function sequentially

##### Use Case
Resolving a sequential chain of *homogenous* asynchronous operations over an array of values;

Useful where a common operation must be performed on different data, but order is critical, or external, asynchronous calls should be limited to a concurrency of 1.

##### Example

1. Parent data should be persisted before children, grandchildren, and on...
2. Input array is ordered accordingly

```
const lineage = [ parent, child, grandchild, great-grandchild ];

Prolly.mapSequence( lineage, person => savePerson( person ) );
```

## wait ( time_in_millis [, returnValue] )

## poll ( fn, interval_in_millis, filterFn [, delay_in_millis] )

---

## Contributing

1. Fork repo
2. Add / modify tests
3. Add / modify implementation
4. Open PR
  * (Optional) link to your development soundtrack

## License

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

## Soundtrack

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/ixJhTMOM3PE/0.jpg)](https://www.youtube.com/watch?v=ixJhTMOM3PE)
