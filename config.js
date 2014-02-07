// Panda configuration file

var config = module.exports = {
    // ### Environment ###
    development: {
        url: 'http://127.0.0.1',
        database: {
            type: 'memory'
            // connection: {
            //     uri: process.env.MONGOLAB_URI
            // }
        },
        server: {
            host: '127.0.0.1',
            port: '3000'
        }
    },
    production: {
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