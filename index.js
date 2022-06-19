const createNewUser = require('./registration')
const http = require('http');
const url = require('url');


http.createServer((request, response) => {
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


