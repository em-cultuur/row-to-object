const Chai = require('chai');
const assert = Chai.assert;
const Obj = require('../');
const Jexl = require('jexl');


describe('object-to-object',  () => {

  it('Boolean eval', () => {
    let conv = new Obj.ObjectToObject({
      firstRow: 'fieldName',
      idField: 'testId',
      fields: {
        "booleanVal": "introducee |=| 'JA' ? true : false",
      }
    });
    let r = conv.convert({introducee: 'JA'});
    assert(r.booleanVal, true, 'did set to true');
    r = conv.convert({introducee: 'Nee'});;
    assert.equal(r.booleanVal, false, 'not true')
  });

  describe('transformations', () => {



    it('string to array', () => {
      let conv = new Obj.ObjectToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          "data1": "value | Object[0]",
          "data2": "value | Object[1]",
          "data3": "value | Object[2]"
        }
      });
      let r = conv.convert({value: '[1, 4]'});
      assert.equal(r.data1, 1, 'did it');
      assert.equal(r.data2, 4, 'did it');
      assert.isUndefined(r.data3, 'no value === undefined')
    });
    it('string to object', () => {
      let conv = new Obj.ObjectToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          "name": "value | Object.name",
        }
      });
      let r = conv.convert({value: '{ "name": "test" }'});
      assert.equal(r.name, "test", 'did it');
    });

    it('string to array of objects and filter the objects', () => {
      let conv = new Obj.ObjectToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          "val": "value | Object",
          "val2": "value | Object[.name == 'test2'].value",
        }
      });
      let r = conv.convert({value: '[ {"name": "test1", "value": 1}, {"name": "test2", "value": 2}]'});
      assert.equal(r.val2, 2, 'did it');
    });

  });


  describe('fixed values', () => {
    it('read value', () => {
      let conv = new Obj.ObjectToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          id: "'the id'",
        }
      });
      r = conv.convert({the: 'some', field: '12345'});
      assert(r.id === 'the id', 'did read the id')
    });

    it('calculate value', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "'the id' + ' some more'",
        }
      });
      let r = conv.convert({ x:'some', y: '12345'});
      assert(r.id === 'the id some more', 'did read the id')
    })
  });

  describe('read from object', () => {
    it('calculate value', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "CustomerId",
        }
      });
      let r = conv.convert({ x: 'some', CustomerId: '12345'});
      assert(r.id === '12345', 'did read the id')
    });
    it('read numeric value', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "CustomerId",
        }
      });
      let r = conv.convert({ x: 'some', CustomerId: 12345});
      assert(r.id === 12345, 'did read the id')
    });

    it('field not found', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "CustomerXXXX",
        }
      });
      try {
        let r = conv.convert({ x: 'some', CustomerId: '12345'});
        assert(false, 'should throw an error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotFound', 'Throw error');
        assert(e.fieldName === 'id.CustomerXXXX', 'the right field')
      }
    });
    it('field not found - array', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: ["CustomerXXXX"],
        }
      });
      try {
        let r = conv.convert({ x: 'some', CustomerId: '12345'});
        assert(false, 'should throw an error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotFound', 'Throw error');
        assert(e.fieldName === 'id[0].CustomerXXXX', 'the right field')
      }
    });

    it('field not found - object', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: {
            name: "CustomerXXXX"
          },
        }
      });

      try {
        let r = conv.convert({ x: 'some', CustomerId: '12345'});
        assert(false, 'should throw an error')
      } catch (e) {
        assert(e.type === 'ErrorFieldNotFound', 'Throw error');
        assert(e.fieldName === 'id.name.CustomerXXXX', 'the right field')
      }
    });

    it('combine fields', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "CustomerId + ' - ' + SomeField",
        }
      });
      let r = conv.convert({ SomeField: 'some', CustomerId: '12345'});
      assert(r.id === '12345 - some', 'did calculate')
    });
    it('fieldname spaces: remove', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "CustomerId + ' - ' + SomeField",
        }
      });
      let r = conv.convert({ SomeField: 'some', CustomerId: '12345'});
      assert(r.id === '12345 - some', 'did calculate')
    });

    it('compare case insensitve', () => {
      let conv = new Obj.ObjectToObject({
        fields: {
          id: "'Some' |=| SomeField ? 1: 0",
          not: "'Some' == SomeField ? 1: 0",
        }
      });
      let r = conv.convert({ SomeField: 'some', CustomerId: '12345'});
      assert(r.id = '1', 'did calculate')
      assert(r.not = '0', 'did calculate')
    });
  });

  describe('object', () => {
    it('create an object', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          location: {
            street: "StreetName",
            city: "'Amsterdam'"
          }
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Rotterdam'});
      assert(r.location, 'created object');
      assert(r.location.street === 'mainstreet', 'created field')
    });

    it ('undefined', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          location: {
            street: "StreetName",
            city: "City == 'Rotterdam' ? undefined : City"
          }
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Rotterdam'});
      assert(r.location, 'created object');
      assert(r.location.street ===  'mainstreet', 'created field');
      assert(r.location.city ===  undefined, 'created field');
      r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Haarlem'});
      assert(r.location.city ===  'Haarlem', 'created field');
    });

    it ('remove empty', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          location: {
            street: "City == 'Rotterdam' ? undefined : StreetName",
            city: "City == 'Rotterdam' ? undefined : City"
          }
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Rotterdam'});
      assert(r.location === undefined, 'not created any object');
      r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Haarlem'});
      assert(r.location.city ===  'Haarlem', 'created field');
    });

    it ('remove empty - length', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'length',
        fields: {
          location: {
            street: "StreetName",
            city: "City",
            countryCode: "City|length > 0 ? 'NL' : ''"
          }
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: '', City: ''});
      assert(r.location === undefined, 'created field');
    });

    it('nested elements', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'length',
        fields: {
          location: {
            street: "StreetName.name",
          }
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: { name: 'theName', number:'theNumber'}});
      assert.isDefined(r.location, 'created field');
      assert.isDefined(r.location.street, 'has the field');
      assert.equal(r.location.street, 'theName', 'The value');
    });

    it('array elements', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'length',
        fields: {
          location: {
            street: "StreetName[0]",
          }
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: ['name1', 'name2']});
      assert.isDefined(r.location, 'created field');
      assert.isDefined(r.location.street, 'has the field');
      assert.equal(r.location.street, 'name1', 'The value');
    })

  });



  describe('array', () => {
    it('create an array', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          location: [{
            street: "StreetName",
            city: "'Amsterdam'"
          }]
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Rotterdam'});
      assert(r.location, 'created object');
      assert(r.location.length === 1, 'one object');
      assert(r.location[0].street === 'mainstreet', 'created field')
    });
    it('remove if empty', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          location: [{
            street: "City == 'Rotterdam' ? undefined : StreetName",
            city: "City == 'Rotterdam' ? undefined : City"
          }]
        }
      });
      let r = conv.convert({CustomerId: '12345', StreetName: 'mainstreet', City: 'Rotterdam'});
      assert(r.location === undefined, 'not created object');
    });
  });

  describe('function', () => {
    it('trim', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "(CustomerId + ' - ') | trim + SomeField",
        }
      });
      let r = conv.convert({ SomeField: 'some', CustomerId: '12345'});
      assert(r.id = '12345 -some', 'did calculate')
    });

    it('field object', () => {
      let conv = new Obj.ObjectToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          "name": "field['value']",
        }
      });
      let r = conv.convert({value: 'some value'});
      assert.equal(r.name, "some value", 'did it');
    });

    it('length', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          text : "CustomerId + ' is ' + CustomerId | length",
        }
      });
      let r = conv.convert({ SomeField: 'some', CustomerId: '12345'});
      assert(r.text === '12345 is 5', 'did calculate')
    });
  });


  describe('date / now', () => {
    it('show', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "(CustomerId + ' - ') | trim + SomeField",
          now: "__date"
        }
      });
      let r = conv.convert({ SomeField: 'some', CustomerId: '12345'});
      assert.isDefined(r.now, 'did return')
//      console.log('now:', r.now)
    });

    it('parse', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "SomeField",
          d: "create | date",
          d2: "dA | date('MM-DD-YYYY')",
        }
      });
      let r = conv.convert({ SomeField: 'some', create: "02-03-1980", dA: "03-02-1980"});
      assert.isDefined(r.d, 'did return');
      assert.equal(r.d, '1980-03-02T00:00:00+01:00', 'europe date');
      assert.equal(r.d2, '1980-03-02T00:00:00+01:00', 'us date');
    });

    it('calculate', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "SomeField",
          d1: "create | date",
          d2: "create | date | dateAdd('7', 'days')",
          d3: "create | date | dateSubract(1, 'month')",
        }
      });
      let r = conv.convert({ SomeField: 'some', create: "02-03-1980"});
      assert.equal(r.d1, '1980-03-02T00:00:00+01:00', 'one week');
      assert.equal(r.d2, '1980-03-09T00:00:00+01:00', 'one week');
      assert.equal(r.d3, '1980-02-02T00:00:00+01:00', 'one month');
    });

    it('dutch', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "SomeField",
          d1: "create | date | dateFormat('LL')",
          d2: "create | date | dateFormat('LL', 'fr')",
//          d3: "create | date | dateSubract(1, 'month')",
        }
      });
      let r = conv.convert({ SomeField: 'some', create: "20-03-2019"});
      assert.equal(r.d1, '20 maart 2019', 'in dutch');
      assert.equal(r.d2, '20 mars 2019', 'in french');
    })
  });

  describe('select object out of array by jexl', () => {
    let items = {

    testId: '4321',
    items: [
        {name: 'test', value: '1234', active: false},
        {name: 'jane', value: 'doe', active: 'notRealy'},
        {name: 'jack', value: 'frost', active: true},
        {name: { caption: 'test'}, value: '5678'}
      ]
    }
    let conv = new Obj.ObjectToObject({
      idField: '"testId"',
      fields: {
        idField: 'testId',
        first: "items[2]",
        active: "items[.active == true][0].name",
        byName: "items[.name == 'jane'][0].value",
        byLevel: "items[.name.caption == 'test'][0].value",
      }
    });
    let r = conv.convert(items);
    assert.equal(r.idField, '4321', 'the number' );
    assert.equal(r.active, 'jack', 'the name' );
    assert.equal(r.byName, 'doe', 'found name');
    assert.equal(r.byLevel, '5678', 'deeper');
  });

  describe('do calculations', () => {
    it('format date', () => {
      let conv = new Obj.ObjectToObject({
        firstRow: 'fieldName',
        idField: 'testId',
        fields: {
          "code": "'import:' + __date | dateFormat('LL')",
        }
      });
      let r = conv.convert({code: 'some',});
      assert.include(r.code, 'import:' , 'did it')
    });
  });

  describe('split', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({
        fields: {
          arrayField: "arrayField | split(';')"
        }});
      let r = conv.convert({ arrayField: 'val1;val2'});
      assert.equal(r.arrayField.length, 2)
    });
  });

  describe('slot', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'none',
        fields: {
          result: "text | slot(' - ')",
          combine: "'test' + text | slot(', ')"
        }});
      let r = conv.convert({ text: 'the test'});
      assert.equal(r.result, ' - the test');
      assert.equal(r.combine, 'test, the test')
      r = conv.convert({ text: false});
      assert.equal(r.result, '');
      assert.equal(r.combine, 'test');
      r = conv.convert({ text: undefined});
      assert.equal(r.result, '');
      assert.equal(r.combine, 'test')
    });
  });

  describe('loop', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({

        fields: {
          // arrayField: "arrayField | split(',')",
          code: {
            $$LOOP: [{
              count: "arrayField | split(',') | length",
              index: "$$INDEX",
              block: {
                name: "arrayField | split(',') [$$INDEX]",
                text: "'$$INDEX'"
              }
            }]
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ arrayField: 'val1, val2'});
      assert.equal(r.code.length, 2)
    });
  })


});
