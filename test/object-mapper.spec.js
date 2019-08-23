/**
 * Test the Object mapper
 */
const Chai = require('chai');
const assert = Chai.assert;
const ObjMap = require('../object-mapper');


describe('object-mapper',  () => {
  let objMap;

  before( () => {
    let objMap = new ObjMap.ObjectMapper();
    return Promise.resolve();
  });

  describe('validate', () => {
    it('accept record', () => {
      assert(objMap.validate('record',{fullName: 'jansen'}) === true, 'minimum field info');
    })
  });

});