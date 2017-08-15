const http = require('http');
const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');

const app = express();
const SERVER_PORT = 3000;

app.use(serveStatic(path.join(__dirname, '..', 'build')));

const server = http.createServer(app);
server.listen(SERVER_PORT, () => {
    // eslint-disable-next-line
    console.log(`Server started on localhost:${SERVER_PORT}`);
});

const io = require('./socket')(server);
app.set('io', io);
