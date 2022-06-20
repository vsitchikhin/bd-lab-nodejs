const createNewUser = require('./registration')
const http = require('http');
const url = require('url');
const cors = require('cors')


http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  response.setHeader('Access-Control-Allow-Headers', '*');

  let urlParts = url.parse(request.url, true)
  if (request.method === 'GET') {
    response.end('Hello');
  } else if (request.method === 'POST') {
    switch (urlParts.pathname) {
      case "/signup": {
        createNewUser(request, response)
      }
    }
  }
}).listen(4000);


