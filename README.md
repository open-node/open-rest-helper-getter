# open-rest-helper-getter

Controller helper getter for open-rest or restify, Used to get instance from Model

[![Build status](https://api.travis-ci.org/open-node/open-rest-helper-getter.svg?branch=master)](https://travis-ci.org/open-node/open-rest-helper-getter)
[![codecov](https://codecov.io/gh/open-node/open-rest-helper-getter/branch/master/graph/badge.svg)](https://codecov.io/gh/open-node/open-rest-helper-getter)

# Usage

```bash
npm instsall open-rest-helper-getter --save
```

```js
var getter = require('open-rest-helper-getter');

getter(Model, 'book', 'id', 'obj');

// return
// function(req, res, next) { ... };

//or
//getter.Model(Model).hook('book').id('id').obj('user').exec();
```
