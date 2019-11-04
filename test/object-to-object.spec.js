const Chai = require('chai');
const assert = Chai.assert;
const Obj = require('../');


describe('object-to-object',  () => {
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


  describe('now', () => {
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
      console.log('now:', r.now)
    });

  })

});
