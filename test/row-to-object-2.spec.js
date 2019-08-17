const Chai = require('chai');
const assert = Chai.assert;
const RtoO = require('../row-to-object-2');


describe('row-to-object 2',  () => {
  describe('fixed values', () => {

    it('read value', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "'the id'",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId'])
      assert(r === false, 'no data');
      r = conv.convert(['some', '12345']);
      assert(r.id === 'the id', 'did read the id')
    });

    it('calculate value', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "'the id' + ' some more'",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId'])
      r = conv.convert(['some', '12345']);
      assert(r.id === 'the id some more', 'did read the id')
    })
  });

  describe('read from row', () => {
    it('calculate value', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "CustomerId",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId'])
      r = conv.convert(['some', '12345']);
      assert(r.id === '12345', 'did read the id')
    });
    it('field not found', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "CustomerXXXX",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
      try {
        r = conv.convert(['some', '12345']);
        assert(false, 'should throw an error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotFound', 'Throw error');
      }
    });
    it('combine fields', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "CustomerId + ' - ' + SomeField",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
      r = conv.convert(['some', '12345']);
      assert(r.id = '12345 - some', 'did calculate')
    });
    it('trim', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "(CustomerId + ' - ') | trim + SomeField",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
      r = conv.convert(['some', '12345']);
      assert(r.id = '12345 -some', 'did calculate')
    });
  });
  describe('object', () => {
    it('create an object', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', idField: 'testId',
        fields: {
          location: {
            street: "StreetName",
            city: "'Amsterdam'"
          }
        }
      });
      let r = conv.convert(['CustomerId', 'StreetName', 'City']);
      r = conv.convert(['12345', 'mainstreet', 'Rotterdam']);
      assert(r.location, 'created object');
      assert(r.location.street === 'mainstreet', 'created field')
    });

    it ('undefined', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', idField: 'testId',
        fields: {
          location: {
            street: "StreetName",
            city: "City == 'Rotterdam' ? undefined : City"
          }
        }
      });
      let r = conv.convert(['CustomerId', 'StreetName', 'City']);
      r = conv.convert(['12345', 'mainstreet', 'Rotterdam']);
      assert(r.location, 'created object');
      assert(r.location.street ===  'mainstreet', 'created field')
      assert(r.location.city ===  undefined, 'created field');
      r = conv.convert(['12345', 'mainstreet', 'Haarlem']);
      assert(r.location.city ===  'Haarlem', 'created field');
    });

    it ('remove empty', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', idField: 'testId',
        fields: {
          location: {
            street: "City == 'Rotterdam' ? undefined : StreetName",
            city: "City == 'Rotterdam' ? undefined : City"
          }
        }
      });
      let r = conv.convert(['CustomerId', 'StreetName', 'City']);
      r = conv.convert(['12345', 'mainstreet', 'Rotterdam']);
      assert(r.location === undefined, 'not created any object');
      r = conv.convert(['12345', 'mainstreet', 'Haarlem']);
      assert(r.location.city ===  'Haarlem', 'created field');
    })
  });

  describe('array', () => {
    it('create an array', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', idField: 'testId',
        fields: {
          location: [{
            street: "StreetName",
            city: "'Amsterdam'"
          }]
        }
      });
      let r = conv.convert(['CustomerId', 'StreetName', 'City']);
      r = conv.convert(['12345', 'mainstreet', 'Rotterdam']);
      assert(r.location, 'created object');
      assert(r.location.length === 1, 'one object');
      assert(r.location[0].street === 'mainstreet', 'created field')
    });
    it('remove if empty', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', idField: 'testId',
        fields: {
          location: [{
            street: "City == 'Rotterdam' ? undefined : StreetName",
            city: "City == 'Rotterdam' ? undefined : City"
          }]
        }
      });
      let r = conv.convert(['CustomerId', 'StreetName', 'City']);
      r = conv.convert(['12345', 'mainstreet', 'Rotterdam']);
      assert(r.location === undefined, 'not created object');
    });

  });

  });