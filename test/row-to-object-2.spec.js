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
    it('read numeric value', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "CustomerId",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId'])
      r = conv.convert(['some', 12345]);
      assert(r.id === 12345, 'did read the id')
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
        assert(e.fieldName === 'id.CustomerXXXX', 'the right field')
      }
    });
    it('field not found - array', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: ["CustomerXXXX"],
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
      try {
        r = conv.convert(['some', '12345']);
        assert(false, 'should throw an error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotFound', 'Throw error');
        assert(e.fieldName === 'id[0].CustomerXXXX', 'the right field')
      }
    });

    it('field not found - object', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: {
            name: "CustomerXXXX"
          },
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
      try {
        r = conv.convert(['some', '12345']);
        assert(false, 'should throw an error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotFound', 'Throw error');
        assert(e.fieldName === 'id.name.CustomerXXXX', 'the right field')
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
      assert(r.id === '12345 - some', 'did calculate')
    });
    it('fieldname spaces: remove', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "CustomerId + ' - ' + SomeField",
        }
      });
      let r = conv.convert(['SomeField', 'Customer Id']);
      r = conv.convert(['some', '12345']);
      assert(r.id === '12345 - some', 'did calculate')
    });
    it('fieldname spaces: _ ', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName', spaceHandler: '_',
        fields: {
          id: "Customer_Id + ' - ' + SomeField",
        }
      });
      let r = conv.convert(['SomeField', 'Customer Id']);
      r = conv.convert(['some', '12345']);
      assert(r.id === '12345 - some', 'did calculate')
    });

    it('column[] value', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName', spaceHandler: '_',
        fields: {
          id: "column[1]",
        }
      });
      let r = conv.convert(['SomeField', 'Customer Id']);
      r = conv.convert(['some', '12345']);
      assert(r.id === '12345', 'did calculate')
    });

    it('letters column', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'letter',
        fields: {
          id: "B",
        }
      });
      //let r = conv.convert(['SomeField', 'Customer Id']);
      let r = conv.convert(['some', '12345']);
      assert(r.id === '12345', 'did calculate')
    });


    it('compare case insensitve', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName', spaceHandler: '_',
        fields: {
          id: "'Some' |=| SomeField ? 1: 0",
          not: "'Some' == SomeField ? 1: 0",
        }
      });
      let r = conv.convert(['SomeField', 'Customer Id']);
      r = conv.convert(['some', '12345']);
      assert(r.id = '1', 'did calculate')
      assert(r.not = '0', 'did calculate')
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
    });

    it ('remove empty - length', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', emptyCheck: 'length',
        fields: {
          location: {
            street: "StreetName",
            city: "City",
            countryCode: "City|length > 0 ? 'NL' : ''"
          }
        }
      });
      let r = conv.convert(['CustomerId', 'StreetName', 'City']);
      r = conv.convert(['12345', '', '']);
      assert(r.location === undefined, 'created field');
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

  describe('function', () => {
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

    it('length', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          text : "CustomerId + ' is ' + CustomerId | length",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
      r = conv.convert(['some', '12345']);
      assert(r.text === '12345 is 5', 'did calculate')
    });
  });

  describe('setup', () => {
    it('emptyCheck', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName', emptyCheck: 'length', idField: 'testId',
        fields: {
          id: "SomeField",
          noField: "OtherField"
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId', "OtherField"]);
      r = conv.convert(['some', '12345', '']);
      assert(r.id = '12345 -some', 'did add');
      assert(r.noField === undefined, 'left empty')
      assert(conv.idField === 'testId', 'read idField')
    });
  });

});