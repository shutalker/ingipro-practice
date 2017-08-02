const randomColor = require('randomcolor');
const Window = require('../entities');
const users = [];
let windows = {
    id0: new Window(/*...*/),// координаты соответсвующие одному окну, занимающему весь экран
};
//let block = false; //???


module.exports = function (server) {
    const io = require('socket.io').listen(server);

    io.sockets.on('connection', (socket) => {

        socket
            .on('add user', (obj) => {
                const {login, id} = JSON.parse(obj);

                if (users.length === 0) {
                    socket.emit('first user');
                } else {
                    socket.emit('synchronization', JSON.stringify(windows));
                }

                users.push({
                    login: login,
                    color: randomColor({luminosity: 'light'}),
                    id: id,
                });

                socket.broadcast.emit('new user', JSON.stringify(users[users.length]));
            })
            .on('draw mark', (obj) => {
                const {windowId, line} = JSON.parse(windowId, line);

                windows[windowId].createMark(line);

                socket.broadcast.emit('draw mark', obj);
            })
            .on('del marks', (obj) => {
                const {windowId} = JSON.parse(obj);

                windows[windowId].delMarks();

                socket.broadcast.emit('del marks', obj);
            })
            .on('add model', (obj) => {
                const {windowId, model} = JSON.parse(obj);

                windows[windowId].loadModel(model);

                socket.broadcast.emit('add model', obj);
            })
            .on('zoom model', (obj) => {
                const {windowId, scale} = JSON.parse(obj);

                windows[windowId].model.zoom(scale);

                socket.broadcast.emit('zoom model', obj);
            })
            .on('create window', (obj) => { //на самом деле сложнее, т.к создание окна, затронет соседние окна
                const {windowId, coordinates} = JSON.parse(obj);

                windows[windowId] = new Window(coordinates);

                socket.broadcast.emit('create window', obj);
            });
    });

    return io;
};
