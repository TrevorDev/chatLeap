var userOnlineCount = 0;
var visitCount = 0;

exports.init = function(socket){
	visitCount++;
	userOnlineCount++;
	socket.userName='Guest'+Math.floor(Math.random()*10000);
}

exports.destroy = function(socket){
	userOnlineCount--;
}

exports.getUserOnlineCount = function(){
	return userOnlineCount;
}