
module.exports = function(server) {
    const io = require('socket.io').listen(server);

    io.sockets.on('connection', (socket) => {

        socket.on('login room', (room) => {
            if (Object.keys(io.sockets.adapter.rooms).indexOf(room) === -1) {return socket.emit('room not found');}
            socket.join(room);
        });

        socket.on('create room', (room) => {
            if (Object.keys(io.sockets.adapter.rooms).indexOf(room) !== -1) {return socket.emit('room already exist');}
            socket.join(room);
        });
    });

    return io;
};
