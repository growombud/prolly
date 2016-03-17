const should = require('should');
const _      = require('lodash');
const Prolly = require('../index.js');

describe('Prolly', () => {
  describe('.sequence', () => {
    const sequence = Prolly.sequence;
    it('should evaluate a sequence of promises, in series', () => {
      const vals  = new Array(4).fill(2);
      return sequence( _.map(vals, v => () => new Promise((resolve, reject) => setTimeout(() => resolve(Date.now()), v))), [Date.now()])
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of promises, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return sequence(_.map(vals, v => () => new Promise((resolve,reject) => setTimeout(() => resolve(Date.now()), v))))
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    })

    it('should evaluate a sequence of values, in series', () => {
      const vals  = new Array(4).fill(2);
      return sequence(_.map(vals, v => index => index ))
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return sequence(_.map(vals, v => index => index), [-1] )
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should return results with nested arrays', () => {
      const vals  = new Array(4).fill(2);
      return sequence( _.map(vals, v => () => new Promise((resolve, reject) => setTimeout(() => resolve([Date.now()]), v))), [[Date.now()]])
        .then(results => _.each(results, r => r.should.be.an.Array()));
    })
  });

  describe('.mapSequence', () => {
    const mapSequence = Prolly.mapSequence;
    it('should evaluate a sequence of promises, in series', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, v => new Promise((resolve, reject) => setTimeout(() => resolve(Date.now()), v)), [Date.now()])
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    })

    it('should evaluate a sequence of promises, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, v => new Promise((resolve,reject) => setTimeout(() => resolve(Date.now()), v)))
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    })

    it('should evaluate a sequence of values, in series', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, ( v, index ) => index )
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should evaluate a sequence of values, in series, with an initial value', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, ( v, index ) => index, [-1] )
        .then(results => _.reduce(results, (accu, v) => {
          v.should.be.greaterThan(_.last(accu));
          return accu.concat(v);
        }, [Number.NEGATIVE_INFINITY]));
    });

    it('should return results with nested arrays', () => {
      const vals  = new Array(4).fill(2);
      return mapSequence(vals, v => new Promise((resolve, reject) => setTimeout(() => resolve([Date.now()]), v)), [[Date.now()]])
        .then(results => _.each(results, r => r.should.be.an.Array()));
    })
  });

  describe('.wait', () => {
    const wait = Prolly.wait;
    it('should return after at least the specified number of milliseconds', () => {
      const now    = Date.now();
      const millis = 5;
      return wait( millis )
        .then(() => Date.now().should.be.aboveOrEqual(now + millis - 1));
    });

    it('should return a provided value after the specified number of milliseconds', () => {
      const now    = Date.now();
      const millis = 5;
      return wait( millis, now )
        .then( value => {
          value.should.equal( now );
          Date.now().should.be.aboveOrEqual(value + millis - 1);
        });
    });
  });
});
