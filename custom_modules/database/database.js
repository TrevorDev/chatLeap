var mysql = require('mysql');

var connection;
exports.connect = function() {
	connection = mysql.createConnection({
      user     : 'root',
      password : '',
      database : 'test',
      port:'3306',
	});
	connection.connect();
}

exports.disconnect = function() {
	connection.end();
}

exports.getConnection = function(){
	return connection;
}



