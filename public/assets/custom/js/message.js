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

    $scope.userOnlineCount = 1;

    $scope.rooms = {};
    $scope.currentRoom = {};

    $scope.addMessage = function(message) {
        if(message){
            $scope.currentRoom.messages.push({text:message.text, userName:message.userName, otherUser:true});
        }else{
            if($scope.messageText!=""){
                socket.emit('message', { room: socket.currentRoom, text: $scope.messageText});
                $scope.currentRoom.messages.push({text:$scope.messageText, userName:"You", otherUser:false});
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
            console.log("sent");
        },
        delay: 400
    });

    //SOCKET HANDLER
    socket.on('message', function (data) {
        $scope.addMessage(data);
        $scope.$apply();
    });

    socket.on('assignedUserName', function (data) {
        $scope.guestAlias = data.userName;
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


    socket.on('news', function (data) {
        console.log(data);
    });

    socket.on('userJoinedRoom', function (data) {
        $scope.currentRoom.users[data.id]=data.userName;
        $scope.$apply();
    });

    socket.on('userLeftRoom', function (data) {
        delete $scope.rooms[data.roomName].users[data.userID];
        $scope.$apply();
    });

    //CTRL MAIN
    socket.emit('joinRoom', { room: "global" });
}