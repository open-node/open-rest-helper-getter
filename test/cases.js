var assert      = require('assert')
  , rest        = require('open-rest')
  , Sequelize   = rest.Sequelize
  , getter      = require('../')(rest);

var sequelize = new Sequelize();
var Model = sequelize.define('book', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING(100)
});

var User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING(100)
});

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


    it("Second argument must be string", function(done) {
      assert.throws(function() {
        getter(Model);
      }, function(err) {
        return err instanceof Error && err.message === 'Geted instance will hook on req.hooks[hook], so `hook` must be a string'
      });
      done();
    });

    it("Third argument must be string", function(done) {
      assert.throws(function() {
        getter(Model, 'book', []);
      }, function(err) {
        return err instanceof Error && err.message === 'Gets the value at path of object.'
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
      var helper = getter(Model, 'book', 'hooks.user.bookId');
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
      Model.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true
        }
      };

      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20, includes: 'user'}
      };
      var res = {};
      var error = Error('Find book error');

      Model.find = function(opts) {
        assert.deepEqual({where: {id: 20}, include: [{
          model: User,
          as: 'creator',
          required: true
        }]}, opts);
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

    it("All arguments none includes", function(done) {
      Model.includes = undefined;
      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20, includes: 'user'}
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

    it("All arguments params includes isnt string", function(done) {
      Model.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true
        }
      };

      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20, includes: ['user']}
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

    it("All arguments params includes dont match", function(done) {
      Model.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true
        }
      };

      var helper = getter(Model, 'book');
      var req = {
        hooks: {},
        params: {id: 20, includes: 'author'}
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
  });
});
