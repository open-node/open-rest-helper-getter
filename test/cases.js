const assert = require('assert');
const rest = require('open-rest');
const om = require('open-rest-with-mysql');
const getterHelper = require('../');

om(rest);
const getter = getterHelper(rest);
const Sequelize = rest.Sequelize;
const sequelize = new Sequelize();
const Model = sequelize.define('book', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

describe('open-rest-helper-getter', () => {
  describe('Helper init', () => {
    it('First argument type error', (done) => {
      assert.throws(() => {
        getter({});
      }, (err) => (
        err instanceof Error && err.message === 'Model must be a class of Sequelize defined'
      ));
      done();
    });


    it('Second argument must be string', (done) => {
      assert.throws(() => {
        getter(Model);
      }, (err) => {
        const msg = 'Geted instance will hook on req.hooks[hook], so `hook` must be a string';
        return err instanceof Error && err.message === msg;
      });
      done();
    });

    it('Third argument must be string', (done) => {
      assert.throws(() => {
        getter(Model, 'book', []);
      }, (err) => err instanceof Error && err.message === 'Gets the value at path of object.');
      done();
    });

    it('All arguments right no exception', (done) => {
      const helper = getter(Model, 'book');
      const req = {
        hooks: {},
        params: { id: 20 },
      };
      const res = {};
      const book = { id: 20, name: 'JavaScript 高级程序设计' };

      Model.find = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve) => {
          resolve(book);
        });
      };

      helper(req, res, (err) => {
        assert.equal(null, err);
        assert.equal(req.hooks.book, book);
        done();
      });
    });

    it('All arguments right no exception id = req.hooks[obj][id]', (done) => {
      const helper = getter(Model, 'book', 'hooks.user.bookId');
      const req = {
        hooks: {
          user: { bookId: 30 },
        },
        params: { id: 20 },
      };
      const res = {};
      const book = { id: 20, name: 'JavaScript 高级程序设计' };

      Model.find = (opts) => {
        assert.deepEqual({ where: { id: 30 } }, opts);
        return new Promise((resolve) => {
          resolve(book);
        });
      };

      helper(req, res, (err) => {
        assert.equal(null, err);
        assert.equal(req.hooks.book, book);
        done();
      });
    });


    it('All arguments right has exception', (done) => {
      const helper = getter(Model, 'book');
      const req = {
        hooks: {},
        params: { id: 20 },
      };
      const res = {};
      const error = Error('Find book error');

      Model.find = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(req, res, (err) => {
        assert.equal(error, err);
        assert.equal(req.hooks.book, undefined);
        done();
      });
    });

    it('All arguments right includes', (done) => {
      Model.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true,
        },
      };

      const helper = getter(Model, 'book');
      const req = {
        hooks: {},
        params: { id: 20, includes: 'user' },
      };
      const res = {};
      const error = Error('Find book error');

      Model.find = (opts) => {
        assert.deepEqual({
          where: { id: 20 },
          include: [{
            model: User,
            as: 'creator',
            required: true,
          }],
        }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(req, res, (err) => {
        assert.equal(error, err);
        assert.equal(req.hooks.book, undefined);
        done();
      });
    });

    it('All arguments none includes', (done) => {
      Model.includes = undefined;
      const helper = getter(Model, 'book');
      const req = {
        hooks: {},
        params: { id: 20, includes: 'user' },
      };
      const res = {};
      const error = Error('Find book error');

      Model.find = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(req, res, (err) => {
        assert.equal(error, err);
        assert.equal(req.hooks.book, undefined);
        done();
      });
    });

    it('All arguments params includes isnt string', (done) => {
      Model.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true,
        },
      };

      const helper = getter(Model, 'book');
      const req = {
        hooks: {},
        params: { id: 20, includes: ['user'] },
      };
      const res = {};
      const error = Error('Find book error');

      Model.find = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(req, res, (err) => {
        assert.equal(error, err);
        assert.equal(req.hooks.book, undefined);
        done();
      });
    });

    it('All arguments params includes dont match', (done) => {
      Model.includes = {
        user: {
          model: User,
          as: 'creator',
          required: true,
        },
      };

      const helper = getter(Model, 'book');
      const req = {
        hooks: {},
        params: { id: 20, includes: 'author' },
      };
      const res = {};
      const error = Error('Find book error');

      Model.find = (opts) => {
        assert.deepEqual({ where: { id: 20 } }, opts);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      };

      helper(req, res, (err) => {
        assert.equal(error, err);
        assert.equal(req.hooks.book, undefined);
        done();
      });
    });
  });
});
