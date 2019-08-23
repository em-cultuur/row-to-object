/**
 * parses the fullname into it's counter parst
 */

const parser = require('parse-full-name').parseFullName;
const parserConfig = require('parse-full-name').changeWords;
const parserWords = require('parse-full-name').words;

class ParseFullName {
  constructor(options = {}) {
    parserConfig('suffix', options.suffix ? options.suffix :['ba', 'bsc', 'ma', 'msc', 'llb', 'llm', 'a.i.']);
    parserConfig('prefix', options.prefix ? options.prefix : ['d\'', 'de', 'den', 'die', 'van', 'der', 'v/d', 'llm', 'a.i.']);
    parserConfig('titles', options.titles ? options.titles : ['drs.', 'mr.', 'dr.', 'b.d.', 'broeder'])
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