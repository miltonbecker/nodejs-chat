'use strict';
let socket = require('socket.io');

let io;
let people;

let init = (server) => {
    this.io = socket(server);
    this.people = new Set();
    events();
}

let events = () => {
    this.io.on('connection', (client) => {
        console.log('client connected');

        client.on('joinRequest', (data) => {
            if (this.people.has(data)) {
                client.emit('joinResponse', false);
                return;
            } 
            this.people.add(data);
            client.name = data;
            client.emit('welcome', `Welcome to the server, ${data}!`);
            client.emit('joinResponse', true);
            client.emit('people', [ ...this.people ].sort());
            client.broadcast.emit('people', [ ...this.people ].sort());
        });

        client.on('message', (data) => {
            let message = `${client.name}: ${data}`;
            client.emit('message', message);
            client.broadcast.emit('message', message);
        });

        client.on('disconnect', () => {
            this.people.delete(client.name);
            this.io.emit('people', [ ...this.people ].sort());
        });
    });
}


module.exports = { init };