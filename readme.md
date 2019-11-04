# row-to-object

Converting a row from CSV or Excel into an object or convert one type of object into an other

## Install

```
$ npm install @toxus/row-to-object --save
```

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




 
 
## Maintainers

- [Jaap van der Kreeft](https://github.com/toxus)


## License

(c) 2019 Toxus, MIT
