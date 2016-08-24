var delegate  = require('func-delegate')
  , _         = require('lodash')
  , Sequelize = require('sequelize');

var getter = function(Model, hook, keyPath) {
  return function(req, res, next) {
    var id  = _.get(req, keyPath);
    var include = Model.model.modelInclude(req.params, Model.includes);
    var opt = {where: {id: id}};
    if (include) opt.include = include;
    Model.find(opt).then(function(model) {
      req.hooks[hook] = model;
      next();
    }).catch(next);
  };
};

module.exports = delegate(getter, [{
  name: 'Model',
  type: Sequelize.Model,
  validate: {
    model: function(value) {
      if (!value.model || !value.model.modelInclude) {
        throw Error('Please use open-rest version>=7.0.0');
      }
      return true;
    }
  },
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
