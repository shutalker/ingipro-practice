const randomColor = require('randomcolor');
const uuidv4 = require('uuid/v4');
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

exports.userAdd = function (login) {
    const userId = uuidv4();
    userList[userId] = {
        name: login,
        color: randomColor({luminosity: 'light'}),
    };

    return {
        users: Object.keys(userList).map((value) => ({
            userId: value,
            name: userList[value].name,
            color: userList[value].color,
        })),
        data: store,
    };
};

exports.lock = function (userId) {
    if (!lock) {
        userLock = userId;
        return true;
    }
    return false;
};

exports.unlock = function (userId) {
    lockCheck(userId, () => { lock = false; })();
};

exports.addData = function (type, payload) {
    return (lockCheck(payload.userId, () => {store[type] = payload;}))();
};
