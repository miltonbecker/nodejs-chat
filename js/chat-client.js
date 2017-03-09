'use strict';
let socket;

function init() {
    let port = 8080;
    let hostname = location.hostname;
    if (hostname.indexOf('herokuapp') !== -1) {
        port = 80;
    }

    if (port === 80) {
        socket = io.connect(`${hostname}`);
    } else {
        socket = io.connect(`${hostname}:${port}`);
    }

    events();
};

init();

function connect (name) {
    socket.emit('joinRequest', name);
};

function events () {
    socket.on('joinResponse', function (response) {
        if (response) {
            enterChat();
        } else {
            showError('That name is being used already. Please, choose another one.')
            $('#connect-button').prop('disabled', false);
        }
    });

    socket.on('welcome', function (data) {
        $('#welcome').text(data);
    });

    socket.on('people', function (data) {
        $('#people').html('');
        for (name of data) {
            let listItem = $('<li>' + name + '</li>');
            listItem.addClass('list-group-item');
            listItem.addClass('col-xs-12');
            $('#people').append(listItem);
        }
    });

    socket.on('message', function (data) {
        $('#chat').append(data + '&#xA;');
    });
};

function sendMessage (message) {
    socket.emit('message', message);
};

$('form#form-connect').submit(function (event) {
    event.preventDefault();

    let name = $('#name').val().trim();
    if (!name.length) {
        showError('Please, pick a name.')
        return;
    }

    $('#connect-button').prop('disabled', true);
    connect(name);
});

function showError (message) {
    $('#connect-error').text(message);
    $('#connect-error').fadeIn('fast');
};

$('form#form-message').submit(function (event) {
    event.preventDefault();

    let message = $('#message').val().trim();
    if (message.length)
        sendMessage(message);
    $('#message').val('');
});

function enterChat () {
    $('#chat-connect').hide();
    $('#chat-room').fadeIn();
    $('#message').focus();
};
