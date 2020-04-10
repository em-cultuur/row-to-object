const Chai = require('chai');
const assert = Chai.assert;
const RtoO = require('../lib/row-to-object-2');


describe('row-to-object 2',  () => {
  describe('Boolean eval', () => {
    it('check boolean', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields:
          {
            "booleanVal": "introducee |=| 'JA' ? true : false",
          }
      });
      let r = conv.convert(['testId', 'introducee']);
      r = conv.convert(['123', 'JA']);
      assert(r.booleanVal, true, 'did set to true');
      r = conv.convert(['123', 'Nee']);
      assert.equal(r.booleanVal, false, 'not true')

    });
  });


  describe('string manipulation', () => {
    it('get first character', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          id: "'the id'",
          "telephone": [
            {
              "first": "telefoon[0]",
              "second": "telefoon | substr(4)",
              "third": "telefoon | substr(4,2)",
            },
          ]
        }
      });
      // set the fieldname by the header
      let r = conv.convert(['SomeField', 'telefoon']);
      assert(r === false, 'no data');
      r = conv.convert(['some', 'Een Woord']);
      assert(r.id === 'the id', 'did read the id');
      assert.equal(r.telephone[0].first, 'E', 'Only the first');
      assert.equal(r.telephone[0].second, 'Woord');
      assert.equal(r.telephone[0].third,'Wo');
    });
  });


  describe('isDefault', () => {
    it('find the isDefault', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          id: "'the id'",
          "telephone": [
            {
              "isDefault": "true",
              "telephone10": "telefoon",
              "typeId": "113",

            },
          ]
        }
      });
      // set the fieldname by the header
      let r = conv.convert(['SomeField', 'telefoon']);
      assert(r === false, 'no data');
      r = conv.convert(['some', '12345']);
      assert(r.id === 'the id', 'did read the id')
    });
  });

  describe('fixed values', () => {
    it('read value', () => {
      let conv = new RtoO.RowToObject({ firstRow: 'fieldName',  idField: 'testId',
        fields: {
          id: "'the id'",
        }
      });
      let r = conv.convert(['SomeField', 'CustomerId']);
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
      let r = conv.convert(['SomeField', 'CustomerId']);
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
      let r = conv.convert(['SomeField', 'CustomerId']);
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
      let r = conv.convert(['SomeField', 'CustomerId']);
      assert.isFalse(r, 'first row is fieldnames')
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

  describe('bad fieldnames', () => {
    it('- in fieldname', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName',
        emptyCheck: 'length',
        idField: 'SomeField',
        fields: {
          id: "SomeField",
          noField: "field['other-field']"
        }
      });
      let r = conv.convert(['SomeField', "other-field"]);
      r = conv.convert(['12345', 'this one']);
      assert(r.id = '12345', 'did add');
      assert.equal(r.noField, 'this one', 'did find the field');
    });
  });

  describe('create import date (render todays-date #19)', () => {
    it('combine text and date', () => {
      let conv = new RtoO.RowToObject({
        firstRow: 'fieldName',
        emptyCheck: 'length',
        idField: 'SomeField',
        fields: {
          id: "SomeField",
          importDate: "'import: ' + __date | dateFormat('YYYY-MM-DD')"
        }
      });
      let r = conv.convert(['SomeField']);
      r = conv.convert(['12345']);
      assert(r.id = '12345', 'did add');
      assert.include(r.importDate, 'import:', 'did find the field');
//      console.log(r.importDate)
    });
  });

  describe('arrays', () => {
    let conv;
    let r;

    before( () => {
      conv = new RtoO.RowToObject({
        fields: {
          id: "idField",
          arrayField: "arrayField | split(';')",
          arrayLimit: "arrayLimit | split(';', 2)",
          arrayLength: "arrayField | split(';') | length",
        }
      });
      r = conv.convert(['idField', 'arrayField', 'arrayLimit', 'arrayLength']);
    });

    it('basic test', () => {
      r = conv.convert(['id value', 'array value']);
      assert.equal(r.id, 'id value');
    });

    it('split', () => {
      r = conv.convert(['id value', 'val1;val2']);
      assert.isDefined(r.arrayField);
      assert.equal(r.arrayField.length, 2);
      assert.equal(r.arrayField[1], 'val2')
    });

    it('split and trim', () => {
      r = conv.convert(['id value', 'val1 ; val2 ']);
      assert.isDefined(r.arrayField);
      assert.equal(r.arrayField.length, 2);
      assert.equal(r.arrayField[1], 'val2')
    });
    it('split empty', () => {
      r = conv.convert(['id value', '']);
      assert.isDefined(r.arrayField);
      assert.equal(r.arrayField.length, 0);
    });
    it('split limit', () => {
      r = conv.convert(['id value', '', 'val 1; val 2; val 3']);
      assert.isDefined(r.arrayLimit);
      assert.equal(r.arrayLimit.length, 2);
    });

    it('split length', () => {
      r = conv.convert(['id value', 'val1;val2']);
      assert.isDefined(r.arrayLength);
      assert.equal(r.arrayLength, 2);
    })
  });

  describe('loops', () => {
    let conv;
    let r;

    before( () => {
      conv = new RtoO.RowToObject({
        fields: {
          id: "idField",
          arrayField: "arrayField | split(',')",
          code: {
            $$LOOP: [{
              count: "arrayField | split(',') | length",
              index: "$$INDEX",
              block: {
                name: "arrayField | split(',') [$$INDEX]",
                text: "'$$INDEX'"
              }
            }]
          },
          codeNoArray: {
            $$LOOP: {
              count: "arrayField | split(',') | length",
              index: "$$INDEX",
              block: {
                name: "arrayField | split(',') [$$INDEX]",
                text: "'$$INDEX'"
              }
            }
          },
          codeInclude: {
            $$LOOP: {
              count: "arrayField | split(',') | length",
              index: "$$INDEX",
              block: {
                name: "arrayField | split(',') [$$INDEX]",
                text: "'$$INDEX'"
              },
              include: [
                {
                  name: "idField",
                  text: '6'
                }
              ]
            }
          },

        }
      });
      r = conv.convert(['idField', 'arrayField']);
    });

    it('basic test', () => {
      r = conv.convert(['id value', 'val1, val2']);
      assert.equal(r.id, 'id value');
      assert.equal(r.code.length, 2);
      assert.equal(r.code[0].text, '0');
      assert.equal(r.code[1].name, 'val2');
    });
    it('empty test', () => {
      r = conv.convert(['id value', '']);
      assert.equal(r.id, 'id value');
      assert.isUndefined(r.code);
    });
    it('no loop array', () => {
      r = conv.convert(['id value', 'val1, val2']);
      assert.equal(r.id, 'id value');
      assert.equal(r.codeNoArray.length, 2);
      assert.equal(r.codeNoArray[0].text, '0');
      assert.equal(r.codeNoArray[1].name, 'val2');
    });
    it('include others', () => {
      r = conv.convert(['id value', 'val1, val2']);
      assert.equal(r.id, 'id value');
      assert.equal(r.codeInclude.length, 3);
      assert.equal(r.codeInclude[0].text, '0');
      assert.equal(r.codeInclude[2].name, 'id value');
      assert.equal(r.codeInclude[2].text, '6');
    })
  })
});


