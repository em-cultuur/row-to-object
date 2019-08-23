/**
 * class to log errors, warning and info
 *
 * version 0.0.1 JvK 2019-08-22
 */

class Logger {

  constructor(options = {}) {
    this._toConsole = options.toConsole !== undefined ? !!options.toConsole : true;
    this._history = [];
  }

  error(fieldName, msg) {
    if (this._toConsole) {
      console.error(fieldName, msg);
    } else {
      this._history.push({type: 'error', fieldName: fieldName, message: msg})
    }
  }

  warn(fieldName, msg) {
    if (this._toConsole) {
      console.warn(fieldName, msg);
    } else {
      this._history.push({type: 'warn', fieldName: fieldName, message: msg})
    }
  }

  info(fieldName, msg) {
    if (this._toConsole) {
      console.info(fieldName, msg);
    } else {
      this._history.push({type: 'info', fieldName: fieldName, message: msg})
    }
  }

  get errors() {
    return this._history.filter( (log) => log.type === 'error') ;
  }
  get warnings() {
    return this._history.filter( (log) => log.type === 'warn') ;
  }
  get infos() {
    return this._history.filter( (log) => log.type === 'info') ;
  }
  get log() {
    return this._history;
  }

  hasErrors() {
    return this.errors.length > 0 ;
  }
  hasWarnings() {
    return this.warnings.length > 0 ;
  }
  hasMessages() {
    return this._history.length > 0;
  }

  clear() {
    this._history = [];
  }
}

module.exports = Logger;