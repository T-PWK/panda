var admin = require('../controllers/admin');

module.exports = function (server) {
    server.get('/login', admin.login);
    server.get('/logout', admin.logout);
    server.get('/admin', admin.index);
    server.get('/admin/partial/:name', admin.partial);
};