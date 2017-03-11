'use strict';
let socket = require('socket.io');
let redis = require('redis');

let dbClient = redis.createClient();

/** @type {SocketIO.Server} */
let io;

const PEOPLE = 'chat-people';

let init = (server) => {
    dbClient.del(PEOPLE);
    this.io = socket(server);
    events();
}

let events = () => {

    this.io.on('connection',
        /**
         * @param  {SocketIO.Socket} client
         */
        (client) => {
            console.log('client connected: ' + client.request.connection.remoteAddress);

            client.on('join-request', (data) => {
                dbClient.sadd(PEOPLE, data, (err, response) => {
                    if (!response) {
                        client.emit('join-response', false);
                        return;
                    }
                    client.name = data;
                    okToJoin(client);
                });

            });

            client.on('message', (data) => {
                let message = `${client.name}: ${data}`;
                this.io.emit('message', message);
                saveMessage(message);
            });

            client.on('delete-msgs', (data) => {
                if (client.name) {
                    dbClient.del('messages', function (err, res) {
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
                        client.emit('delete-msgs-result', response);
                    });
                }
            });

            client.on('disconnect', () => {
                if (client.name) {
                    dbClient.srem(PEOPLE, client.name);
                    dbClient.smembers(PEOPLE, (err, response) => {
                        this.io.emit('people', response.sort());
                    });
                    this.io.emit('message', `<< User ${client.name} left the chat`);
                }
            });
        });
}

let okToJoin = (client) => {
    client.emit('join-response', true);
    client.emit('welcome', `Welcome to the chat, ${client.name}!`);

    dbClient.smembers(PEOPLE, (err, response) => {
        this.io.emit('people', response.sort());
    });

    client.broadcast.emit('message', `>> User ${client.name} joined the chat`);

    dbClient.lrange('messages', 0, -1, function (err, messages) {
        messages = messages.reverse();
        messages.forEach(function (message) {
            client.emit('message', message);
        });
    });
}

let saveMessage = (message) => {
    dbClient.lpush('messages', message, function (err, response) {
        dbClient.ltrim('messages', 0, 9);
    });
}


module.exports = { init };