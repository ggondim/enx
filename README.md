# arx
It is like dotenv and dot-env, but with the best of both and more features.

> 🆘 **Help** this project by conttributing to its documentation or developing its roadmap.

## Features

- [x] Config file is a JSON
- [x] Multi-environment merging (`NODE_ENV` support)
- [x] Custom file path
- [x] Object-oriented variables instead just strings
- [ ] Front-end support with webpack
- [ ] `.env` portability
- [ ] Execution of JS files

*Not checked features are in roadmap.

## Basic Usage

### 1. Install it via package manager

```
$ npm i --S @arx/env
```

### 2. Define your variables file

`.env.json` 

```json
{
  "myconfig": "value"
}
```

### 3. Call arx in your app entry file
```javascript
const arx = require('@arx/env')();
```

### 4. Fetch variables from arx itself or `global` variable
```javascript
const arx = require('@arx/env')();

const value = arx.myconfig;
```

or
```javascript
const value = global.arx.myconfig;
```

## Advanced usage

### ⭐ Multiple environments

By default, arx will look for a `.env.json` file if the [environment name variable](#env-string) does not exist.

If it exists, it will be appended to `.env.json` file name.

For example, arx will look for a file named `.env.production` for an environment named "production".

#### Merging files

If there is both a `.env.json` file and a `.env.ENVIRONMENT.json` file, arx will merge both, but always with environment-scoped variables overriding the generic file.

## Overriding load options

You can override arx default options passing an object with the options you want to customize:

```javascript
const arx = require('@arx/env')({ options });
```

These are the default arx options:

```javascript
{
  globalVar = global,
  fileName = '.env.${env}.json',
  env = process.env.NODE_ENV,
  cwd = process.cwd(),
  debug = false
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

Example for a relative './config' folder: `arx({ cwd: './config' })`.

#### `debug` _boolean_

Flag to activate error and debug messages to the console.
