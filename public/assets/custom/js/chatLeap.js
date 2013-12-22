var socket = io.connect(SOCKET_IO_ADDRESS);

//CONTROLLER
function MessageCtrl($scope) {

    $scope.session = {};
    $scope.session.userName = "";
    $scope.nonChatWebpage = "";

    $scope.userOnlineCount = 1;
    $scope.rooms = {};
    $scope.currentRoom = {};

    $scope.joinRoom = function(roomName) {
        if(roomName){

        }else{
           socket.emit('joinRoom', { room: $scope.roomToJoin }); 
        }
    }

    $scope.closeRoom = function(roomName) {
        socket.emit('leaveRoom', { roomName: roomName });
        if($scope.currentRoom.name==roomName){
            for (var key in $scope.rooms){
                if(key!=roomName){
                    $scope.currentRoom=$scope.rooms[key];
                    break;
                }
            }
        }
        delete $scope.rooms[roomName];
    }
    $scope.scrollToChatBottom = function(){
        //IS THERE A BETTER WAY TO GET THIS TO HAPPEN AFTER ANGULAR UPDATES?????
        setTimeout(function(){
            if($("#chat-window")[0]){
                $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
            }
        }, 0);
    }
    $scope.changeRoom = function(roomName) {
        $scope.currentRoom = $scope.rooms[roomName];
        window.history.pushState("roomName", "Chat Leap", "/openRoom/"+roomName.replace(/\s/g,"_"));
        $scope.scrollToChatBottom();
    }

    $scope.addMessage = function(message) {
        if(message){
            n = new Notification( "New Messages");
            $scope.rooms[message.room].messages.push({text:linkify(message.text), userName:message.userName, otherUser:true});
        }else{
            console.log('hit');
            if($scope.messageText!=""){
                console.log('hit');
                socket.emit('message', { room: $scope.currentRoom.name, text: $scope.messageText});
                $scope.currentRoom.messages.push({text:linkify($scope.messageText), userName:$scope.session.userName, otherUser:false});
                $scope.messageText = '';
            }
        }
        $scope.scrollToChatBottom();
    };


    //JQUERY
    $('#guestAlias').typing({
        //TODO: make this work on mobile
        stop: function (event, $elem) {
            $scope.session.userName = $elem.val();
            socket.emit('changeName', { userName: $scope.session.userName });
        },
        delay: 400
    });

    //SOCKET HANDLER
    socket.on('connected', function () {
        for(var room in $scope.rooms){
            socket.emit('joinRoom', { room: room });
        }
        socket.emit('changeName', { userName: $scope.session.userName });
        var urlRoomMatch = window.location.pathname.match(/openRoom\/(.*)/)
        if(urlRoomMatch){
            socket.emit('joinRoom', { room: urlRoomMatch[1].replace(/_/g," ") });
        }
    });

    socket.on('assignedUserName', function (data) {
        //dont get new name if d/c occurs
        if(!$scope.session.userName){
            $scope.session.userName = data.userName;
            //maybe dont need guestAlias???
            $scope.guestAlias = $scope.session.userName;
            $scope.$apply();
        }
    });

    socket.on('message', function (data) {
        $scope.addMessage(data);
        $scope.$apply();
    });

    socket.on('updateUsersOnline', function (data) {
        $scope.userOnlineCount = (data.userOnlineCount);
        $scope.$apply();
    });

    socket.on('connectedToRoom', function (data) {
        //CHECK IF ROOM EXISTS
        if(!$scope.rooms[data.name]){
            $scope.rooms[data.name] = new Room(data.name,data.messages,data.users);
        }else{
            $scope.rooms[data.name] = new Room(data.name,$scope.rooms[data.name].messages,data.users);
        }
        $scope.changeRoom(data.name);
        $scope.$apply();
    });

    socket.on('changeName', function (data) {
        $scope.rooms[data.roomName].users[data.userID] = data.userName;
        $scope.$apply();
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