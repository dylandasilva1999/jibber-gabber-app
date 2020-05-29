const http = require('http'); 
const queryString = require('querystring'); 
var fs =  require('fs'); 
const template = require('es6-template-strings');
const static = require('node-static') 

var loginUsers = [];

var databaseOfUser = [
  {
    username: "Dylan",
    password: 123
  }
]

const fileServer = new static.Server('./public');

const server = http.createServer((request, response) => {
  request.addListener('end', function () {
    fileServer.serve(request, response, function (e, res) {
      if (e && (e.status === 404)) { // If the file wasn't found
        //fileServer.serveFile('/not-found.html', 404, {}, request, response);
      }
    });
  }).resume();
});

var io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    io.emit('clientConnected', 'You have connected to the chat server');

    socket.on('chatroom', (msg) => {
      console.log(`This was a message from chatroom: ${msg}`);
    });
  
    socket.on('disconnect', () => {
      io.emit('user disconnected');
    });
})

var simpleRouter = function(request) {
  var method = request.method;
  var path = request.url;

  var queryIndex = request.url.indexOf('?');
  if (queryIndex >= 0) {
    path = request.url.slice(0, queryIndex)
  }

  var suppliedRoute = {method: method, path: path}
  var routes = [
    {method: 'GET', path: '/', handler: handleFormGet},
    {method: 'POST', path: '/', handler: handleFormPost}
  ];

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if ( route.method === suppliedRoute.method &&
      route.path === suppliedRoute.path ) {
      return route.handler;
    }
  }
  return null;
}

var handleFormGet = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  fs.readFile('./public/login.html', 'utf8', function(err, data) {
    if (err) { throw err; }
    response.write(data);
    response.end();
  });
}

var handleFormPost = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  var payload = '';

  request.on('data', function (data) {
    payload += data;
  });

  request.on('end', function () {
    var post = queryString.parse(payload);
    loginUsers.push(post['username']);
    
    for(dbUser of database){
      if(dbUser.username === user.username && dbUser.password === user.password) {
        response.writeHead(200, {"Content-Type": "text/html"});
        fs.readFile('./public/chat.html', 'utf8', function(err, data) {
          if (err) { throw err; }
          var values = {
            username: post['username'],
            loggedUsers: listLoginUsers(loginUsers)
          }
          var compiled = template(data, values);
          response.write(compiled);
          response.end();
        });
      }
      response.writeHead(200, {"Content-Type": "text/html"});
        fs.readFile('./public/404.html', 'utf8', function(err, data) {
          if (err) { throw err; }
          var values = {
            username: post['username'],
            loggedUsers: listLoginUsers(loginUsers)
          }
          var compiled = template(data, values);
          response.write(compiled);
          response.end();
        });
    };
  })
}  

const listLoginUsers = (loggedUsers) => {
  //return loggedUsers.map(user => `<li>${user.username}</li>`)
  var list = '';
  for (user in loggedUsers) {
    list += 
      `<li>
        <h4>${user.username}</h4>
        </li>`
  }
  return list
}

server.on("request", function (request, response) {
  var handler = simpleRouter(request);
  if (handler != null) {
    console.log('handler')
    handler(request, response);
  } else {
    // console.log('404 handler')
    // response.writeHead(404);
    // response.end();
  }
})

server.listen(8080, function() {
  console.log('Listening on port 8080...')
});