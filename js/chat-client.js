'use strict';
let socket;

let hostname = 'localhost';
let port = 80;
if (port != 8080) {
    hostname = 'young-wildwood-53498.herokuapp.com';
}


let connect = (name) => {
    socket = io.connect(`${hostname}`);
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
    $('#chat-room').fadeIn();
};
