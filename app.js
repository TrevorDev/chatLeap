/* Stat vars */
var userOnlineCount = 0;

/*NODE JS modules*/
var express = require('express');
var ejs = require('ejs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });

/*CUSTOM modules*/
var rek = require('rekuire');
var routes = rek('routes.js');
//var db = rek('database.js');
//db.connect();

/*setup ejs with views folder*/
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.cookieParser('smashbros1'));
app.use(express.cookieSession());

//app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());

app.use(app.router);


/*static requests*/
app.get('/public/*', function(req, res, next){
    express.static(__dirname)(req, res, function(){next('route')});
});

routes.init(app);

server.listen(3001);

io.sockets.on('connection', function (socket) {
  userOnlineCount++;
  socket.userName='Guest'+Math.floor(Math.random()*100000);
  socket.emit('news', { hello: "worlds" });
  io.sockets.emit('updateUsersOnline', { userOnlineCount: userOnlineCount });

  socket.on('message', function (data) {
  	data.userName=socket.userName;
    socket.broadcast.to(data.room).emit('message', data);
  });

  socket.on('joinRoom', function (data) {
  	socket.join(data.room);
  	socket.broadcast.to(data.room).emit('userJoinedRoom', { room: data.room, userName: socket.userName });
  });

  socket.on('disconnect', function () {
    userOnlineCount--;
    io.sockets.emit('updateUsersOnline', { userOnlineCount: userOnlineCount });
  });
});

console.log("Started----------------------");
