const isFunction = object => typeof (object) === 'function';

exports.sequence = (arr, initial_value) => (arr || []).reduce((p, fn, index) =>
  p.then(results => Promise.resolve(isFunction(fn) ? fn.call(fn, index) : fn)
    .then((result) => {
      results.push(result);
      return results;
    })), Promise.resolve(initial_value || []));

exports.mapSequence = (arr, fn, initial_value) =>
  exports.sequence((arr || []).map(item => index => fn.call(fn, item, index)), initial_value);

exports.wait = (millis, return_value) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(return_value), millis));

exports.poll = (fn, delay, conditionFn, initial_delay) => new Promise((resolve, reject) => {
  let p = Promise.resolve();
  const schedule = (millis, delayedFn) => setTimeout(delayedFn, millis);
  const check = () => {
    p = p.then(() => Promise.resolve(fn.call(fn)))
      .then(result =>
        (conditionFn.call(conditionFn, result) ? resolve(result) : schedule(delay, check)))
      .catch(err => reject(err));
  };
  schedule(initial_delay || 0, check);
});
