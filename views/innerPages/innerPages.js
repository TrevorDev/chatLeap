exports.show = function(req, res){
  res.render('innerPages/'+req.params.pageToLoad+'/index',{}, function(err, html) {
  	res.render('innerPages/popularChatRooms/index');
  });
};