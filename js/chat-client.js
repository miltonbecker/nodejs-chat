'use strict';
let socket;

let port = 8080;
let hostname = location.hostname;
if (hostname !== 'localhost') {
    port = 80;
}
console.log('hostname: ' + hostname)

let connect = (name) => {
    if (port === 80) {
        socket = io.connect(`${hostname}`);
    } else {
        socket = io.connect(`${hostname}:${port}`);
    }
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
