// Panda configuration file

var config = module.exports = {
    // ### Environment ###
    production: {
        theme: 'casper',
        url: process.env.APP_URL,
        database: {
            type: 'mongo',
            connection: {
                uri: process.env.MONGOLAB_URI
            }
        },
        server: {
            host: '0.0.0.0',
            port: process.env.PORT
        },
        app: {
            urlFormat: '/:slug'
        }
    }
}