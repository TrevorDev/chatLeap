function pick(arg, def) {
   return (typeof arg == 'undefined' ? def : arg);
}

var socket = io.connect(SOCKET_IO_ADDRESS);

//OBJECT
function Room(name,messages,users) {
        this.name=pick(name,"");
        this.messages = pick(messages,[]);
        this.users = pick(users,{});
    }

//start in global room



//socket.currentRoom = new Room("global");
//socket.rooms[socket.currentRoom.name] = (socket.currentRoom);

//CONTROLLER
function MessageCtrl($scope) {

    $scope.session = {};
    $scope.session.userName = "";

    $scope.userOnlineCount = 1;
    $scope.rooms = {};
    $scope.currentRoom = {};

    $scope.changeRoom = function(roomName) {
        $scope.currentRoom = $scope.rooms[roomName];
    }

    $scope.addMessage = function(message) {
        if(message){
            n = new Notification( "New Messages");
            $scope.rooms[message.room].messages.push({text:message.text, userName:message.userName, otherUser:true});
        }else{
            if($scope.messageText!=""){
                socket.emit('message', { room: $scope.currentRoom.name, text: $scope.messageText});
                $scope.currentRoom.messages.push({text:$scope.messageText, userName:$scope.session.userName, otherUser:false});
                $scope.messageText = '';
            }
        }
        //IS THERE A BETTER WAY TO GET THIS TO HAPPEN AFTER ANGULAR UPDATES?????
        setTimeout(function(){
            $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
        }, 0);
    };


    //JQUERY
    $('#guestAlias').typing({
        stop: function (event, $elem) {
            $scope.session.userName = $elem.val();
            socket.emit('changeName', { userName: $scope.session.userName });
        },
        delay: 400
    });

    //SOCKET HANDLER
    socket.on('message', function (data) {
        $scope.addMessage(data);
        $scope.$apply();
    });

    socket.on('assignedUserName', function (data) {
        $scope.session.userName = data.userName;
        //maybe dont need guestAlias???
        $scope.guestAlias = $scope.session.userName;
        $scope.$apply();
    });

    socket.on('updateUsersOnline', function (data) {
        $scope.userOnlineCount = (data.userOnlineCount);
        $scope.$apply();
    });

    socket.on('connectedToRoom', function (data) {
        $scope.currentRoom = new Room(data.name,data.messages,data.users);
        $scope.rooms[$scope.currentRoom.name] = $scope.currentRoom;
        $scope.$apply();
    });

    socket.on('changeName', function (data) {
        $scope.rooms[data.roomName].users[data.userID] = data.userName;
        $scope.$apply();
    });

    socket.on('news', function (data) {
        console.log(data);
    });

    socket.on('userJoinedRoom', function (data) {
        $scope.rooms[data.roomName].users[data.id]=data.userName;
        $scope.$apply();
    });

    socket.on('userLeftRoom', function (data) {
        delete $scope.rooms[data.roomName].users[data.userID];
        $scope.$apply();
    });

    //CTRL MAIN
    socket.emit('joinRoom', { room: "ChatRoom 2" });
    socket.emit('joinRoom', { room: "ChatRoom 1" });
}