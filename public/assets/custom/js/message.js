var uploadLocation = '/uploads';

function updateMessageList(){
    var participantID = 1; // TODO: get this from somewhere
    $.ajax({
    type: "GET",
    /*url: 'http://131.104.48.208/message/' + participantID,*/
    url: '/message/' + participantID,
    success: function(data) {
      if (data != 'failed'){
        for (var i = 0; i < data.length; i++){
          var template = '<div class="message right"><div class="well bubble">';
          template = template + '<h3>New recording</h3>';
          template = template + '<p><a href="' + data[i].path + '"><img src="/public/assets/custom/img/mp3.png" /></a></p></div></div>';
          $('#autoMessageArea').append(template);
        }
      } else {
        console.log("ERROR: " + data);
      }
    },
        error: onError
    });
    return false;
}

function onError(){
  console.log("ERROR");
}