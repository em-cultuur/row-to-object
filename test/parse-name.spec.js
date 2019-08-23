/**
 * testing the name parser
 */

/**
 * Test the Object mapper
 */
const Chai = require('chai');
const assert = Chai.assert;
const ParseName = require('parse-full-name').parseFullName;


describe('parse-names',  () => {

  it('read standard name', () => {
    let parsed = ParseName("Mr. Jaap van der Kreeft");
    assert(parsed.lastName === 'Wooten', 'did parse')
  })
});
