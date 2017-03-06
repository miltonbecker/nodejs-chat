'use strict';
let express = require('express');
let http = require('http');
let path = require('path');
let chatServer = require('./chat-server');

let app = express();
let server = http.createServer(app);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(`${__dirname}/../index.html`));
});

app.use('/lib', express.static(path.resolve(`${__dirname}/../node_modules`)));

app.use('/css', express.static(path.resolve(`${__dirname}/../css`)));

app.use('/js', express.static(path.resolve(__dirname)));

chatServer.init(server);

server.listen(8080, function () {
    console.log('Listening on port %d...', 8080);
});
