var socket = io.connect(SOCKET_IO_ADDRESS);
socket.currentRoom = "";

//start in global room
socket.currentRoom = "global";
socket.emit('joinRoom', { room: socket.currentRoom });

function MessageCtrl($scope) {
    $scope.messages = [];
    $scope.userOnlineCount = 1;
    $scope.joinGlobal = function(){
        socket.currentRoom = "global";
        socket.emit('joinRoom', { room: socket.currentRoom });
    };

    $scope.addMessage = function(message) {
        if(message){
            $scope.messages.push({text:message.text, userName:message.userName, otherUser:true});
        }else{
            if($scope.messageText!=""){
                socket.emit('message', { room: socket.currentRoom, text: $scope.messageText});
                $scope.messages.push({text:$scope.messageText, userName:"You", otherUser:false});
                $scope.messageText = '';
            }
        }
        //IS THERE A BETTER WAY TO GET THIS TO HAPPEN AFTER ANGULAR UPDATES?????
        setTimeout(function(){
            $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
        }, 0);
    };

    socket.on('message', function (data) {
        $scope.addMessage(data);
        $scope.$apply();
    });

    socket.on('updateUsersOnline', function (data) {
        $scope.userOnlineCount = (data.userOnlineCount);
        $scope.$apply();
    });


    socket.on('news', function (data) {
        console.log(data);
    });

    socket.on('userJoinedRoom', function (data) {
        console.log(data);
    });
}