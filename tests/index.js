// console.log(process.env);

process.env.AUTH0_URL = 'url'
process.env.AUTH0_CLIENTID = 'clientid'

const enx = require('../index')();

console.log(enx)

// console.log(process.env);