"use strict";

const should = require('should');
const Prolly = require('../index.js');

describe('Prolly', () => {
  describe('.sequence', () => {
    const sequence = Prolly.sequence;
    it('should evaluate a sequence of promises, in series', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals.map(v => () =>
        new Promise(resolve => setTimeout(() => resolve(Date.now()), v))), [Date.now()])
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of promises, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals.map(v => () =>
        new Promise(resolve => setTimeout(() => resolve(Date.now()), v))))
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals.map(() => index => index))
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals.map(() => index => index), [-1])
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should return results with nested arrays', () => {
      const vals  = new Array(4).fill(2);
      return sequence(vals.map(v => () =>
        new Promise(resolve => setTimeout(() => resolve([Date.now()]), v))), [[Date.now()]])
        .then(results => results.forEach(r => r.should.be.an.Array()));
    });
  });

  describe('.mapSequence', () => {
    const mapSequence = Prolly.mapSequence;

    it('should evaluate a sequence of promises, in series', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, v =>
        new Promise(resolve => setTimeout(() => resolve(Date.now()), v)), [Date.now()])
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of promises, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, v =>
        new Promise(resolve => setTimeout(() => resolve(Date.now()), v)))
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, (v, index) => index)
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, (v, index) => index, [-1])
        .then(results => results.reduce((accu, v) => {
          v.should.be.greaterThan(accu[accu.length - 1]);
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should return results with nested arrays', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, v =>
        new Promise(resolve => setTimeout(() => resolve([Date.now()]), v)), [[Date.now()]])
        .then(results => results.forEach(r => r.should.be.an.Array()));
    });
  });

  describe('.wait', () => {
    const wait = Prolly.wait;
    it('should return after at least the specified number of milliseconds', () => {
      const now    = Date.now();
      const millis = 5;
      return wait(millis)
        .then(() => Date.now().should.be.aboveOrEqual((now + millis) - 1));
    });

    it('should return a provided value after the specified number of milliseconds', () => {
      const now    = Date.now();
      const millis = 5;
      return wait(millis, now)
        .then(value => {
          value.should.equal(now);
          Date.now().should.be.aboveOrEqual((value + millis) - 1);
        });
    });
  });

  describe('.poll', () => {
    const poll = Prolly.poll;

    it('should resolve value after condition is true', () => {
      const interval  = 2;
      const multiplier = 10;
      const start  = Date.now();
      const target = start + (interval * multiplier);

      let counter = 0;
      const increment = () => {
        counter += 1;
        return Date.now();
      };

      return poll(() => Promise.resolve(increment()), interval, result => result >= target, 1)
        .then(result => {
          result.should.be.aboveOrEqual(target);
          counter.should.be.aboveOrEqual(multiplier / 2);
        });
    });

    it('should reject with error before condition is true', () => {
      const interval  = 2;
      const multiplier = 10;
      const start  = Date.now();
      const target = start + (interval * multiplier);

      let counter = 0;
      const increment = () => {
        counter += 1;
        return Date.now();
      };

      return poll(
        () => (Date.now() >= target ? Promise.reject(counter) : Promise.resolve(increment())),
        interval,
        result => result >= target,
        1)
        .then(() => Promise.reject('did not reject before promise resolution'))
        .catch(err => {
          err.should.be.eql(counter);
          counter.should.be.aboveOrEqual(multiplier / 2);
        });
    });
  });
});
