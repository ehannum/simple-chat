// -- Firebase Initialization
var messages = new Firebase('https://super-best-buds-chat.firebaseIO.com/');

$(document).ready(function(){
  $('.input').on('submit', function (evt) {
    evt.preventDefault();
    var text = $('').val();
  });
});