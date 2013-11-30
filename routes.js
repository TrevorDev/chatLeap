var rek = require('rekuire');
var home = rek('home.js');

exports.init = function(app){
	app.get('/*', home.show);
}
