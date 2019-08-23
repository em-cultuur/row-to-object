/**
 * parses the fullname into it's counter parst
 */

const parser = require('parse-full-name').parseFullName;
const parserConfig = require('parse-full-name').changeWords;
const parserWords = require('parse-full-name').words;

class ParseFullName {
  constructor(options = {}) {
    parserConfig('suffix', options.suffix ? options.suffix :['ba', 'bsc', 'ma', 'msc', 'llb', 'llm', 'a.i.']);
    parserConfig('prefix', options.prefix ? options.prefix : ['d\'', 'de', 'de', 'de', 'den', 'Di', 'du', 'in', 'la', 'le', 'op', '\'t', 'te', 'ten', 'ter', 'v.d.', 'v/d', 'van', 'Vande', 'Vanden', 'Vander', 'von', 'voor']);
    parserConfig('titles', options.titles ? options.titles : [ 'dr.', 'drs.', 'baron', 'adjudant', 'abt', 'barones', 'Broeder', 'deken', 'ing.', 'ir.', 'Jhr.', 'Jkvr.', 'kaptein', 'kol', 'lkol b.d.', 'lt.', 'kol.', 'luitenant', 'zee', 'luitenant-ko', 'Maj. b.d.',
                  'majoor', 'mr.', 'Pater', 'prof.', 'ritm.', 'sergeant', 'majoor', 'Zr.', 'Zuster' ])
 }

  get suffix() {
    return parserWords('suffix')
  }
  set suffix(value) {
    parserConfig('suffix', value)
  }

  get prefix() {
    return parserWords('prefix')
  }
  set prefix(value) {
    parserConfig('prefix', value)
  }
  get title() {
    return parserWords('title')
  }
  set title(value) {
    parserConfig('title', value)
  }

  analyse(name) {
    return parser(name)
  }
}

module.exports.ParseFullName = ParseFullName;