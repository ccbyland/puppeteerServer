function BaseDao(Model) {
  this.model = Model;
}

BaseDao.prototype.create = function (doc, callback) {
  this.model.create(doc, function (error) {
    if (error) {
      return callback(error);
    }
    return callback(doc);
  });
};

BaseDao.prototype.insertAll = function (list, callback) {
  this.model.collection.insertMany(list, function (error, aa) {
    if (error) {
      return callback(error);
    }
    return callback(aa);
  });
};

BaseDao.prototype.getById = function (id, callback) {
  this.model.findOne({ _id: id }, function (error, model) {
    if (error) {
      return callback(error, null);
    }
    return callback(null, model);
  });
};

BaseDao.prototype.countByQuery = function (query, callback) {
  this.model.count(query, function (error, count) {
    if (error) {
      return callback(error, null);
    }
    return callback(null, count);
  });
};

BaseDao.prototype.getByQuery = function (query, fileds, opt, callback) {
  this.model.find(query, fileds, opt, function (error, model) {
    if (error) {
      return callback(error, null);
    }
    return callback(null, model);
  });
};

BaseDao.prototype.getAll = function (callback) {
  this.model.find({}, function (error, model) {
    if (error) {
      return callback(error, null);
    }
    return callback(null, model);
  });
};

BaseDao.prototype.delete = function (query, callback) {
  this.model.remove(query, function (error, model) {
    if (error) {
      return callback(error);
    }
    return callback(null);
  });
};

BaseDao.prototype.update = function (conditions, update, optsion, callback) {
  this.model.update(conditions, update, optsion, function (error) {
    if (error) {
      return callback(error);
    }
    return callback(null);
  });
};

module.exports = BaseDao;
