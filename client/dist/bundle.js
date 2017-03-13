/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var EV_CONNECTION = 'connection';
var EV_JOIN_REQUEST = 'join-request';
var EV_JOIN_RESPONSE = 'join-response';
var EV_WELCOME = 'welcome';
var EV_MESSAGE = 'message';
var EV_DELETE_MSGS_REQUEST = 'delete-msgs-request';
var EV_DELETE_MSGS_RESPONSE = 'delete-msgs-response';
var EV_DISCONNECT = 'disconnect';
var EV_PEOPLE = 'people';

module.exports = {
    EV_CONNECTION: EV_CONNECTION, EV_JOIN_REQUEST: EV_JOIN_REQUEST, EV_JOIN_RESPONSE: EV_JOIN_RESPONSE, EV_WELCOME: EV_WELCOME,
    EV_MESSAGE: EV_MESSAGE, EV_DELETE_MSGS_REQUEST: EV_DELETE_MSGS_REQUEST, EV_DELETE_MSGS_RESPONSE: EV_DELETE_MSGS_RESPONSE,
    EV_DISCONNECT: EV_DISCONNECT, EV_PEOPLE: EV_PEOPLE
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _constants = __webpack_require__(0);

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MSG_NAME_BEING_USED = 'That name is being used already. Please, choose another one.';
var MSG_PICK_NAME = 'Please, pick a name.';

var socket = void 0;

init();

function init() {
    var port = 8080;
    var hostname = location.hostname;
    if (hostname.indexOf('herokuapp') !== -1) {
        port = 80;
    }

    if (port === 80) {
        socket = io.connect('' + hostname);
    } else {
        socket = io.connect(hostname + ':' + port);
    }

    events();
};

function connect(name) {
    socket.emit(_constants2.default.EV_JOIN_REQUEST, name);
};

function events() {
    socket.on(_constants2.default.EV_JOIN_RESPONSE, function (response) {
        if (response) {
            enterChat();
        } else {
            $('#connect-button').prop('disabled', false);
            $('#connect-button').text($('#connect-button').data('title'));
            showError(MSG_NAME_BEING_USED);
        }
    });

    socket.on(_constants2.default.EV_WELCOME, function (data) {
        $('#welcome').html(data);
    });

    socket.on(_constants2.default.EV_PEOPLE, function (data) {
        $('#people').html('');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                name = _step.value;

                var listItem = $('<li>', { text: name });
                listItem.addClass('list-group-item');
                listItem.addClass('col-xs-12');
                $('#people').append(listItem);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    });

    socket.on(_constants2.default.EV_MESSAGE, function (data) {
        $('#chat').append(data + '&#xA;');
        scrollChatToBottom();
    });

    socket.on(_constants2.default.EV_DELETE_MSGS_RESPONSE, function (response) {
        $('#delete-msgs').prop('disabled', false);
        $('#delete-msgs').text($('#delete-msgs').data('title'));

        alert(response);
    });
};

function sendMessage(message) {
    socket.emit(_constants2.default.EV_MESSAGE, message);
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
    $('#chat').scrollTop($('#chat')[0].scrollHeight);
}

$('form#form-connect').submit(function (event) {
    event.preventDefault();

    var name = $('#name').val().trim();
    if (!name.length) {
        showError(MSG_PICK_NAME);
        return;
    }

    $('#connect-button').prop('disabled', true);
    $('#connect-button').text('Connecting...');
    connect(name);
});

$('form#form-message').submit(function (event) {
    event.preventDefault();

    var message = $('#message').val().trim();
    if (message.length) sendMessage(message);
    $('#message').val('');
});

$('#delete-msgs').click(function (event) {
    $(this).prop('disabled', true);
    $(this).text('Deleting...');
    socket.emit(_constants2.default.EV_DELETE_MSGS_REQUEST);
});

$('#disconnect').click(function (event) {
    $(this).prop('disabled', true);
    $(this).text('Disconnecting...');
    location.reload();
});

/***/ })
/******/ ]);