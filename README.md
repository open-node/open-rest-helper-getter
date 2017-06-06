# open-rest-helper-getter

open-rest 控制器 helper 插件，用来从 Model 从获取某个 Model 的实例

[![Build status](https://api.travis-ci.org/open-node/open-rest-helper-getter.svg?branch=master)](https://travis-ci.org/open-node/open-rest-helper-getter)
[![codecov](https://codecov.io/gh/open-node/open-rest-helper-getter/branch/master/graph/badge.svg)](https://codecov.io/gh/open-node/open-rest-helper-getter)

# Node version
<pre> >= 6 </pre>


# Usage

```bash
npm instsall open-rest-helper-getter --save
```

```js
const rest = require('open-rest');
const getter = require('open-rest-helper-getter')(rest);

// rest.helper.getter Equivalent to getter

// Model Sequlize Model的定义
// hook 获取到的实例存放地址
// keyPath 实例的 ID 获取路径, 从req上获取某个值的路径，例如: 'params.id', 'hooks.user.name', 分别代表读取 req.params.id, req.hooks.user.name
getter(Model, hook, keyPath);

// return
// function(req, res, next) { ... };

//or 链式调用
getter.Model(Model).hook('book').keyPath('params.user.id').exec();
```
