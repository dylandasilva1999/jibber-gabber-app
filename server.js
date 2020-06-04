const http = require('http'); 
const queryString = require('querystring'); 

var fs =  require('fs'); 
const template = require('es6-template-strings');

const static = require('node-static') 

var loginUsers = [];

var databaseOfUser = [
  {
    username: "Dylan",
  }
]

const fileServer = new static.Server('./public');

const server = http.createServer((request, response) => {

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
    {method: 'GET', path: '/', handler: handleLoginGet},
    {method: 'POST', path: '/login', handler: handleLoginPost},
    {method: 'GET', path: '/chat', handler: handleChatGet}
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

var handleLoginGet = function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  fs.readFile('./templates/login.html', 'utf8', function(err, data) {
    if (err) { throw err; }
    response.write(data);
    response.end();
  });
}

var handleChatGet = function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  fs.readFile('./templates/chat.html', 'utf8', function(err, data) {
    if (err) { throw err; }
    response.write(data);
    response.end();
  });
}

var handleLoginPost = function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  var payload = '';

  request.on('data', function (data) {
    payload += data;
  });

  request.on('end', function () {
    var post = queryString.parse(payload);
    
    var foundUser = false;
    var loggedIn = false;
    
    for(dbUser of databaseOfUser){
      if(dbUser.username === loginUsers.username) {
        foundUser = true;
        loginUsers.push(post['username']);
        loginUsers.forEach(u => {
          if (u.username === post.username) {
            loggedIn = true;
          }
        })
        response.writeHead(200, {'Content-Type': 'text/html'});
        fs.readFile('./templates/chat.html', 'utf8', function(err, data) {
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
    }
    if (!foundUser) {
      response.writeHead(404, {'Content-Type': 'text/html'});
       fs.readFile('./templates/404.html', 'utf8', function(err, data) {
        if (err) { throw err; }
        var values = {
          username: post['username'],
        }
        var compiled = template(data, values);
        response.write(compiled);
        response.end();
      });
    }
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
    handler(request, response);
  } else {
    fileServer.serve(request, response, function (e, res) {
      if (e && (e.status === 404)) { 
        fileServer.serveFile('../templates/404.html', 404, {}, request, response);
      }
    });
  }
})

server.listen(8080, function() {
  console.log('Listening on port 8080...')
});