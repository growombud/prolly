module.exports = {
  sequence: (arr, fn, initial_value) => (arr || []).reduce((p, item, index) =>
    p.then(results => Promise.resolve(fn.call(fn, item, index))
      .then(result => results.concat(result))), Promise.resolve(initial_value || [])),

  wait: (millis, return_value) =>
    new Promise((resolve, reject) => setTimeout(() => resolve(return_value), millis))
};
