var BaseDao = require('./BaseDao.js'),
    models = require('../models/db.js'),
    liveModel = models.live;

var liveDao = function(){};
liveDao.prototype = new BaseDao(liveModel);

module.exports = liveDao;