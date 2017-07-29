const path = require('path');

exports.get = function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'template/login.html'));
};

exports.post = function (req, res) {
    req.session.user = req.body.username;
    res.send({});
};
