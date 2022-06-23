const registrate = require('./controllers/createNewUser');
const authorizate = require('./controllers/authorizateUser');
const http = require('http');
const url = require('url');
const cors = require('cors');



http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Request-Method', '*');
  response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  response.setHeader('Access-Control-Allow-Headers', '*');


  let urlParts = url.parse(request.url, true)
  if (request.method === 'POST') {
    switch (urlParts.pathname) {
      case "/signup": {
        registrate(request, response);
        break;
      }
      case "/login": {
        authorizate(request, response);
        break;
      }
    }
  }
}).listen(4000);


