const fs = require('fs');
const path = require('path');

module.exports = load;

function log(debug, message, { prefix } = {}) {
  if (debug) {
    if (typeof message === "object") message = JSON.stringify(message);
    console.log(`${prefix}: ${message}`);
  }
}

function parseArxFile(filePath, { debug }) {
  let parsed = {};
  try {
    const file = fs.readFileSync(filePath);
    parsed = JSON.parse(file);
  } catch (e) {
    log(debug, e, { prefix: `error in parseArxFile(${filePath})` });
  }
  return parsed;
}

function override(source, target) {
  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      source[key] = target[key];
    }
  }
  return source;
}

function load({
  globalVar = global,
  fileName = '.env.${env}.json',
  env = process.env.NODE_ENV,
  cwd = process.cwd(),
  debug = false
} = {}) {
  if (globalVar && globalVar.arx) {
    log(debug, 'arx alread loaded');
    return globalVar.asx;
  }

  let vars = parseArxFile(path.resolve(cwd, fileName.replace('.${env}', '')), { debug });
  log(debug, vars, { prefix: 'vars' });

  const envVars = parseArxFile(path.resolve(cwd, fileName.replace('${env}', env)), { debug });
  log(debug, envVars, { prefix: 'envVars' });
  
  log(debug, vars, { prefix: 'vars' });
  globalVar.arx = override(vars, envVars);

  return globalVar.arx;
}