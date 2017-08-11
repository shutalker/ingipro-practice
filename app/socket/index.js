const store = require('../store');

function editStore(type, payload, socket) {
    switch (type) {
        case 'user:join':
            const data = store.userAdd(payload.name);
            socket.emit('main', {
                type: 'conference:sync',
                payload: data,
            });
            socket.broadcast.emit('main', {
                type: 'conference:join',
                payload: data.users[data.users.length - 1],
            });
            break;
        case 'canvas:lock':
            if (store.lock(payload.userId, socket)){
                socket.emit('main', {type: 'lock:accept'});
                break;
            }
            socket.emit('main', {type: 'lock:denied'});
            break;
        case 'canvas:unlock':
            store.unlock(payload.userId, socket);
            break;
        default:
            if (store.addData(type, payload, socket)){
                socket.broadcast.emit('main', {type: payload});
            } else {
                socket.emit('main', {type: 'access:denied'});
            }
    }
}

module.exports = function (server) {
    const io = require('socket.io').listen(server);

    io.sockets.on('connection', (socket) => {

        socket
            .on('main', (obj) => editStore(obj.type, obj.payload, socket));
    });

    return io;
};
