// Panda configuration file

var config = module.exports = {
    // ### Environment ###
    production: {
        theme: 'casper',
        url: 'http://panda-blog.herokuapp.com/',
        database: {
            type: 'mongo',
            connection: {
                uri: process.env.MONGOLAB_URI
            }
        },
        server: {
            host: '127.0.0.1',
            port: process.env.PORT
        }
    }
}