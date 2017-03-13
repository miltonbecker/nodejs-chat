'use strict';
let express = require('express');
let http = require('http');
let path = require('path');
let chatServer = require('./chat-server');

let app = express();
let server = http.createServer(app);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(`${__dirname}/../client/pages/index.html`));
});

app.use('/lib', express.static(path.resolve(`${__dirname}/../node_modules`)));

app.use('/css', express.static(path.resolve(`${__dirname}/../client/css`)));

app.use('/dist', express.static(path.resolve(`${__dirname}/../client/dist`)));

chatServer.init(server);

// Heroku support 
let port = process.env.PORT || 8080;

server.listen(port, function () {
    console.log('Listening on port %d...', port);
});
