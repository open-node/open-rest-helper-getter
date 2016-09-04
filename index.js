var delegate  = require('func-delegate')
  , _         = require('lodash');

var modelInclude = function(params, includes) {
  if (!includes) return;
  if (!_.isString(params.includes)) return;
  var ret = _.filter(params.includes.split(','), function(x) {
    return includes[x];
  });
  if (ret.length === 0) return;
  return _.map(ret, function(x) { return _.clone(includes[x]); });
};

var getter = function(Model, hook, keyPath) {
  return function(req, res, next) {
    var id  = _.get(req, keyPath);
    var include = modelInclude(req.params, Model.includes);
    var opt = {where: {id: id}};
    if (include) opt.include = include;
    Model.find(opt).then(function(model) {
      req.hooks[hook] = model;
      next();
    }).catch(next);
  };
};

module.exports = function(rest) {
  var Sequelize = rest.Sequelize;
  return rest.helper.getter = delegate(getter, [{
    name: 'Model',
    type: Sequelize.Model,
    message: 'Model must be a class of Sequelize defined'
  }, {
    name: 'hook',
    type: String,
    allowNull: false,
    message: 'Geted instance will hook on req.hooks[hook], so `hook` must be a string'
  }, {
    name: 'keyPath',
    type: String,
    allowNull: false,
    defaultValue: 'params.id',
    message: 'Gets the value at path of object.'
  }]);
};
