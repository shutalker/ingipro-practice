const http = require('http');
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..', 'build')));

const server = http.createServer(app);
server.listen(port, () => {
    // eslint-disable-next-line
    console.log(`Server started on localhost:${port}`);
});

const io = require('./socket')(server);
app.set('io', io);
