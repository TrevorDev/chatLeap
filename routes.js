var rek = require('rekuire');
var home = rek('home.js');
var innerPages = rek('innerPages.js');

exports.init = function(app){
	app.get('/innerPages/:pageToLoad', innerPages.show);
	app.get('/*', home.show);
}
