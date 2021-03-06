# row-to-object

Converting a row from CSV or Excel into an object or convert one type of object into an other


## Usage

```js
const Conv = require('@toxus/row-to-object').RowToObject;

let converter = new Conv({ type: 'fieldName', fields: {
  id: 'UserNumber',
  name: 'Name',
  location: {
    street: 'Street',
    city: 'City'
  },
  email: [
    { type: "'work'", value: 'WorkEmail'},
    { type: "Newsletter | length > 0 ? 'newsletter' : undefined", 
      value: "Newsletter | length > 0 ? Newsletter : undefined"
    }
  ]
}})

let data = [ 
        ['UserNumber', 'Name', 'Amount', 'Street', 'City', 'WorkEmail', 'Newsletter'], 
        ['340', 'John Doe', '8,35', 'mainstreet 12', 'Amsterdam', 'work@doe.com', 'news@doe.com'], 
        ['463', 'Jane Doe', '10,95', 'localbase 55', 'Rotterdam', 'none@work.com', '']
     ];
for (let l = 0; l < data.length; l++) {
  let obj = converter.convert(data[l]);
  if (obj) {
    console.log(obj)
  }
}
// will output
// {id: '340', name: 'John Doe', 
//    location: {street: 'mainstreet 12', city: 'Amsterdam'}, 
//    email: [
//      {type: 'work', value: 'work@doe.com}, 
//      type: 'newsletter, value: 'news@doe.com'}
//    ]
// {id: '463', name: 'Jane Doe', 
//    location: {street: 'localbase 55', city: 'Rotterdam'}
//    email: [{type: 'work', value: 'none@work.com'}]
// }


````
## Special variables
* __date = the current date

## Function
for formats see: [moment.js](https://momentjs.com/)
* date - convert the value into a date. Parameter: format
* dateAdd - add a period to the date: Parameter count, period, 
* dateSubract - subtract a periode from a date count, period
* dateFormat - extract the date in a pref defined format. 

* trim - trims the string
* ltrim - left trims the string
* rtrim - right trims the string
* length - returns the length of the string

examples
```js
let config = {
  subribeDate: "'04-06-2019' | date",
  endDate: "'04-06-2019' | date | dateAdd('1', 'month')",
  written: "'20-03-2019' | date | dateFormat('LL')",   // 20 maart 2019
  other: "20-03-2019' | date | dateFormat('LL', 'fr'), " // 20 mars 2019  
}
````

## converting
To convert a Javascript JSON into an object to be parsed Object is added.
examples:
```javascript
let config = {
  arrayElm1: "['elm1', 'elm2'] | Object[1]", // return 'elm2'
  arrayElm2: "['elm1', 'elm2'] | Object[3]", // return undefined
  objElm: '{"name": "John", "last": "Doe"}| Object.name', // returns 'John'
  arrayObject: '[{"name": "John", "last": "Doe"}, {"name": "Jane", "last": "Both"}] | Object[.last == "Doe"].name' // John
}
```

To convert a string into an array the **split** can be used:
```javascript
let config = {
  arrayElm1: "'elm1, elm2, elm3' | split(',')[1]", // return 'elm2'
  arrayElm2: "'elm1, elm2, elm3' | split(',').length", // return 3
  arrayElm3: "'' | Split(',')", // return undefined
  arrayElm4: "'elm1, elm2, elm3' | split(',', 2).length", // return 2
}
```
The split take two parameters, the first is the string used to split the original string, the second is the limit of the
count of elements in the array. The rest is removed.

## string manipulation
Taking part of a string can be done with **substr**
examples:
```javascript
let telephone = 'Some Textual'
let config = {
    "first": "telefoon[0]",                  // 'S'
    "second": "telefoon | substr(5)",        // 'Textual'
    "third": "telefoon | substr(5,4)",       // 'Text'
}
```

## string replacement
examples:
```javascript
let telephone = 'Some Textual'
let config = {
    "first": "telephone | replace('Some', 'No')",         // 'No Textuals'
}
```
## case changing
examples:
```javascript
let telephone = 'Some Textual'
let config = {
    "fiRst": "telephone | toUpperCase",         // 'FIRST',
    "fiRst": "telephone | toLowerCase",         // 'first'
}
```

## guid creation
examples:
```javascript
let telephone = 'Some Textual'
let config = {
    "first": "telephone | md5",                 // generate a 32 byte md5 of the text,
    "guid": "telephone | guid",                 // generate a 20 byte md5,
    "shortGuid": "'c' + (telephone | guid(19))" // generate c + 19 byte md5
}
```
## slott
examples:
```javascript
let telephone = 'Some Textual'
let config = {
  result: "text | slot(' - ')",              // on text = 'world' -> ' - world'
  combine: "'test' + text | slot(', ')",     // on text = 'world' -> ' test, world'
  resultFalse: "text | slot(' - ')",         // on text = false -> 'world'
  resultUndefined: "text | slot(' - ')",     // on text = undefined -> 'world'
}
```

## padStart
examples:
```javascript
let telephone = 'Some Textual'
let config = {
  text: "idText |padStart(5, '0')",               // '00005'
  number: "idNumber |padStart(5, '0')",           // '00004'
  boolTrue: "idBoolTrue | padStart(5, '0')",      // '00001'
  boolFalse: "idBoolFalse | padStart(5, '0')",    // '00000'
  other: "idOther| padStart(5, '0')"              // {x: 1}
}
// with the values: 
{ idText: '5', idNumber: 4, idBoolTrue: true, idBoolFalse: false, idOther: {x: 1}
````




## looping
To process arrays the loop can be used. Loop are defined als normal variables.

The last **arrayObject** does a filter on the array. The statement [.last == "Doe"] filters all elements that have
"Doe" as last. More information on filtering can be found in the [Jexl documentation](https://www.npmjs.com/package/jexl)
```javascript
let  code = {
    '$$LOOP': {
      count: "arrayField | split(',') | length",     
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
  }
```
The parts of the loop construct:
* $$LOOP - (can be changed by **markers.loopStatement**) this defines that a loop is defined :)) It's case-sensitive and the result will be added to the parent (code in this case)
* count - the total number of time the itteration has to be done. The current index is defined by the $$INDEX variable. 
If there are multiple indexes the name can be defined by the index property
* block - the part that will be repeated count times. 
* include - the extra element that have to be included. Because only one **code** can exist in the fields structure, the include makes it
possible to add extra code elements to the array. Its the 'normal' contact from the code


## if
The conditional is can be used to select between different values. The default marker is $$IF (can be changed
by setting the **markers.ifStatment**). The key **condition** (can be changed by markers.condition) is used to evaluate the statement. 
The result value of the evaluation is used to find the part that will be return. If no value matches the **default** 
(can be changed by setting **markers.default**) is used. 

```javascript
 let conv = {
    markers: {ifStatement: '=if'},
    fields: {
      // compare can be an array or just a value.
      compare: {
        '=if': {
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
  }
```
If none matches and there is no default, the entire structure isn't added

## Configuring
The conversion from the row (array) to an object is done by an configuration object. For every
field in the final object an entry is made. An example:

```js
let config = {
  city: "'Amsterdam'",
  fullName: "name",
  name: {_value: "someColumn", _required: true}
}
````

### literal values
To add a literal value to the final object, the value has to be preceded with an =. 
Example: city: "=Amsterdam" 

### field value
There are two way to retrieve data from the row: direct (fullName: "name") or using a structure 
(fullName: _value: "name"). With the later structure the field can made required by adding the 
_required flag.

The fields can be addressed in different ways:
- by the name given in the first column (type == fieldName)
- by the number (index) of the column (type == index)
- by the spreadsheet column name (A, AD) (type == letters)

When creating an object the format should be specified (default: index). The first row will be automatically skipped 
if the type is fieldName

When a column name has a name, that is not allowed like e-mail, j/n, the value of the column
can still be retrieved by using the option field['fieldname']. An example:

```js
let config = {
  location: {
    email: "field['email']",
    didSubscribe: "field['subscribe j/n'] == 'j' ? true : false"
  }
}
```

### object
A nested object can be created from the row. An example:
```js
let config = {
  location: {
   "street": "WerkadresStraat",
   "city": "'Amsterdam'",
  }
}
````
This will generate an object:
```js
  data = { location: { street: '1111', city: 'Amsterdam'}}  
````  
If the field has the _required flag and has no value, the entire object will be removed
 
## key
When filtering a specific record the problem arises what happens if not found. For this the **key** options is
available. With this the default value and what to return if not found can be set:
```javascript
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
```  

The general format is: key([fieldname], [default value]);
* fieldname. The name of the field. If set to False the entire structure of that field is returned
* default value the value to return if nothing is found. This can be a string or a structure.

### array of fields
An array can be contructed from the row by declaring the field as an array. Example:
```js
let config = {
  location: [
    {
      _index: "work",
      "street": "WerkadresStraat",
      "city": "=Amsterdam",
    },
    {
      _index: "home",
      "street": "HomeStreet",
      "city": "=Some where",
    }
  ]
}
````
This will generate an object:
```js
  data = { 
    location: [
      { street: '1111', city: 'Amsterdam', _index: "work"}, 
      {street: 'someval', city: "Some where", _index: "home"}
    ] 
  }  
````  
To reference an special element then _index property can be used. The value of the index is added to
the final object.



## License

(c) 2019-2020 EM-Cultuur, MIT
