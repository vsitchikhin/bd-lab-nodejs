const createNewUser = require('./registration');
const autherisateUser = require('./autherisation');
const http = require('http');
const url = require('url');
const cors = require('cors');


http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  response.setHeader('Access-Control-Allow-Headers', '*');

  let urlParts = url.parse(request.url, true)
  if (request.method === 'GET') {
    switch (urlParts.pathname) {
      case "/login": {
        const email = urlParts.query.email;
        const password = urlParts.query.password

        autherisateUser(request, response, email, password);
        break;
      }
    }
  } else if (request.method === 'POST') {
    switch (urlParts.pathname) {
      case "/signup": {
        createNewUser(request, response);
        break;
      }
    }
  }
}).listen(4000);


