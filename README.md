# enx
It is like dotenv and dot-env, but with the best of both and more features.

> 🆘 **Help** this project by conttributing to its documentation or developing its roadmap.

## Features

- [x] Multi-environment merging (`NODE_ENV` support)
- [x] Custom file path
- [x] Object-oriented variables instead just strings
- [X] `.env` portability
- [X] Execution of JS modules
- [X] `process.env` variable injection
- [X] `process.env` destructuring to config object
- [X] Vue.js support with [enx-vue-cli-plugin](https://github.com/NOALVO/enx-vue-cli-plugin)
- [ ] Webpack plugin

*Not checked features are in roadmap.

## You can start a progressive migration from dot-env right now using enx!

Just change your `require('dotenv').config()` to `require('@enx/env')()` and start later to add some powerful enx features!

For more details, refer to the [`.env` portability section](#-env-portability).

## Basic Usage

First of all, define your variables file in `.env.json` or any [supported file type](#enx-file-types-precedence):

```json
{
  "myconfig": "value"
}
```

Then, follow the steps below for using it in front-end or in back-end.

> i We added front-end support just for Vue.js for now. If you use another framework, just require enx at your webpack configuration file and export it as a global variable using DefinePlugin. If you think this is too hard, help us developing an Webpack Plugin!

### In front-end 🖼️

Install it as a devDependency via package manager

```
$ npm i -D @enx/vue-cli-plugin-enx
```

Then fetch variables from enx inside any Vue or JS file as a global variable:

```javascript
const myvalue = enx.value;
```

See other considerations for Vue in [enx Vue CLI plugin README](https://github.com/NOALVO/enx-vue-cli-plugin/blob/master/README.md).

### In back-end ⚙

Install it via package manager

```
$ npm i -S @enx/env
```

Then, call enx in your app entry file
```javascript
const enx = require('@enx/env')();
```

Now you can fetch variables from enx itself or `global` variable
```javascript
const enx = require('@enx/env')();

const value = enx.myconfig;
```

or without requiring enx:
```javascript
const value = global.enx.myconfig;
```

## Enx file types precedence

1. `.env` files (see [`.env` portability](#-env-portability))
2. CommonJS modules exported in `.js` files (see [Execution of JS modules](#-execution-of-js-modules))
3. `.json` files

Prefer always to use `.env.json` files.

If you want to change the filename pattern, refer to `fileName` option in [Overriding load options](#Overriding-load-options).

## Advanced usage

### ⭐ Multiple environments

By default, enx will look for a `.env.json` file if the [environment name variable](#env-string) does not exist.

If it exists, it will be appended to `.env.json` file name.

For example, enx will look for a file named `.env.production` for an environment named "production".

#### Merging files

If there is both a `.env.json` file and a `.env.ENVIRONMENT.json` file, enx will merge both, but always with environment-scoped variables overriding the generic file.

### ⭐ `.env` portability

You can use your existent `.env` files with enx.

You just need them in your package folder, because that file type [takes precedence](#Enx-file-types-precedence) over `.env.json` files.

Also, **you don't need to replace `process.env` callings by enx** if you don't want to, because enx config object will be [injected normally in `process.env` variable](#-processenv-variable-injection).

### ⭐ Execution of JS modules

In a scenario you need computed config values, you can use a CommonJS module as your enx file, exporting the module as your config object.

Example:

`.env.js`
```javascript
module.exports = {
  value: computeValue()
};
```

Make sure you don't have any `.env` files alongside `.env.js` files, because `.env` files [takes precedence](#Enx-file-types-precedence) over JS files.

JS files also will override `.env.json` files because they [take precedence](#Enx-file-types-precedence).

### ⭐ `process.env` variable injection

By default, enx config object will be injected to `process.env` as key-value pairs.

Complex values are avaiable both as JSON strings and as path variables, for example, this config:

```json
{
  "config": true,
  "another": {
    "config": "yes",
    "array": ["1"]
  }
}
```

...produces a `process.env`:

```javascript
{
  config: 'true',
  another: '{"config":"yes","array":["1"]}',
  another_config: 'yes',
  another_array: '["1"]',
  another_array_0: '1'
}
```

So, in the end **you can access a config key `another.config` using both `enx.another.config` or `process.env.another_config`**.

---

> ℹ Runtime injected `process.env` variables is avaiable just in the script execution scope. This means that other running Node.js processes cannot access the same variables and, if you kill the process with injected variables, they will not be avaiable next execution. Also, enx config object is injected to `process.env` as key-value pairs because `process.env` just support key-value pairs.

> ℹ Enx config object is also injected to `globalVar.enx` as an object.

### ⭐ `process.env` destructuring to config object

By default, enx will destructure the `process.env` variable by transforming key-value pairs to objects.

For example, these two `process.env` variables:

```
AUTH_URL="http://url.com"
AUTH_KEY="secretkey"
```

...will be transformed to:

```javascript
{
  AUTH: {
    URL: 'http://url.com',
    KEY: 'secrectkey'
  }
}
```

...and will be avaiable through enx as:

```javascript
enx.AUTH.URL // → 'http://url.com'
enx.AUTH.KEY // → 'secrectkey'
```

> 🌝 It means, ironically, that `process.ENV.NODE_ENV` will be avaiable as `enx.NODE.ENV`

## Overriding load options

You can override enx default options passing an object with the options you want to customize:

```javascript
const enx = require('@enx/env')({ options });
```

These are the default enx options:

```javascript
{
  globalVar = global,
  fileName = '.env.${env}.json',
  env = process.env.NODE_ENV,
  cwd = process.cwd(),
  injectToProcess = true,
  injectProcessEnvToEnx = true,
  debug = false,
  logger = console.log
}
```

#### `globalVar` _string_
Global variable to inject variables. Defaults to Node.js `global` variable.

#### `fileName` _string_

Name of the variables file. `${env}` is a token that will be replaced by current application environment (`NODE_ENV` by default).

#### `env` _string_

Name of the environment variable that holds the environment name. Defaults to `NODE_ENV`.

#### `cwd` _string_

Folder containing the variables file. Defaults to `process.cwd()` (project root).

Example for a relative './config' folder: `enx({ cwd: './config' })`.

#### `injectToProcess` _boolean_

Whether if enx config object should be injected do global `process.env` variable. Defaults to `true`.

#### `injectProcessEnvToEnx` _boolean_

Whether if original `process.env` should be destructured and injected to enx config object. Defaults to `true`.

#### `debug` _boolean_

Flag to activate error and debug messages to a logger method.

#### `logger` _function_

Logger method to be used by logging messages if `debug` option is enabled. Defaults to `console.log`.
