'use strict';
let socket = require('socket.io');
let redis = require('redis');
let constants = require('../common/constants');

let dbClient = redis.createClient();

/** @type {SocketIO.Server} */
let io;

const DB_PEOPLE = 'chat-people';
const DB_MESSAGES = 'chat-messages';

function init(server) {
    dbClient.del(DB_PEOPLE);
    io = socket(server);
    events();
}

function events() {
    io.on(constants.EV_CONNECTION,
        /**
         * @param  {SocketIO.Socket} client
         */
        (client) => {
            console.log(`Client connected, ${client.request.connection._peername.family}: ${client.request.connection._peername.address}`);

            client.on(constants.EV_JOIN_REQUEST, (name) => {
                name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

                dbClient.sadd(DB_PEOPLE, name, (err, response) => {
                    if (!response) {
                        client.emit(constants.EV_JOIN_RESPONSE, false);
                        return;
                    }
                    client.name = name;
                    okToJoin(client);
                });

            });

            client.on(constants.EV_MESSAGE, (data) => {
                let message = `${client.name}: ${data}`;
                io.emit(constants.EV_MESSAGE, message);
                saveMessage(message);
            });

            client.on(constants.EV_DELETE_MSGS_REQUEST, (data) => {
                if (client.name) {
                    dbClient.del(DB_MESSAGES, (err, res) => {
                        let response;
                        if (err) {
                            response = 'There was an error deleting the cached messages from the server.';
                        } else {
                            if (res) {
                                response = 'Cached messages deleted successfully from the server!'
                            } else {
                                response = 'There was no cached message to delete from the server.'
                            }
                        }
                        client.emit(constants.EV_DELETE_MSGS_RESPONSE, response);
                    });
                }
            });

            client.on(constants.EV_DISCONNECT, () => {
                if (client.name) {
                    dbClient.srem(DB_PEOPLE, client.name);
                    dbClient.smembers(DB_PEOPLE, (err, response) => {
                        io.emit(constants.EV_PEOPLE, response.sort());
                    });
                    io.emit(constants.EV_MESSAGE, `<< User ${client.name} left the chat`);
                }
            });
        });
}

function okToJoin(client) {
    client.emit(constants.EV_JOIN_RESPONSE, true);
    client.emit(constants.EV_WELCOME, `Welcome to the chat, ${client.name}!`);

    dbClient.smembers(DB_PEOPLE, (err, response) => {
        io.emit(constants.EV_PEOPLE, response.sort());
    });

    client.broadcast.emit(constants.EV_MESSAGE, `>> User ${client.name} joined the chat`);

    dbClient.lrange(DB_MESSAGES, 0, -1, (err, messages) => {
        messages = messages.reverse();
        messages.forEach((message) => {
            client.emit(constants.EV_MESSAGE, message);
        });
    });
}

function saveMessage(message) {
    dbClient.lpush(DB_MESSAGES, message, (err, response) => {
        dbClient.ltrim(DB_MESSAGES, 0, 9);
    });
}


module.exports = { init };