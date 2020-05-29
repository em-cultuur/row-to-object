# row to object
## revisions

## 2020-05-29
- add: options.evalString. if set and the value of object is equal the text is intepreted as eval otherwise as string
- add: Loop: header and footer vs include

## 2020-05-27
- fix: undefined value of property does not handled properly
- add: split(prefix) so we can evaluate easy  "lastname + (name | split('-'))  to retrieve McAnser, Jay"


## 2020-04-23
- better guid (36 based)

## 2020-04-22
- added guid(length) and md5

## 2020-04-18
- \#emptyCheck to change the behavour of the empty remove. Values are none, length
- added the function replace

## 2020-04-15 0.9.3
- n2br

### 2020-04-10 - 0.9.2 _(jay)_
- error in length calculation


### 2020-04-10 - 0.9.1 _(jay)_
- missing ErrorTypes include
- length of undefined returns an error

### 2020-04-07 - 0.9.0 _(jay)_
- change default row.firstRow to 'fieldName' (was 'index')
- added split(separator, limit) to convert strings into arrays (test in row)


### 2020-03-31 - 0.8.0 _(jay)_
- changed ownership to em-cultuur

### 2020-03-23 - 0.7.5 _(jay)_
- Fix boolean does not return in Object to Object

### 2020-03-23 - 0.7.4 _(jay)_
- Fix boolean does not return because of undefined

### 2020-03-14 - 0.7.3 _(jay)_
- Error trapping and prolongation repair in the Jexl (now on em-cultuur)

### 2020-03-11 - 0.7.2 _(jay)_
- added **substr** function:   'test' | substr(0,2) === 'te'
- added **field** to the object definition

### 2020-02-23 - 0.7.0 _(jay)_
- start revisions documentation
- add the | Object definition so the string can be parsed into an Javascript object and can be manipulated
