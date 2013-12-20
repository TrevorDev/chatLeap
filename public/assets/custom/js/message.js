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

function MessagePeice(type,value) {
        this.type=type;
        this.value=value;
    }

function linkify(inputText) {
    if(!inputText){
        return [];
    }
    var messagePeices = [];
    var websitePattern = /[^\s\"<>]+\.[^\s\"<>]+(\b|$)/gim;
    var matches = inputText.match(websitePattern);
    if(!matches){
        messagePeices.push(new MessagePeice("text",inputText));
    }else{
        var last = 0;
        for(var i = 0;i<matches.length;i++){
            var start = inputText.indexOf(matches[i]);
            var end = start+matches[i].length;
            linkText = matches[i].replace("http://","").replace("https://","");
            messagePeices.push(new MessagePeice("text",inputText.substring(last,start)));
            messagePeices.push(new MessagePeice("link",linkText));
            last=end;
        }
        messagePeices.push(new MessagePeice("text",inputText.substring(last)));
    }
    return messagePeices;
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
        setTimeout(function(){
            $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
        }, 0);
    }

    $scope.addMessage = function(message) {
        if(message){
            n = new Notification( "New Messages");
            $scope.rooms[message.room].messages.push({text:linkify(message.text), userName:message.userName, otherUser:true});
        }else{
            if($scope.messageText!=""){
                socket.emit('message', { room: $scope.currentRoom.name, text: $scope.messageText});
                $scope.currentRoom.messages.push({text:linkify($scope.messageText), userName:$scope.session.userName, otherUser:false});
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
        $scope.currentRoom = $scope.rooms[data.name];
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