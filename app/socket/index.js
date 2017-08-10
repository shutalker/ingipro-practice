const store = require('../store');

function editStore(type, payload, socket) {
    switch (type) {
        case 'user:join':
            store.userAdd(payload.userId, payload.name, socket);
            break;
        case 'canvas:lock':
            store.lock(payload.userId, socket);
            break;
        case 'canvas:unlock':
            store.unlock(payload.userId, socket);
            break;
        default:
            store.addData(type, payload, socket);
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
