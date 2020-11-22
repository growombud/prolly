# ¯\\_(ツ)_/¯ prolly
A minimalist utility library for ES6 Native Promises

[![npm version](https://badge.fury.io/js/prolly.svg)](https://badge.fury.io/js/prolly)
[![Build Status](https://travis-ci.org/growombud/prolly.svg?branch=master)](https://travis-ci.org/growombud/prolly)
[![codecov](https://codecov.io/gh/growombud/prolly/branch/master/graph/badge.svg)](https://codecov.io/gh/growombud/prolly)

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
// A function that returns a chunked sequence of Promises
const chunkPromise = (arr, fn, size) => Prolly.chunkSequence(arr, size, fn);
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
Resolving a sequential chain of *homogeneous* asynchronous operations over an array of values;

Useful where a common operation must be performed on different data, but order is critical, or external, asynchronous calls should be limited to a concurrency of 1.

##### Example

1. Parent data should be persisted before children, grandchildren, and on...
2. Input array is ordered accordingly

```
const lineage = [ parent, child, grandchild, great-grandchild ];

Prolly.mapSequence( lineage, person => savePerson( person ) );
```

## chunkSequence ( array, chunkSize, mapperFn, [, starting_results] )
Returns a promise that resolves after all array members, batched-into-subArrays of specified size, have called the mapper function sequentially.

##### Use Case
Resolving a sequential chain of *homogeneous* asynchronous operations over a large array of values, divided into smaller batches of a specified size.

Useful where a common operation must be performed on different data, order is still critical, but the common operation can handle batches of data.

##### Example

1. Parent data should be persisted before children, grandchildren, and on...
2. Input array is ordered accordingly
3. The ```savePersons()``` batch operation can handle a maximum of 2 persons at a time

```
const lineage = [ parent, child, grandchild, great-grandchild ];
const maxBatchSize = 2;

Prolly.chunkSequence( lineage, maxBatchSize, personArr => savePersons( personArr ) );
```

## wait ( time_in_millis [, returnValue] )

Returns a promise that resolves to an _optional_ value after a specified amount of time.

##### Use Case

Solves a need to delay execution of code in a Promise chain by some arbitrary amount of time. Could be useful for testing of asynchronous code, or in working-around eventual-consistency delays in an external system.

##### Example

1. `asyncFn`, returns a Promise, but does some further asynchronous work in an external system, guaranteed to finish in two seconds.
2. `asyncFn` must finish doing its work before `dependentFn` is executed

```

asyncFn()
  .then(result => Prolly.wait(2000, result))
  .then(result => dependentFn(result));
```
## untilTimeout ( time_in_millis, fn_or_promise [,reason] )

Returns a promise that resolves _iff_ the provided function or promise (```fn_or_promise```) resolves before the specified time (```time_in_millis```) elapses.  Otherwise, the returned promise rejects with an Error.
An _optional_ parameter (```reason```) can be provided to override the default error.  This can either be a string used for the Error message or an object that is a custom error type (```instanceof Error```) to assist in detecting failure due to timeout.

##### Use Case

Fulfills a need to place an upper bound on asynchronous execution with a graceful way to detect and handle when the boundary is crossed.

Real-world use-cases include identifying and handling long running requests when using conventional or global timeouts are insufficient.

##### Example

1. `asyncFn`, returns a Promise that dependably resolves within two seconds.
2. Any async execution beyond two seconds is an indication of something bad.
3. `MyTimeoutError` is some custom error type for which `instance of Error` returns true.

```
Prolly.untilTimeout(2000, asyncFn(), new MyTimeoutError())
  .then(result => {
    // Promise returned by asyncFn() resolved with result before two seconds elapsed.
  })
  .catch(MyTimeoutError, () => {
    // Two seconds elapsed before the Promise returned by asyncFn() could resolve.
  });
  .catch(err => {
    // The Promise returned by asyncFn() rejected with err
  });
```

## parallel ( fnArray [, concurrency = 2] )
Returns a promise that resolves after all functions have been fulfilled, limited to maximum concurrent executions specified with ```concurrency``` param (default: 2)

##### Use Case
Resolving an array of *heterogeneous* asynchronous operations, limiting the number of concurrent, in-flight executions.

Useful where operations need to be performed on different data, resolution order is not critical, and control over number of concurrent, asynchronous calls is desirable.

##### Example

1. Wish to persist a list of user data for hundreds of users
2. Do not wish to overload the database, and determined that the optimal number of concurrent save calls is 3

```

const dataSaveFunctions = userDataForHundredsOfUsers.map(data => () => saveUserData(data));

const results = Prolly.parallel( dataSaveFunctions, 3 );
```

## poll ( fn, interval_in_millis, validateFn [, initial_delay_in_millis [, maximum_attempts]] )

Returns a promise that calls a function (```fn```) at a specified interval (```interval_in_millis```) until the provided validation function (```validateFn```) returns a truthy value.

##### Use Case

Fulfills a need to execute any asynchronous function repeatedly until a specific condition - usually dependent on the result of the asynchronous call - is met.

Real-world use-cases include application initialization scenarios such as waiting for an external, dependent service to become available.

##### Example

1. ```isReady``` function returns the status of an external system.
2. ```isReady``` must return true before subsequent code is executed.
3. Give it 1 second, before calling ```isReady``` the first time.
4. ```isReady``` should be called no more than once every 5 seconds
5. ```isReady``` should be called a maximum of 10 times, before it throws an exception

```

const validateFn = status => status || false;

Prolly.poll(isReady, 5000, validateFn, 1000, 10)
  .then(status => {
    // External service is ready, do your business here...  
  })
  .catch(err => {
    // isReady either exceeded 10 attempts, or threw another error. Deal with it here...
  });
```

---

## Contributing

1. Fork repo
2. Add / modify tests
3. Add / modify implementation
4. Open PR
  * (Optional) link to your development soundtrack

## License

The MIT License (MIT)

Copyright (c) 2020 Ombud

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

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/OKNF25K7PCw/0.jpg)](https://www.youtube.com/watch?v=OKNF25K7PCw)
