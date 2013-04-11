/*
 * folderize
 */

/*
 * Require dependencies
 */

var fs      = require('fs'),
    path    = require('path'),
    async   = require('async'),
    debug   = require('debug');

/*
 * Set constants
 */

var PREFIX = 'dir';

/*
 * Set debug prefix
 */

debug = debug('folderizer');

/*
 * options.size
 */
exports.run = function(options) {

  /*
   * List all files
   */
  var files = fs.readdirSync(process.cwd());
  debug('files', files);

  /*
   * Group them together
   */
  var tiered = files.reduce(function(previousValue, currentValue, index, array) {
    if (index % options.size === 0)
      previousValue.push([]);
    previousValue[previousValue.length - 1].push(currentValue);
    return previousValue;
  }, []);
  debug('tiered', tiered);

  /*
   * Create move files into folders
   */
  var padder = getPadder(tiered.length);
  var setDir = function(subArray, callback) {
    var dirname = padder();
    fs.mkdirSync(dirname);
    async.map(subArray, function(file, callback) {
      fs.link(file, path.join(dirname, file), callback); 
    }, callback);
  }
  async.map(tiered, setDir, function(err, res) {
    debug('done');
  });
}


/*
 * TODO: delete all dirs on SIGINT
 */


/*
 * i.e. `var padder = getPadder(tiered.length);`
 */
function getPadder(length) {
  var numLen = length.toString().length;
  var number = 0;

  var padderHelper = function(number) {
    var numString = number.toString();
    /* base case */
    if (numString.length === numLen) {
      number++;
      return PREFIX + numString;
    }
    /* recurse */
    return padderHelper('0' + numString);
  }

  return function () {
    var result = padderHelper(number);
    number++;
    return result;
  }
}
