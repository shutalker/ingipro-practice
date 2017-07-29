const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const port = 3000;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('express-session');

app.use(express.static(path.join(__dirname, '..', 'build')));

app.use(cookieParser());

app.use(bodyParser());

app.use(cookieSession({
    secret: 'ingipro',
    key: 'sid',
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: null,
    },
}));

app.use(express.static(path.join(__dirname)));

app.use(express.static(path.join(__dirname, '..', 'node_modules')));

require('./routes')(app);

const server = http.createServer(app);
server.listen(port, () => {
    // eslint-disable-next-line
    console.log(`Server started on localhost:${port}`);
});

const io = require('./socket')(server);
app.set('io', io);
