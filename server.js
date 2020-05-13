var http = require('http'); 
var queryString = require('querystring'); 
var fs =  require('fs'); 
var template = require('es6-template-strings'); 

var contacts = []; 

var server = http.createServer(); 

var simpleRouter = function(request) {
  var method = request.method;
  var path = request.url;

  // Strip the query from the ? character
  var queryIndex = request.url.indexOf('?');
  if (queryIndex >= 0) {
    path = request.url.slice(0, queryIndex)
  }

  var suppliedRoute = {method: method, path: path}
  var routes = [
    {method: 'GET', path: '/', handler: handleFormGet},
    {method: 'POST', path: '/', handler: handleFormPost}
  ];

  // Match the supplied route with the route visited and call the respective handler
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if ( route.method === suppliedRoute.method &&
      route.path === suppliedRoute.path ) {
      return route.handler;
    }
  }
  return null;
}

// A function to handle the GET Requests
var handleFormGet = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  fs.readFile('./templates/login.html', 'utf8', function(err, data) {
    if (err) { throw err; }
    response.write(data);
    response.end();
  });
}

// A function to handle the POST Requests
var handleFormPost = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  var payload = '';

  request.on('data', function (data) {
    payload += data;
  });

  request.on('end', function () {
    var post = queryString.parse(payload);
    contacts.push(post['username']);
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('./templates/chat.html', 'utf8', function(err, data) {
      if (err) { throw err; }
      var compiled = template(data, {username: post['username'], userList: contacts.join(",")});
      response.write(compiled);
      response.end();
    });
  });
}


// Call the 'on' method on the server to handle the incoming request
server.on("request", function(request, response) {
  var handler = simpleRouter(request);
  if (handler != null) {
    handler(request, response);
  } else {
    response.writeHead(404);
    response.end();
  }
})

server.listen(8080, function() {
  // Console Log this to indicate where the server started.
  console.log('Listening on port 8080...')
});