'use strict';
import constants from '../../common/constants';

const MSG_NAME_BEING_USED = 'That name is being used already. Please, choose another one.';
const MSG_PICK_NAME = 'Please, pick a name.';

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

function connect(name) {
    socket.emit(constants.EV_JOIN_REQUEST, name);
};

function events() {
    socket.on(constants.EV_JOIN_RESPONSE, function (response) {
        if (response) {
            enterChat();
        } else {
            $('#connect-button').prop('disabled', false);
            $('#connect-button').text($('#connect-button').data('title'));
            showError(MSG_NAME_BEING_USED)
        }
    });

    socket.on(constants.EV_WELCOME, function (data) {
        $('#welcome').html(data);
    });

    socket.on(constants.EV_PEOPLE, function (data) {
        $('#people').html('');
        for (name of data) {
            let listItem = $('<li>', { text: name });
            listItem.addClass('list-group-item');
            listItem.addClass('col-xs-12');
            $('#people').append(listItem);
        }
    });

    socket.on(constants.EV_MESSAGE, function (data) {
        $('#chat').append(data + '&#xA;');
        scrollChatToBottom();
    });

    socket.on(constants.EV_DELETE_MSGS_RESPONSE, function (response) {
        $('#delete-msgs').prop('disabled', false);
        $('#delete-msgs').text($('#delete-msgs').data('title'));

        alert(response);
    });
};

function sendMessage(message) {
    socket.emit(constants.EV_MESSAGE, message);
};

function showError(message) {
    $('#connect-error').text(message);
    $('#connect-error').fadeIn('fast');
};

function enterChat() {
    $('#chat-connect').hide();
    $('#title').addClass('hidden-xs');
    $('#chat-room').fadeIn();
    $('#disconnect').fadeIn();
    $('#delete-msgs').fadeIn();
    $('#message').focus();
};

function scrollChatToBottom() {
    $('#chat').scrollTop($('#chat')[ 0 ].scrollHeight);
}

$('form#form-connect').submit(function (event) {
    event.preventDefault();

    let name = $('#name').val().trim();
    if (!name.length) {
        showError(MSG_PICK_NAME)
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
    socket.emit(constants.EV_DELETE_MSGS_REQUEST);
});

$('#disconnect').click(function (event) {
    $(this).prop('disabled', true);
    $(this).text('Disconnecting...');
    location.reload();
});

