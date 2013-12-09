var socket = io.connect('http://localhost');
socket.currentRoom = "";

function MessageCtrl($scope) {
    $scope.messages = [];

    $scope.joinGlobal = function(){
        socket.currentRoom = "global";
        socket.emit('joinRoom', { room: socket.currentRoom });
    };

    $scope.addMessage = function(message) {
        if(message){
            $scope.messages.push({text:message.text, userName:"Other", otherUser:true});
        }else{
            if($scope.messageText!=""){
            socket.emit('message', { room: socket.currentRoom, text: $scope.messageText});
            $scope.messages.push({text:$scope.messageText, userName:"You", otherUser:false});
            $scope.messageText = '';
            }
        }
    };

    socket.on('message', function (data) {
        $scope.addMessage(data);
        $scope.$apply();
    });

    socket.on('news', function (data) {
        console.log(data);
    });

    socket.on('userJoinedRoom', function (data) {
        console.log(data);
    });
}