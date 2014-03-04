// -- Firebase Initialization
var messages = new Firebase('https://super-best-buds-chat.firebaseIO.com/');

var username = '';
var loggedIn = false;

var getUsername = function () {
  $('.textbox').append('<p class="system-message">Please enter a username:</p>');
  submitPost();
}

var submitPost = function () {
  $('.input').on('submit', function (evt) {
    evt.preventDefault();

    var text = $('input-text').val();

    if (username === '') {
      getUsername();
    } else {
      users.push({name: username});
      messages.push({username: username, message: text});
    }
  });
}

$(document).ready(function(){
  getUsername();
});