const isFunction = object => typeof(object) === 'function';

exports.sequence = (arr, initial_value) => (arr || []).reduce((p, fn, index) =>
  p.then(results => Promise.resolve(isFunction(fn) ? fn.call(fn, index) : fn)
    .then(result => {
      results.push(result);
      return results;
    })), Promise.resolve(initial_value || []));

exports.mapSequence = (arr, fn, initial_value) =>
  exports.sequence((arr || []).map(item => index => fn.call(fn, item, index)), initial_value);

exports.wait = (millis, return_value) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(return_value), millis));
