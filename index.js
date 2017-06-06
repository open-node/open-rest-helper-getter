const delegate = require('func-delegate');
const _ = require('lodash');

const modelInclude = (params, includes) => {
  if (!includes) return undefined;
  if (!_.isString(params.includes)) return undefined;
  const ret = _.filter(params.includes.split(','), (x) => includes[x]);
  if (ret.length === 0) return undefined;
  return _.map(ret, (x) => _.clone(includes[x]));
};

const getter = (Model, hook, keyPath) => (
  (req, res, next) => {
    const id = _.get(req, keyPath);
    const include = modelInclude(req.params, Model.includes);
    const opt = { where: { id } };
    if (include) opt.include = include;
    Model.find(opt).then((model) => {
      req.hooks[hook] = model;
      next();
    }).catch(next);
  }
);

module.exports = (rest) => {
  const Sequelize = rest.Sequelize;
  rest.helper.getter = delegate(getter, [{
    name: 'Model',
    type: Sequelize.Model,
    message: 'Model must be a class of Sequelize defined',
  }, {
    name: 'hook',
    type: String,
    allowNull: false,
    message: 'Geted instance will hook on req.hooks[hook], so `hook` must be a string',
  }, {
    name: 'keyPath',
    type: String,
    allowNull: false,
    defaultValue: 'params.id',
    message: 'Gets the value at path of object.',
  }]);

  return rest.helper.getter;
};
