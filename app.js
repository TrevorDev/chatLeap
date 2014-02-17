/*NODE JS modules*/
var express = require('express');
var ejs = require('ejs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });

/*CUSTOM modules*/
var rek = require('rekuire');
var routes = rek('routes.js');
var socketHelper = rek('socketHelper.js');
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

var users = {};
var banned = {};

var resetUserSpam = function(){
  users = {};
  setTimeout(resetUserSpam,5000);
}
resetUserSpam();


io.sockets.on('connection', function (socket) {
  //INITIALIZE CONNECTION
  socketHelper.init(socket);
  socket.emit('connected',{ userName: socket.userName });
  io.sockets.emit('updateUsersOnline', { userOnlineCount: socketHelper.getUserOnlineCount() });

  //ROUTES
  socket.on('message', function (data) {
  	data.userName=socket.userName;
    if(users[socket.handshake.address.address]){
      users[socket.handshake.address.address]++;
    }else{
      users[socket.handshake.address.address]=1;
    }
    if(users[socket.handshake.address.address] < 10 && !banned[socket.handshake.address.address]){
      socket.broadcast.to(data.room).emit('message', data);
    }else{
      banned[socket.handshake.address.address] = 1;
    }
  });

  socket.on('joinRoom', function (data) {
  	socket.join(data.room);
  	socket.broadcast.to(data.room).emit('userJoinedRoom', { roomName: data.room, userName: socket.userName, id: socket.id });

    var socketsInRoom = io.sockets.clients(data.room);
    var usersInRoom = {};
    for (var i =0;i<socketsInRoom.length;i++){
      usersInRoom[socketsInRoom[i].id]=socketsInRoom[i].userName;
    }

    socket.emit('connectedToRoom', { name: data.room,users:usersInRoom });
  });

  socket.on('changeName', function (data) {
    socket.userName = data.userName;
    var rooms = io.sockets.manager.roomClients[socket.id];
    for(var key in rooms){
      if(key!=""){
        var roomName = key.substring(1);
        io.sockets.in(roomName).emit('changeName', { roomName: roomName, userID: socket.id, userName:socket.userName });
      }
    }
  });

  socket.on('leaveRoom', function (data) {
    var roomName = data.roomName;
    socket.broadcast.to(roomName).emit('userLeftRoom', { userID: socket.id, roomName:roomName });
  });

  socket.on('disconnect', function () {
    var rooms = io.sockets.manager.roomClients[socket.id];
    for(var key in rooms){
      if(key!=""){
        var roomName = key.substring(1);
        socket.broadcast.to(roomName).emit('userLeftRoom', { userID: socket.id, roomName:roomName });
      }
    }
    socketHelper.destroy(socket);
    io.sockets.emit('updateUsersOnline', { userOnlineCount: socketHelper.getUserOnlineCount() });
  });
});

console.log("Started----------------------");
