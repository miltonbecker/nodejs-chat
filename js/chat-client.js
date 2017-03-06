'use strict';
let socket;

let port = process.env.PORT || 8080;

let connect = (name) => {
    socket = io.connect('http://localhost:' + port);
    events();
    socket.emit('join', name);
};

let events = () => {
    socket.on('connect', function () {
        if (socket.connected) {
            enterChat();
        }
    });

    socket.on('welcome', function (data) {
        $('#welcome').text(data);
    });

    socket.on('message', function (data) {
        $('#chat').append(data + '&#xA;');
    });
};

let sendMessage = (message) => {
    socket.emit('message', message);
};

$('form#form-connect').submit(function (event) {
    event.preventDefault();

    let name = $('#name').val().trim();
    if (!name.length) {
        $('#connect-error').text('Pick a name!');
        $('#connect-error').fadeIn('fast');
        return;
    }
            
    $('#connect-button').prop('disabled', true);
    connect(name);
});

$('form#form-message').submit(function (event) {
    event.preventDefault();

    let message = $('#message').val();
    sendMessage(message);
    $('#message').val('');
});

let enterChat = () => {
    $('#chat-connect').hide();
    $('#chat-room').fadeIn('fast');
};
