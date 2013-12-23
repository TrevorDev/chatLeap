angular.module('chatLeap', [], function($compileProvider) {
  // configure new 'compile' directive by passing a directive
  // factory function. The factory function injects the '$compile'
  $compileProvider.directive('compile', function($compile) {
    // directive factory creates a link function
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
           // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);
          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  })
});

var socket = io.connect(SOCKET_IO_ADDRESS);

//CONTROLLER
function MessageCtrl($scope) {

    $scope.session = {};
    $scope.session.userName = "";

    $scope.nonChatWebpage = "";
    $scope.innerPage = "";

    $scope.userOnlineCount = 1;
    $scope.rooms = {};
    $scope.currentRoom = {};

    $scope.showInnerPage = function(pageLink) {
        $.get( pageLink, function( data ) {
            $scope.innerPage = data;
            $scope.nonChatWebpage = pageLink;
            $scope.$apply();
        });
    }

    $scope.joinRoom = function(roomName) {
        if(roomName){
            socket.emit('joinRoom', { room: roomName.replace(/_/g," ") }); 
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
        if(Object.keys($scope.rooms).length <= 0){
            
            $scope.showInnerPage('/innerPages/popularChatRooms');
        }
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
        $scope.nonChatWebpage="";
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