var delegate  = require('func-delegate')
  , Sequelize = require('sequelize');

var getId = function(req, _id, _obj) {
  var obj = _obj ? req.hooks[_obj] : req.params;
  return obj[_id];
};

var getter = function(Model, hook, _id, _obj) {
  return function(req, res, next) {
    var id  = getId(req, _id, _obj);
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
  name: 'id',
  type: String,
  allowNull: false,
  defaultValue: 'id',
  message: 'req.params[id] or req.hooks[obj][id], id is key\'s name'
}, {
  name: 'obj',
  type: String,
  allowNull: true,
  message: 'req.params[id] or req.hooks[obj][id] obj is hook\'s name'
}]);
