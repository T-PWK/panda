// This file is responsible for performing modules initialization like configuration load,
// providers initialization, application server startup etc.

var colors  = require('colors'),
    when    = require('when');

function startPanda (app) {
    when()
        .then(function () {
            return require('./server/config').init();
        })
        .then(function () {
            return require('./server/providers').init();
        })
        .then(function () {
            var panda = require('./server');
            panda(app);
        })
        .catch(function (err) {
            console.log(("Panda server initialization error " + err).red);
            console.log((err.stack).red);
        })
}

module.exports = startPanda;