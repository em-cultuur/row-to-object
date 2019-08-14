# row-to-object

Converting a row from CSV or Excel into an object

## Install

```
$ npm install @toxus/row-to-object --save
```

## Usage

```js
const cnf = require('@toxus/row-to-object');

function convert() {
}

````
## Configuring
The conversion from the row (array) to an object is done by an configuration object. For every
field in the final object an entry is made. An example:

```js
let config = {
  city: "=Amsterdam",
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
### object
A nested object can be created from the row. An example:
```js
let config = {
  location: {
   "street": "WerkadresStraat",
   "city": "=Amsterdam",
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