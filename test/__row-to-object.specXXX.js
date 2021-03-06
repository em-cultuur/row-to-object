/**
 * Test the row converter
 */
const Chai = require('chai');
const assert = Chai.assert;
const R2O = require('../lib/row-to-object-1');
const Jexl = require('jexl');

describe('row-to-object',  () => {

  let config = {
    firstRow: 'fieldnames',  // index || letters
    fields: {
      id: "IdentificatieMedewerker",
      fullName: {
        _value: "SamengesteldeNaam",
        required: true
      },
      telephone: {
        _index: "0",
        value: "Telefoonnummer",
        type: "=work"
      },
      email: [
        {
          _index: "0",
          value: "EmailAdres",
          type: "=work",
          required: true
        },
        {
          _index: "1",
          value: "Niewsbrief",
          type: "=newsletter",
          required: true
        }
      ],
      location: {
        _index: "0",
        "street": "WerkadresStraat",
        "number": "WerkadresHuisnummer",
        "zipcode": "WerkadresPostcode",
        "city": "=Amsterdam",
        "countryCode": "=nl"
      }
    }
  };

  it('charToIndex', () => {
    assert(R2O.charToIndex('B') === 1, 'B');
    assert(R2O.charToIndex('Z') === 25, 'Z');
    assert(R2O.charToIndex('aa') === 26, 'aa');
    assert(R2O.charToIndex('ac') === 28, 'ac');

  });

  // // https://stackoverflow.com/questions/2357618/is-there-such-a-thing-as-a-catch-all-key-for-a-javascript-object
  // let test = new Object();
  // let fields = new Proxy(test,  {
  //   get(target, name) {
  //     return 'jaap'
  //   }
  // });
  //
  // it('jexl', () => {
  //   return Jexl.eval('name == "jaap"',  fields /* {name: 'piet'} */).then( (r) => {
  //     console.log(r);
  //   })
  // });

  it('field: idField', () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName',  idField: 'testId', fields: {
        id: "=ThisOne" , testId: '=10',
      }});
    assert(r.idField === 'testId', 'has Id field')
  });
  it('field: value', () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        id: "=ThisOne"
      }});
    r.convert(['id', 'IdentificatieMedewerker']);
    let obj = r.convert(['1234', '9876']);
    assert(obj.id === 'ThisOne', 'got the string')
  });

  it('field: fieldname', () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        id: "IdentificatieMedewerker"
    }});
    r.convert(['id', 'IdentificatieMedewerker']);
    let obj = r.convert(['1234', '9876']);
    assert(obj.id === '9876', 'got the number')
  });

  it('field: required', () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        fullName: {
          _value: "SamengesteldeNaam",
          _required: true
        },
      }});
    r.convert(['id', 'IdentificatieMedewerker', "SamengesteldeNaam"]);
    let obj = r.convert(['1234', '9876', "John Doe"]);
    assert(obj.fullName === 'John Doe', 'got name');
    obj = r.convert(['1234', '9876', ""]);
    assert(obj.fullName === undefined, 'did not add the field');
  });

  it('field: complex', () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        location: {
          "street": "WerkadresStraat",
          "city": "=Amsterdam"

        }
    }});
    r.convert(['id', 'IdentificatieMedewerker', "WerkadresStraat", "WerkadresHuisnummer", "WerkadresPostcode"]);
    let obj = r.convert(['1234', '9876', 'mainstreet', '1234', '2017GG']);
    assert(obj.location, 'has object');
    assert(obj.location.street === 'mainstreet', 'got variable info');
    assert(obj.location.city === 'Amsterdam', 'got fixed value');
  });

  it('field: complex required', () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        location: {
          "street": { _value: "WerkadresStraat", _required: true},
          "city": "=Amsterdam",
        }
      }});
    r.convert(['id', 'IdentificatieMedewerker', "WerkadresStraat", "WerkadresHuisnummer", "WerkadresPostcode"]);
    let obj = r.convert(['1234', '9876', '', '1234', '2017GG']);
    assert(obj.location === undefined, 'did not add an object');
  });


  it("field: complex - one element index", () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        location: {
          "_index" : "=0",
          "street": "WerkadresStraat",
          "city": "=Amsterdam"

        }
      }});
    r.convert(['id', 'IdentificatieMedewerker', "WerkadresStraat", "WerkadresHuisnummer", "WerkadresPostcode"]);
    let obj = r.convert(['1234', '9876', 'mainstreet', '1234', '2017GG']);
    assert(obj.location.street === 'mainstreet', 'got variable info');
    assert(obj.location.city === 'Amsterdam', 'got fixed value');
    assert(obj.location._index === '0', 'got fixed value');
  });

  it("field: complex - two element array", () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        location: [
          {
            "_index" : "=0",
            "street": "WerkadresStraat",
            "city": "=Amsterdam"
          },
          {
            "_index" : "=1",
            "street": "WoonadresStraat",
            "city": "=Rotterdam"
          }
        ]
      }});
    r.convert(['id', 'IdentificatieMedewerker', "WerkadresStraat", "WerkadresHuisnummer", "WerkadresPostcode", "WoonadresStraat"]);
    let obj = r.convert(['1234', '9876', 'mainstreet', '1234', '2017GG', 'no more street']);
    assert(obj.location.length, 'has array');
    assert(obj.location.length === 2, "two elements");
    assert(obj.location[0].street === 'mainstreet', 'got variable info');
    assert(obj.location[0]._index === '0', 'got index');
    assert(obj.location[0].city === 'Amsterdam', 'got fixed value');
    assert(obj.location[1].city === 'Rotterdam', 'got fixed value');
  });

  it("field: complex - two element array - required", () => {
    let r = new R2O.RowToObject({ firstRow: 'fieldName', fields: {
        location: [
          {
            "_index" : "=0",
            "street": { _value: "WerkadresStraat", _required: true},
            "city": "=Amsterdam",

          },
          {
            "_index" : "=1",
            "street": "WoonadresStraat",
            "city": "=Rotterdam"
          }
        ]
      }});
    r.convert(['id', 'IdentificatieMedewerker', "WerkadresStraat", "WerkadresHuisnummer", "WerkadresPostcode", "WoonadresStraat"]);
    let obj = r.convert(['1234', '9876', '', '1234', '2017GG', 'no more street']);
    assert(obj.location.length === 1, 'got array');
    assert(obj.location[0].city === 'Rotterdam', 'got fixed value');
  });


  it("column indexes: complex - two element array", () => {
    let r = new R2O.RowToObject({ firstRow: 'index', fields: {
        id: "2"
      }});
    r.convert(['id', 'IdentificatieMedewerker']);
    let obj = r.convert(['1234', '9876']);
    assert(obj.id === '9876', 'got the number')
  });

  it("column indexes: complex - two element array", () => {
    let r = new R2O.RowToObject({ firstRow: 'letter', fields: {
        id: "B"
      }});
    let obj = r.convert(['1234', '9876']);
    assert(obj.id === '9876', 'got the number')
  });
});
