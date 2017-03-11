'use strict';
let socket;

init();

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

function connect (name) {
    socket.emit('join-request', name);
};

function events () {
    socket.on('join-response', function (response) {
        if (response) {
            enterChat();
        } else {
            $('#connect-button').prop('disabled', false);
            $('#connect-button').text($('#connect-button').data('title'));
            showError('That name is being used already. Please, choose another one.')
        }
    });

    socket.on('welcome', function (data) {
        $('#welcome').html(data);
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

    socket.on('delete-msgs-result', function (data) {
        $('#delete-msgs').prop('disabled', false);
        $('#delete-msgs').text($('#delete-msgs').data('title'));
        
        alert(data);
    });
};

function sendMessage (message) {
    socket.emit('message', message);
};

function showError (message) {
    $('#connect-error').text(message);
    $('#connect-error').fadeIn('fast');
};

function enterChat () {
    $('#chat-connect').hide();
    $('#title').addClass('hidden-xs');
    $('#chat-room').fadeIn();
    $('#disconnect').fadeIn();
    $('#delete-msgs').fadeIn();
    $('#message').focus();
};

$('form#form-connect').submit(function (event) {
    event.preventDefault();

    let name = $('#name').val().trim();
    if (!name.length) {
        showError('Please, pick a name.')
        return;
    }

    $('#connect-button').prop('disabled', true);
    $('#connect-button').text('Connecting...');
    connect(name);
});

$('form#form-message').submit(function (event) {
    event.preventDefault();

    let message = $('#message').val().trim();
    if (message.length)
        sendMessage(message);
    $('#message').val('');
});

$('#delete-msgs').click(function (event) {
    $(this).prop('disabled', true);
    $(this).text('Deleting...');
    socket.emit('delete-msgs');
});

$('#disconnect').click(function (event) {
    $(this).prop('disabled', true);
    $(this).text('Disconnecting...');
    location.reload();
});

