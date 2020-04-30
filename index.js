const fs = require('fs');
const path = require('path');

const DEFAULT_FILENAME = '.env.${env}.json';

module.exports = load;

function log(debug, message, { prefix } = {}) {
  if (debug) {
    if (typeof message === "object") message = JSON.stringify(message);
    console.log(`${prefix}: ${message}`);
  }
}

function requireJsFile(filePath, { debug }) {
  const absolute = path.resolve(filePath);
  let required = {};
  try {
    required = require(absolute);
    const type = typeof required;
    if (type !== 'object') {
      throw new Error(`required file does not exports an object (returned: ${type})`);
    }
  } catch (error) {
    log(debug, error, { prefix: `error in requireJsFile(${filePath})` });
  }
  return required;
}

function parseJsonFile(filePath, { debug }) {
  let parsed = {};
  try {
    const file = fs.readFileSync(filePath);
    parsed = JSON.parse(file);
  } catch (e) {
    log(debug, e, { prefix: `error in parseJsonFile(${filePath})` });
  }
  return parsed;
}

// adapted from https://github.com/motdotla/dotenv/blob/master/lib/main.js
function parseDotEnvFile(filePath, { debug }) {
  const obj = {};
  let src = '';
  try {
    src = fs.readFileSync(filePath);
  } catch (e) {
    log(debug, e, { prefix: `error in parseDotEnvFile(${filePath})` });
    return obj;
  }

  const NEWLINE = '\n';
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
  const RE_NEWLINES = /\\n/g;
  const NEWLINES_MATCH = /\n|\r|\r\n/;

  // convert Buffers before splitting into lines and processing
  src.toString().split(NEWLINES_MATCH).forEach(function (line, idx) {
    // matching "KEY' and 'VAL' in 'KEY=VAL'
    const keyValueArr = line.match(RE_INI_KEY_VAL)
    // matched?
    if (keyValueArr != null) {
      const key = keyValueArr[1]
      // default undefined or missing values to empty string
      let val = (keyValueArr[2] || '')
      const end = val.length - 1
      const isDoubleQuoted = val[0] === '"' && val[end] === '"'
      const isSingleQuoted = val[0] === "'" && val[end] === "'"

      // if single or double quoted, remove quotes
      if (isSingleQuoted || isDoubleQuoted) {
        val = val.substring(1, end)

        // if double quoted, expand newlines
        if (isDoubleQuoted) {
          val = val.replace(RE_NEWLINES, NEWLINE)
        }
      } else {
        // remove surrounding whitespace
        val = val.trim()
      }

      obj[key] = val
    } else if (debug) {
      log(debug, `did not match key and value when parsing line ${idx + 1}: ${line}`, `parseDotEnvFile`);
    }
  });

  return obj
}

function getConfigFile(filePath, {debug}) {
  const slash = filePath.indexOf('/') !== -1 ? '/' : '\\';
  const slashSplit = filePath.split(slash);
  const fileName = slashSplit[slashSplit.length - 1];

  if (filePath.endsWith('.json')) {
    return parseJsonFile(filePath, { debug });
  } else if (filePath.endsWith('.js')) {
    return requireJsFile(filePath, { debug });
  } else if (fileName.startsWith('.env')) {
    return parseDotEnvFile(filePath, { debug });
  } else {
    throw new Error(`file type not supported: path(${filePath})`);
  }
}

function override(source, target) {
  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      source[key] = target[key];
    }
  }
  return source;
}

function getAllConfigFiletypes(jsonPath, { debug }) {
  const envPath = jsonPath.replace('.json', '');
  const jsPath = jsonPath.replace('.json', '.js');

  if (fs.existsSync(envPath)) {
    return getConfigFile(envPath, { debug });
  } else if (fs.existsSync(jsPath)) {
    return getConfigFile(jsPath, { debug });
  }
  return getConfigFile(jsonPath, { debug });
}

function objToVars(obj, prevKey) {
  let vars = {};
  for (const key in obj) {
    const element = obj[key];
    const varName = prevKey ? `${prevKey}_${key}` : key;
    if (typeof element === 'object') {
      vars[varName] = JSON.stringify(element);
      vars = { ...vars, ...objToVars(element, varName) };
    } else {
      vars[varName] = element;
    }
  }
  return vars;
}

function injectToProcessEnv(config) {
  const vars = objToVars(config);
  Object.keys(vars).forEach(k => process.env[k] = vars[k]);
}

function load({
  globalVar = global,
  fileName = DEFAULT_FILENAME,
  env = process.env.NODE_ENV,
  cwd = process.cwd(),
  injectToProcess = true,
  debug = false
} = {}) {
  if (globalVar && globalVar.enx) {
    log(debug, 'enx already loaded');
    return globalVar.global;
  }

  const getFileFn = fileName === DEFAULT_FILENAME ? getAllConfigFiletypes : getConfigFile;

  const generalFilePath = path.resolve(cwd, fileName.replace('.${env}', ''));
  const vars = getFileFn(generalFilePath, { debug });
  log(debug, vars, { prefix: 'vars' });

  const currentEnvFilePath = path.resolve(fileName.replace('${env}', env));
  const envVars = getFileFn(currentEnvFilePath, { debug });
  log(debug, envVars, { prefix: 'envVars' });

  globalVar.enx = override(vars, envVars);

  if (injectToProcess) injectToProcessEnv(globalVar.enx);

  return globalVar.enx;
}