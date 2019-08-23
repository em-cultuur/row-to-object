/**
 * Test the Fields
 */
const Chai = require('chai');
const assert = Chai.assert;
const _ = require('lodash');
const Logger = require('../object-mapper/logger');
const Field = require('../object-mapper/field').Field;
const FieldText = require('../object-mapper/field-text').FieldText;
const FieldBoolean = require('../object-mapper/field-boolean').FieldBoolean;
const FieldEmail = require('../object-mapper/field-email').FieldEmail;
const FieldTelephone = require('../object-mapper/field-telephone').FieldTelephone;
const FieldZipcode = require('../object-mapper/field-zipcode').FieldZipcode;
const Countries = require('../lib/lookup').Countries;
const FieldObject = require('../object-mapper/field-object').FieldObject;
const FieldArray = require('../object-mapper/field-array').FieldArray;
const FieldComposed = require('../object-mapper/field-composed').FieldComposed;
const FieldLocation = require('../object-mapper/field-location').FieldLocation;
const FieldContact = require('../object-mapper/field-contact').FieldContact;

describe('field',  () => {
  let logger = new Logger({toConsole: false});

  before(() => {
    return Promise.resolve();
  });

  describe('base', () => {
    let f = new Field();
    logger.clear();
    it('validate', () => {
      assert(f.validate('name') === true, 'everything is valid');
      return(f.adjust('name')).then (() => {
        assert(true, 'did resolve')
      })
    })
  });

  describe('text', () => {
    let f = new FieldText();
    logger.clear();
    it('validate', () => {
      assert(f.validate('name', 'value', logger) === true, 'string is valid');
      assert(!logger.hasMessages(), 'no messages');
      assert(f.validate('name', {test: 'value'}, logger) === false, 'object not valid');
      assert(logger.hasErrors(), 'error');
      assert(logger.errors.length === 1, 'the error');
      assert(logger.errors[0].fieldName === 'name', 'the field');
      assert(logger.errors[0].message === 'must be string or number', 'the error');
      logger.clear();
      assert(f.validate('name', undefined, logger) === true, 'no value is allowed');
      assert(logger.hasErrors() === false, 'no error');
      return f.convert('master', 'value', logger).then( (r) => {
        assert(r === 'value', 'did return')
      })
    })
  });

  describe('boolean', () => {
    let f = new FieldBoolean();
    logger.clear();
    it('validate', () => {
      assert(f.validate('bool', true, logger) === true, 'bool is valid');
      assert(!logger.hasMessages(), 'no messages');
      assert(f.validate('bool', false, logger) === true, 'bool is valid');
      assert(f.validate('bool', 'test', logger) === true, 'string is valid');
      assert(f.validate('bool', 0, logger) === true, 'number is valid');
      assert(f.validate('bool', {}, logger) === false, 'object not valid');
      assert(f.validate('bool', [], logger) === false, 'array not valid');
      assert(f.isEmpty(0) === false, 'values are allowed');
      assert(f.isEmpty(1) === false, 'values are allowed');
      assert(f.isEmpty('0') === false, 'values are allowed');
      assert(f.isEmpty() === true, 'no value is empty');
      return (f.convert('bool', 'text', logger)).then( (d) => {
        assert(typeof d === 'boolean', 'did convert')
      })
    })
  });

  describe('email', () => {
    let f = new FieldEmail();
    logger.clear();
    it('validate', async () => {
      assert(f.validate('email', '', logger) === true, 'none is valid');
      assert(f.validate('email', undefined, logger) === true, 'undefined is valid');
      let e = await f.convert('email', 'info@test.com', logger);
      assert(e === 'info@test.com', 'did accept');
      assert(await f.convert('email', 'INFO@test.com') === 'info@test.com', 'lo case');
      assert(await f.convert('email', '<info@test.com>') === 'info@test.com', 'remove html');
      assert(await f.convert('email', 'info @test.com ') === 'info@test.com', 'space');
      assert(await f.convert('email', 'infö@test.com ') === 'info@test.com', 'space');
    })
  });

  describe('telephone', () => {
    logger.clear();
    it('convert', async () => {
      let f = new FieldTelephone();
      assert(f.validate('tel', '', logger) === true, 'none is valid');
      assert(f.validate('tel', undefined, logger) === true, 'undefined is valid');
      let t = await f.convert('tel', '+31 612345678', logger);
      assert(t === '06-12345678', 'did accept');
      t = await f.convert('tel', '+32-612345678', logger);
      assert(t === '+32 612345678', 'did accept');
    })
  });

  describe('zipcode', () => {
    let f = new FieldZipcode();
    logger.clear();
    it('can change', async () => {
      assert(f.value('2011 BS') === '2011 BS', 'no changes on valid');
      assert(f.value('b-2011') === '2011', 'belgium');
      assert(f.value('b 2011') === '2011', 'belgium');
    });
    it('country', async () => {
      assert(f.countryId('2011 BS') === Countries.nl, 'NL');
      assert(f.countryId('B2011') === Countries.be, 'BE');
      assert(f.countryId('B-2011') === Countries.be, 'BE');
      assert(f.countryId('B 2011') === Countries.be, 'BE');
      assert(f.countryId('20115') === Countries.de, 'D');
      assert(f.countryId('') === Countries.unknown, 'empty');
      assert(f.countryId() === Countries.unknown, 'empty');
    });
  });

  describe('object', () => {
    let f = new FieldObject();
    it('empty', () => {
      assert(f.validate('name', {}, logger) === true, 'empty is valid');
      assert(f.validate('name', undefined, logger) === true, 'undefined is valid');
      assert(f.isEmpty({}), 'no fields is empty');
      // assert(f.isEmpty({test: ''}), 'no fields is empty');
    });
    f = new FieldObject({fields: {name: new FieldText(), other: new FieldText()}});
    it('one field', () => {
      logger.clear();
      assert(f.validate('obj', {name: 'test'}, logger) === true, 'field available is valid');
      assert(f.validate('obj', {name: 'test', other: 2}, logger) === true, 'field available is valid');
      assert(f.validate('obj', {name: 'test', wrong: 2}, logger) === false, 'field does not exist');
      assert(logger.errors[0].fieldName === 'obj.wrong', 'field is defined');
      logger.clear();
    });
    it('subprocess fields', async () => {
      f = new FieldObject({fields: {bool: new FieldBoolean(), email: new FieldEmail()}});
      let r = await f.convert('obj', {bool: 0, email:'INFO@test.com'}, logger);
      assert(typeof r.bool === 'boolean', 'changed');
      assert(f.isEmpty({bool: undefined}), 'is empty');
    });
    it('remove empty allowed fields',async () => {
      f = new FieldObject({fields: {bool: new FieldBoolean(), email: new FieldEmail(), _source: new FieldText({emptyAllow: true})}});
      let r = await f.convert('obj', {bool: undefined, _source : '1234'}, logger);
      assert(_.isEmpty(r), '_source is flexible');
    })
  });

  describe('array', () => {
    let f = new FieldArray();
    it('empty', () => {
      assert(f.validate('array', [], logger) === true, 'empty is valid');
      logger.clear();
      f.validate('array', {}, logger);
      assert(logger.hasErrors(), 'wrong type');
      assert(f.isEmpty([]), 'no elements is empty');
      assert(f.isEmpty(['a'] === false), 'an elements is not empty');
      assert(f.isEmpty(['', '']), 'empty string is empty')
    });
    it('fields', () => {
      assert(f.validate('array', ['test', 'test2'], logger) === true, 'is valid');
    });
    it('convert', async () => {
      logger.clear();
      let r = await f.convert('array', ['test', '', 'nr 3'], logger);
      assert(r.length === 2, 'removed one');
    });
    let f2 = new FieldArray({type: new FieldEmail()});
    assert(f2.validate('array.email', ['not@example.com'], logger), 'is valid')
  });


  describe('composed', () => {
    let f = new FieldComposed();
    logger.clear();
    it('empty', async () => {
      let r = await f.convert('composed', {}, logger);
      assert(_.isEmpty(r), 'empty');
      r = await f.convert('composed', {value: ''}, logger);
      assert(_.isEmpty(r), 'empty');
      r = await f.convert('composed', {value: undefined}, logger);
      assert(_.isEmpty(r), 'empty');
    });
    it('not valid field', async () => {
      try {
        let r = await f.convert('composed', {unknownField: 'test'}, logger);
        assert(false, 'should fail, unknown field');
      } catch (e) {
        assert(e.type === 'ErrorFieldNotAllowed', 'right version');
        assert(e.fields.length === 1, 'one field');
        assert(e.fields[0] === 'unknownField', 'the name');
      }
    });
    it('remove empty fields', async () => {
      let r = await f.convert('composed', {type: '', value:'some value', _source: '123'}, logger);
      assert(r.type === undefined, 'removed');
      assert(r._source === '123', 'left the others');
    });
  });

  describe('location',  () => {
    let f = new FieldLocation();
    logger.clear();
    it('empty', async () => {
      let r = await f.convert('location', {street: '', city: '', zipcode: '', country: '',  _source: 'master'}, logger);
      assert(_.isEmpty(r), 'remove all')
    });
    it('find country', async() => {
      let r = await f.convert('location', {street: '', city: 'Amsterdam', zipcode: '', country: 'nederland',  _source: 'master'}, logger);
      assert(r.countryId === Countries.nl, 'found us');
      r = await f.convert('location', {street: '', city: 'Amsterdam', zipcode: '', country: 'België',  _source: 'master'}, logger);
      assert(r.countryId === Countries.be, 'found');
      r = await f.convert('location', {street: '', city: 'Amsterdam', zipcode: 'B-1234',  _source: 'master'}, logger);
      assert(r.countryId === Countries.be, 'found');
      r = await f.convert('location', {street: '', city: 'Amsterdam', zipcode: '12345',  _source: 'master'}, logger);
      assert(r.countryId === Countries.de, 'found');
    });
    it('split street', async() => {
      let r = await f.convert('location', {
        streetNumber: 'Westerstraat 12 huis',
        city: 'Amsterdam',
        zipcode: '',
        _source: 'master'
      }, logger);
      assert(r.street === 'Westerstraat', 'found');
      assert(r.number === '12', 'found');
      assert(r._source === 'master', 'no process but still there')
    });
    it('lookup street from zipcode', async() => {
      let r = await f.convert('location', { street: '', city: 'Amsterdam', number: '67', zipcode: '1017 TE', country: 'nederland', _source: 'master'}, logger);
      assert(r.street === 'damrak', 'found');
    });
    it('lookup zipcode from street', async() => {
      let r = await f.convert('location', { street: 'Damrak', city: 'Amsterdam', number: '67', country: 'nederland', _source: 'master'}, logger);
      assert(r.zipcode === '1001 ML', 'found');
    });
  });

  describe('contact',  () => {
    let f = new FieldContact();
    logger.clear();
    it('fullname', async () => {
      let r = await f.convert('contact', {fullName: 'Jan de Hond'}, logger);
      assert(r.firstName === 'Jan' && r.lastName === 'Hond' && r.namePrefix === 'de' , 'got all');
      r = await f.convert('contact', {fullName: 'dr. J. de Hond'}, logger);
      assert(r.title === 'dr.' && r.firstName === undefined && r.firstLetters === 'J.' && r.lastName === 'Hond' && r.namePrefix === 'de' , 'got all');
      r = await f.convert('contact', {fullName: 'Jan Willem de Boer'}, logger);
      assert(r.firstLetters = 'J.W.' && r.firstName === 'Jan' && r.middleName === 'Willem' && r.lastName === 'Boer' && r.namePrefix === 'de' , 'got all');
      r = await f.convert('contact', {fullName: 'Jack (mojo) Man'}, logger);
      assert(r.firstName === 'Jack' && r.lastName === 'Man' && r.firstLetters === 'J.' && r.nickName === 'mojo' , 'got all');
      r = await f.convert('contact', {fullName: 'sergeant majoor Bert de Vries'}, logger);
      assert(r.firstName === 'Bert' && r.lastName === 'Vries' && r.firstLetters === 'B.' && r.title === 'sergeant majoor' , 'got all')
      r = await f.convert('contact', {fullName: 'Abt Jan'}, logger);
      assert(r.lastName === 'Jan' && r.title === 'Abt' , 'got all')

    });

  });
});