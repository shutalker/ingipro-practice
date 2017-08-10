const randomColor = require('randomcolor');
const userList = {};
const store = {};
let lock = false;
let userLock;

function lockCheck(userId, f) {
    return function () {
        if (lock && userId !== userLock) {
            return false;
        }
        f.apply(this, arguments);
        return true;
    };
}

exports.userAdd = function (userId, login, socket) {
    if (Object.keys(userList).length === 0) {
        socket.emit('conference:created');
    } else {
        socket.emit('state:sync', {
            users: userList,
            payload: store,
        });
    }

    userList[userId] = {
        name: login,
        color: randomColor({luminosity: 'light'}),
    };

    socket.broadcast.emit('user:join', userList[userId]);
};

exports.lock = function (userId, socket) {
    if (!lock) {
        userLock = userId;
        socket.emit('lock:accept');
    } else {
        socket.emit('lock:denied');
    }
};

exports.unlock = function (userId, socket) {
    if (lock && userLock === userId) {
        lock = false;
        socket.emit('unlock:accept');
    } else {
        socket.emit('unlock:denied');
    }
};

exports.addData = function (type, payload, socket) {
    const allow = (lockCheck(payload.userId, () => {
        store[type] = payload;
    }))();
    if (allow){
        socket.broadcast.emit('main', {type: payload});
    } else {
        socket.emit('access:denied');
    }
};
