var assert      = require('assert')
  , Sequelize   = require('sequelize')
  , getter      = require('../');

var sequelize = new Sequelize();
var Model = sequelize.define('book', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING(100)
});

var modelInclude = function(params, includes) {
  var ret;
  if (!includes) return;
  if (!_.isString(params.includes)) return;
  ret = _.filter(params.includes.split(','), function(x) {
    return includes[x];
  });
  if (ret.length === 0) return;
  return _.map(ret, function(x) {
    return _.clone(includes[x]);
  });
};

describe("open-rest-helper-getter", function() {
  describe("Helper init", function() {
    it("First argument type error", function(done) {
      assert.throws(function() {
        getter({});
      }, function(err) {
        return err instanceof Error && err.message === 'Model must be a class of Sequelize defined'
      });
      done();
    });

    it("First argument lack model attr", function(done) {
      assert.throws(function() {
        getter(Model);
      }, function(err) {
        return err instanceof Error && err.message === 'Please use open-rest version>=7.0.0';
      });
      done();
    });

    it("First argument lack model.modelInclude method ", function(done) {
      assert.throws(function() {
        Model.model = {};
        getter(Model);
      }, function(err) {
        return err instanceof Error && err.message === 'Please use open-rest version>=7.0.0';
      });
      done();
    });

    it("Second argument must be string", function(done) {
      assert.throws(function() {
        Model.model = {modelInclude: modelInclude};
        getter(Model);
      }, function(err) {
        return err instanceof Error && err.message === 'Geted instance will hook on req.hooks[hook], so `hook` must be a string'
      });
      done();
    });

    it("Third argument must be string", function(done) {
      assert.throws(function() {
        Model.model = {modelInclude: modelInclude};
        getter(Model, 'book', []);
      }, function(err) {
        return err instanceof Error && err.message === 'req.params[id] or req.hooks[obj][id], id is key\'s name'
      });
      done();
    });

    it("The 4th argument must be string", function(done) {
      assert.throws(function() {
        Model.model = {modelInclude: modelInclude};
        getter(Model, 'book', 'bookId', []);
      }, function(err) {
        return err instanceof Error && err.message === 'req.params[id] or req.hooks[obj][id] obj is hook\'s name'
      });
      done();
    });

    it("All arguments right no exception", function(done) {
      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20}
      };
      var res = {};
      var book = {id: 20, name: 'JavaScript 高级程序设计'};

      Model.find = function(opts) {
        assert.deepEqual({where: {id: 20}}, opts);
        return new Promise(function(resolve, reject) {
          resolve(book);
        });
      };

      helper(req, res, function(err) {
        assert.equal(null, err);
        assert.equal(req.hooks['book'], book);
        done();
      });
    });

    it("All arguments right no exception id = req.hooks[obj][id]", function(done) {
      var helper = getter(Model, 'book', 'bookId', 'user');
      var req = {
        hooks: {
          user: {bookId: 30}
        },
        params: {id: 20}
      };
      var res = {};
      var book = {id: 20, name: 'JavaScript 高级程序设计'};

      Model.find = function(opts) {
        assert.deepEqual({where: {id: 30}}, opts);
        return new Promise(function(resolve, reject) {
          resolve(book);
        });
      };

      helper(req, res, function(err) {
        assert.equal(null, err);
        assert.equal(req.hooks['book'], book);
        done();
      });
    });


    it("All arguments right has exception", function(done) {
      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20}
      };
      var res = {};
      var error = Error('Find book error');

      Model.find = function(opts) {
        assert.deepEqual({where: {id: 20}}, opts);
        return new Promise(function(resolve, reject) {
          reject(error);
        });
      };

      helper(req, res, function(err) {
        assert.equal(error, err);
        assert.equal(req.hooks['book'], undefined);
        done();
      });
    });

    it("All arguments right includes", function(done) {
      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20}
      };
      var res = {};
      var error = Error('Find book error');

      Model.find = function(opts) {
        assert.deepEqual({where: {id: 20}, include: 'ONLY_FOR_TEST'}, opts);
        return new Promise(function(resolve, reject) {
          reject(error);
        });
      };

      Model.model.modelInclude = function() {
        return 'ONLY_FOR_TEST';
      };
      helper(req, res, function(err) {
        assert.equal(error, err);
        assert.equal(req.hooks['book'], undefined);
        done();
      });
    });
  });
});
