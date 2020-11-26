require("colors");
const uDate = require("../util/date.js");

const slice = Array.prototype.slice;

exports.info = function (message) {
  message = message || "";

  var args = slice.call(arguments);
  args[0] =
    ("[" + uDate.format(new Date(), "yyyy-MM-dd hh:mm:ss") + "] ").yellow +
    message.yellow;
  console.log.apply(console, args);
};

exports.log = function (message) {
  message = message || "";

  var args = slice.call(arguments);
  args[0] =
    ("[" + uDate.format(new Date(), "yyyy-MM-dd hh:mm:ss") + "] ").gray +
    message.gray;
  console.log.apply(console, args);
};

exports.error = function (message) {
  message = message || "";

  var args = slice.call(arguments);
  args[0] =
    ("[" + uDate.format(new Date(), "yyyy-MM-dd hh:mm:ss") + "] ").red +
    message.red;
  console.log.apply(console, args);
};

exports.success = function (message) {
  message = message || "";

  var args = slice.call(arguments);
  args[0] =
    ("[" + uDate.format(new Date(), "yyyy-MM-dd hh:mm:ss") + "] ").green +
    message.green;
  console.log.apply(console, args);
};
