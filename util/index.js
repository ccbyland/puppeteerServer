const str = require("./str.js");
const date = require("./date.js");
const file = require("./file.js");
const log = require("./log.js");
const net = require("./net.js");
const url = require("./url.js");
const browser = require("./browser.js");
module.exports = Object.assign(str, date, file, log, url, net, browser);