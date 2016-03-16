const should = require('should');
const _      = require('lodash');
const Prolly = require('../index.js');

describe('Prolly', () => {
  describe('.sequence', () => {
    const sequence = Prolly.sequence;
    it('should evaluate a sequence of promises, in series', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals, v => new Promise((resolve, reject) => setTimeout(() => resolve(Date.now()), v)), [Date.now()])
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    })

    it('should evaluate a sequence of promises, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals, v => new Promise((resolve,reject) => setTimeout(() => resolve(Date.now()), v)))
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    })

    it('should evaluate a sequence of values, in series', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals, ( v, index ) => index )
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals, ( v, index ) => index, [-1] )
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });
  });
});
