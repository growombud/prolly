"use strict";

const isFunction = object => typeof (object) === 'function';

const chunk = (array, sizeParam) => {
  const size = Math.max(sizeParam, 0);
  const length = array === null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  let index = 0;
  let resIndex = 0;
  const result = new Array(Math.ceil(length / size));

  while (index < length) {
    result[resIndex += 1] = array.slice(index, (index += size));
  }
  return result;
};

exports.sequence = (arr, initial_value) => (arr || []).reduce((p, fn, index) =>
  p.then(results => Promise.resolve(isFunction(fn) ? fn.call(fn, index) : fn)
    .then((result) => {
      results.push(result);
      return results;
    })), Promise.resolve(initial_value || []));

exports.mapSequence = (arr, fn, initial_value) =>
  exports.sequence((arr || []).map(item => index => fn.call(fn, item, index)), initial_value);

exports.chunkSequence = (arr, chunkSize, fn, initial_value) =>
  exports.mapSequence(chunk((arr || []), chunkSize), fn, initial_value);

exports.wait = (millis, return_value) =>
  new Promise(resolve => setTimeout(() => resolve(return_value), millis));

exports.poll = (fn, delay, conditionFn, initial_delay, maximum_attempts) =>
  new Promise((resolve, reject) => {
    let p = Promise.resolve();
    let attempt = 0;
    const schedule = (millis, delayedFn) => setTimeout(delayedFn, millis);
    const check = () => {
      p = p.then(() => Promise.resolve(fn.call(fn)))
        .then((result) => {
          attempt += 1;
          if (conditionFn.call(conditionFn, result)) {
            return resolve(result);
          }
          if (attempt < (maximum_attempts || Number.POSITIVE_INFINITY)) {
            return schedule(delay, check);
          }
          throw new Error('Maximum Polling Attempts Exceeded');
        })
        .catch(err => reject(err));
    };
    schedule(initial_delay || 0, check);
  });

exports.untilTimeout = (millis, fn, reason) =>
  new Promise((resolve, reject) => {
    let timed_out = false;
    const error_override = reason && (reason instanceof Error ? reason : new Error(String(reason)));
    const timeout = setTimeout(() => {
      timed_out = true;
      reject(error_override || new Error('Timeout occurred'));
    }, millis);
    const ifNotTimedOut = done => (arg) => {
      if (!timed_out) {
        clearTimeout(timeout);
        done(arg);
      }
    };
    Promise.resolve(isFunction(fn) ? fn.call(fn) : fn)
      .then(ifNotTimedOut(resolve))
      .catch(ifNotTimedOut(reject));
  });

  const buildNextPool = (pool, absIndex, fn) => [
    ...pool, 
    isFunction(fn) 
    ? fn.call(fn, absIndex).then(result => ({ result, absIndex }))
    : fn.then(result => ({ result, absIndex }))
  ].map((p, i) => p.then(obj => Object.assign(obj, { pIndex: i })))

  exports.parallel = (arr = [], concurrency = 2) => {
    if (concurrency < 2) return exports.sequence(arr);
    if (concurrency >= arr.length) return Promise.all(arr.map((fn, index) => Promise.resolve(isFunction(fn) ? fn.call(fn, index) : fn)));

    return arr.reduce((p, fn, index) => {
      return p.then(({ pool, results }) => {
        if (pool.length < concurrency) {
          return { 
            pool: buildNextPool(pool, index, fn),
            results,
          };
        }
        return Promise.race(pool)
          .then(({ result, pIndex, absIndex }) => {
            return { 
              pool: buildNextPool(pool.filter((p, i) => i !== pIndex), index, fn),
              results: [...results, { result, absIndex }],
            };
          });
      });
    }, Promise.resolve({ pool: [], results: []}))
    .then(({ results, pool }) => {
      return Promise.all(pool)
        .then(lastPromises => {
          return [...results, ...lastPromises].sort((a, b) => a.absIndex - b.absIndex).map(({ result }) => result);
        });
    });
  }
