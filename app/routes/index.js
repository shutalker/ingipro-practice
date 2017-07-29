module.exports = function(app) {
    app.get('/login', require('./login').get);
    app.post('/login', require('./login').post);
    app.get('/room', require('./room').get);
};
