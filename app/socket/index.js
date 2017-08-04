const randomColor = require('randomcolor');
const Window = require('../entities');
const users = {};
let windows = {
    id0: new Window(/*...*/),// координаты соответсвующие одному окну, занимающему весь экран
};
let lock = false;
let userLock;

function lockCheck(f, user) {
    return function () {
        if (lock && user !== userLock) {
            return;
        }
        return f.apply(this, arguments);
    };
}

module.exports = function (server) {
    const io = require('socket.io').listen(server);

    io.sockets.on('connection', (socket) => {

        socket
            .on('user:join', (obj) => {
                const {name, userId} = JSON.parse(obj);

                if (Object.keys(users).length === 0) {
                    socket.emit('conference:created');
                } else {
                    socket.emit('state:sync', JSON.stringify({
                        users: users,
                        payload: windows,
                    }));
                }

                users[userId] = {
                    name: name,
                    color: randomColor({luminosity: 'light'}),
                };

                socket.broadcast.emit('user:join', JSON.stringify(users[userId]));
            })
            .on('canvas:lock', (obj) => {
                const {userId} = JSON.parse(obj);

                if (!lock) {
                    userLock = userId;
                    socket.emit('lock:accept');
                } else {
                    socket.emit('lock:denied');
                }
            })
            .on('canvas:unlock', (obj) => {
                const {userId} = JSON.parse(obj);

                if (lock && userLock === userId) {
                    lock = false;
                }
            })
            .on('mark:add', (obj) => {
                const {userId, line, sectionId} = JSON.parse(obj);

                lockCheck(() => {
                    windows[sectionId].createMark(line, users[userId].color);

                    socket.broadcast.emit('mark:add', obj);
                }, userId)();
            })
            .on('mark:clean', (obj) => {
                const {sectionId, userId} = JSON.parse(obj);

                lockCheck(() => {
                    windows[sectionId].delMarks();

                    socket.broadcast.emit('mark:clean', obj);
                }, userId)();

            })
            .on('canvas:upload', (obj) => {
                const {sectionId, model, userId} = JSON.parse(obj);

                lockCheck(() => {
                    windows[sectionId].loadModel(model);

                    socket.broadcast.emit('canvas:upload', obj);
                }, userId)();

            })
            .on('canvas:zoom', (obj) => {
                const {sectionId, zoom, userId} = JSON.parse(obj);

                lockCheck(() => {
                    windows[sectionId].model.zoom(zoom);

                    socket.broadcast.emit('canvas:zoom', obj);
                }, userId)();
            })
            .on('canvas:update', (obj) => {
                const {payload, userId} = JSON.parse(obj);

                lockCheck(() => {
                    for (let info of payload) {
                        if (!Object.keys(windows).includes(info.sectionId)) {
                            windows[info.sectionId] = new Window(info.coordinates);
                        } else {
                            windows[info.sectionId].coordinates = info.coordinates;
                        }
                    }

                    socket.broadcast.emit('canvas:update', obj);
                }, userId)();

            });
    });

    return io;
};
