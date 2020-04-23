const Chai = require('chai');
const assert = Chai.assert;
const Util = require('../lib/util');
const md5 = require('md5');

describe('util', () => {
  describe('int36', () => {
    it('3', () => {
      assert.equal(Util.int36(3), '3')
    });
    it('35', () => {
      assert.equal(Util.int36(35), 'Z')
    });
    it('36', () => {
      assert.equal(Util.int36(36), '10')
    });
    it('36 * 35', () => {
      assert.equal(Util.int36(36 * 35 + 35), 'ZZ')
    });
    it('36 * 36', () => {
      assert.equal(Util.int36(36 * 36), '100')
    });
  });
  describe('md5 - short', () => {
    it('basic', () => {
      let md = parseInt(md5('some text is more equal, the longer will not change it '), 16)
      let v = Util.int36(md);
      assert.equal(v.length, 25);
    })
  })
})
