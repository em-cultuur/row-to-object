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
          "data3": "value | Object[2]",
          "def1": "value2 | Object([9])[0]",
          "def2": "value2 | Object[0]"
        }
      });
      // test with string
      let r = conv.convert({value: '[1, 4]', value2: '[val]'});
      assert.equal(r.data1, 1, 'did it');
      assert.equal(r.data2, 4, 'did it');
      assert.isUndefined(r.data3, 'no value === undefined');
      assert.equal(r.def1, 9, 'on use a different value')
      assert.isUndefined(r.def2)

      // test with values
      r = conv.convert({value: [1, 4],  value2: '[val]'});
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
        emptyCheck: 'length',
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
      let config = {
        emptyCheck: 'length',
        fields: {
          location: {
            street: "StreetName",
            city: "City",
            countryCode: "City|length > 0 ? 'NL' : ''",
          },
          value: 'Value'
        }
      };
      let conv = new Obj.ObjectToObject(config);
      let r = conv.convert({CustomerId: '12345', StreetName: '', City: '', Value: 'not'});
      assert(r.location === undefined, 'created field');

      config.emptyCheck = 'none';
      conv = new Obj.ObjectToObject(config);
      r = conv.convert({CustomerId: '12345', StreetName: '', City: '', Value: ''});
      assert.equal(r.value, '', 'empty');
      r = conv.convert({CustomerId: '12345', StreetName: '', City: '', Value: undefined});
      assert.equal(r.value, undefined, 'empty');
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
        emptyCheck: 'length',
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
          d2: "dA | date(['MM-DD-YYYY', 'YYYY-MM-DD'])", // first is the layout request second is layout input
        }
      });
      let r = conv.convert({ SomeField: 'some', create: "14-03-1980", dA: "1980-03-14"});
      assert.isDefined(r.d, 'did return');
      assert.equal(r.d, '1980-03-14', 'europe date');
      assert.equal(r.d2, '03-14-1980', 'us date');
    });

    it('calculate', () => {
      let conv = new Obj.ObjectToObject({
        idField: 'testId',
        fields: {
          id: "SomeField",
          d1: "create | date",
          d2: "create | date | dateAdd('7', 'days') | date",
          d3: "create | date | dateSubtract(1, 'month') | date",
        }
      });
      let r = conv.convert({ SomeField: 'some', create: "02-03-1980"});
      assert.equal(r.d1, '1980-03-02', 'one week');
      assert.equal(r.d2, '1980-03-09', 'one week');
      assert.equal(r.d3, '1980-02-02', 'one month');
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

  describe('toString', () => {
    it('object', () => {
      let conv = new Obj.ObjectToObject({
        fields: {
          string: "'string' | asString",
          variable: 'testVal | asString',
          obj: '{name: "test"} | asString',
        }});
      let r = conv.convert({ testVal: 'testValue'});
      assert.equal(r.string, 'string');
      assert.equal(r.variable, 'testValue');
      assert.equal(typeof r.obj, 'string');
      assert.equal(r.obj, '{"name":"test"}');

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

  describe('padStart', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'none',
        fields: {
          text: "idText |padStart(5, '0')",
          number: "idNumber |padStart(5, '0')",
          boolTrue: "idBoolTrue | padStart(5, '0')",
          boolFalse: "idBoolFalse | padStart(5, '0')",
          other: "idOther| padStart(5, '0')"
        }});
      let r = conv.convert({ idText: '5', idNumber: 4, idBoolTrue: true, idBoolFalse: false, idOther: {x: 1}});
      assert.equal(r.text, '00005');
      assert.isTrue(r.number === '00004');
      assert.equal(r.boolTrue, '00001' )
      assert.equal(r.boolFalse, '00000' )
      assert.equal(r.other.toString(), {x:1}.toString() )
    })
  });

  describe('undefined variable', () => {
    it('string', () => {
      let config ={
        emptyCheck: 'none',
        allowNotDefined: false,
        fields: {
          text: "idText",
        }};
      let conv =  new Obj.ObjectToObject(config);
      let r;
      try {
        r = conv.convert({id: '5'});
        assert.fail('should throw error')
      } catch (e) {
        assert.equal(e.message, 'field (idText) was not found')
      }
      config.allowNotDefined = true;
      conv =  new Obj.ObjectToObject(config);
      r = conv.convert({id: '5'});
      assert.isUndefined(r.text)
    });

    it('object', () => {
      let config ={
        emptyCheck: 'none',
        allowNotDefined: false,
        fields: {
          text: "contact[._key == 'main'].name",
          text2: "contact[._key == 'contact'] | key('name', '-- not found --')",
          text3: "contact[._key == 'contact'] | key(false, {name: '-- not found --'}).name",
        }};
      let conv =  new Obj.ObjectToObject(config);
      let r;
      r = conv.convert({contact: [
          { _key: 'main', name: 'john'},
          { _key: 'contact', name: 'jane'}
      ]});
      assert.equal(r.text, 'john');
      assert.equal(r.text2, 'jane')

      r = conv.convert({contact: [
          { _key: 'main', name: 'john'},
          { _key: 'WRONG', name: 'jane'}
        ]});
      assert.equal(r.text, 'john');
      assert.equal(r.text2, '-- not found --', 'returns a default value')

      r = conv.convert({contact: [
          { _key: 'main', name: 'john'},
          { _key: 'WRONG', name: 'jane'}
        ]});
      assert.equal(r.text, 'john');
      assert.equal(r.text3, '-- not found --', 'returns an object')

    })

    it('complex key', () => {
      let config ={
        emptyCheck: 'none',
        allowNotDefined: false,
        fields: {
          "name": "contact[._key == 'contact'] | key(['firstName', 'firstLetters'], '') + (contact[._key == 'contact'] | key('namePrefix', '') | slot(' ') ) + contact[._key == 'contact'] | key('name') | slot(' ')",
          "department": "contact[._key == 'main'] | key('organisation')",
          "order": "contact[._key == 'main'] | key('organisation', '') | slot(false, ' -- ') + contact[._key == 'contact'] | key('name')"
        }};
      let conv =  new Obj.ObjectToObject(config);
      let r = conv.convert({"contact": [
        {
          "locator": {
            "fullName": "Facilitair Bureau Adjdir. (afd)"
          },
          "organisation": "Facilitair Bureau Adjdir. (afd)",
          "_key": "main",
          "typeId": "101"
        },
        {
          "name": "Elitok",
          "firstLetters": "A.",
          "function": "Schoonmaker",
          "_parent": "main",
          "_key": "contact"
        }
      ]});
      assert.equal(r.department, 'Facilitair Bureau Adjdir. (afd)');
      assert.equal(r.name, 'A. Elitok')
      assert.equal(r.order, 'Facilitair Bureau Adjdir. (afd) -- Elitok')
    })
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

    it('loop index', () => {
      let conv = new Obj.ObjectToObject({
        fields: {
          // arrayField: "arrayField | split(',')",
          email: {
            "$$LOOP": [
              {
                "count": "field['e-mailadres'] | split(';') | length",
                "block": {
                  "email": "field['e-mailadres'] | split(';')[$$INDEX]",
                  "typeId": "$$INDEX == 0 ? 115 : $$INDEX == 1 ? 120 : 150",
                  "_parent": "'contact'"
                }
              }
            ]
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ 'e-mailadres': 'j1@test.com;j2@test.com;j3@test.com'});
      assert.equal(r.email.length, 3)
      assert.equal(r.email[0].typeId, 115)
      assert.equal(r.email[0].email, 'j1@test.com')
      assert.equal(r.email[1].typeId, 120)
      assert.equal(r.email[1].email, 'j2@test.com')
      assert.equal(r.email[2].typeId, 150)
      assert.equal(r.email[2].email, 'j3@test.com')
    });


    it('index fieldname', () => {
      let conv = new Obj.ObjectToObject({
        markers: {
          loopStatement: '=loop',
          index: 'index',
          evalString: '='
        },
        fields: {
          // arrayField: "arrayField | split(',')",
          code: {
            '=loop': [{
              count: "= arrayField | split(',') | length",
              block: {
                name: "= arrayField | split(',') [index]",
                text: "= index"
              }
            }]
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ arrayField: 'val1, val2'});
      assert.equal(r.code.length, 2)
      assert.equal(r.code[1].text, '1')
    });
  })

  describe('if', () => {
    it('true/false', () => {
      let conv = new Obj.ObjectToObject({
        fields: {
          // compare can be an array or just a value.
          compare: {
            $$IF: {
              condition: "val1 > val2",
              true: {
                text: "'val1  is more then val2'"
              },
              false:  {
                text: "'val1  is less then val2'"
              }
            }
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ val1: '10', val2: '20'});
      assert.equal(r.compare.text, 'val1  is less then val2')
      r = conv.convert({ val1: '30', val2: '20'});
      assert.equal(r.compare.text, 'val1  is more then val2')
    });

    it('other marker statement', () => {
      let conv = new Obj.ObjectToObject({
        markers: {ifStatement: 'if'},
        fields: {
          // compare can be an array or just a value.
          compare: {
            'if': {
              condition: "val1 > val2",
              true: {
                text: "'val1  is more then val2'"
              },
              false:  {
                text: "'val1  is less then val2'"
              }
            }
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ val1: '10', val2: '20'});
      assert.equal(r.compare.text, 'val1  is less then val2')
      r = conv.convert({ val1: '30', val2: '20'});
      assert.equal(r.compare.text, 'val1  is more then val2')
    });

    it('case statement', () => {
      let conv = new Obj.ObjectToObject({
        markers: {ifStatement: 'if'},
        fields: {
          // compare can be an array or just a value.
          compare: {
            'if': {
              condition: "elem | length",
              1: {
                text: "'there is one element'"
              },
              0:  {
                text: "'there are no elements'"
              },
              'default': {
                text: "'there are multiple elements'"
              }
            }
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ elem: []});
      assert.equal(r.compare.text, 'there are no elements')
      r = conv.convert({ elem: ['a']});
      assert.equal(r.compare.text, 'there is one element')
      r = conv.convert({ elem: ['a', 'b']});
      assert.equal(r.compare.text, 'there are multiple elements')
    });

    it('case statement no default', () => {
      let conv = new Obj.ObjectToObject({
        markers: {ifStatement: 'if'},
        fields: {
          // compare can be an array or just a value.
          compare: {
            'if': {
              condition: "elem | length",
              1: {
                text: "'there is one element'"
              },
              0:  {
                text: "'there are no elements'"
              }
            }
          }
        }
      });
      // true test are in the row-to-object definition
      let r = conv.convert({ elem: ['a', 'b']});
      assert.isUndefined(r.compare)
    });
  })


  describe('standard === string', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'none',
        evalString: '##',
        fields: {
          resultText: "text | slot(' - ')",
          result: "##text | slot(' - ')",
          combine: "'test' + text | slot(', ')"
        }});
      let r = conv.convert({ text: 'the test'});
      assert.equal(r.result, ' - the test');

      assert.equal(r.resultText, 'text | slot(\' - \')')
    });
  });

  describe('lower / upper', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'none',
        fields: {
          resultUpper: "text | toUpperCase",
          resultLower: "text | toLowerCase",

        }});
      let r = conv.convert({ text: 'tEst'});
      assert.equal(r.resultUpper, 'TEST');
      assert.equal(r.resultLower, 'test');
    });
  });
  describe('nl2br', () => {
    it('string', () => {
      let conv = new Obj.ObjectToObject({
        emptyCheck: 'none',
        fields: {
          "type": "'relatiememo'",
          "description" : "Notitie | nl2br(true)",

        }});
      let r = conv.convert({ Notitie: 'no way\ntoo'});
      assert.equal(r.description, 'no way<br />\ntoo');
    });
  });
});
