'use strict';
let socket = require('socket.io');

let io;

let init = (server) => {
    this.io = socket(server);
    events();
}

let events = () => {
    this.io.on('connection', function (client) {
        console.log('client connected');

        client.on('join', function (data) {
            client.name = data;
            client.emit('welcome', `Welcome to the server, ${client.name}!`);
        });

        client.on('message', function (data) {
            let message = `${client.name}: ${data}`;
            client.emit('message', message);
            client.broadcast.emit('message', message);
        });

    });
}


module.exports = { init };