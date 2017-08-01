const http = require('http');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cookieSession = require('express-session');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..', 'build')));
app.use(express.static(path.join(__dirname, '..', 'node_modules')));
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

require('./routes')(app);

const server = http.createServer(app);
server.listen(port, () => {
    // eslint-disable-next-line
    console.log(`Server started on localhost:${port}`);
});

const io = require('./socket')(server);
app.set('io', io);
