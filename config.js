// Panda configuration file

var config = module.exports = {

    // ### Development Environment ###
    development: {
//        app: {
//            postUrl: "/:slug"
//        },
        admin: {
            sessionSecret: 'Syst3mS3ssi0nS3cr3t'
        },
        database: {
            type: 'mongo',
            connection: {
                uri: 'mongodb://localhost'
            }
        }
    },

    // ### Production Environment ###
    production: {
        url: process.env.APP_URL,
//        app: {
//            postUrl: '/:slug'
//        },
//        admin: {
//            // session secret can be provided via SESSION_SECRET env variable.
//            // If system can't find one it will generate random 32 characters long one.
//            sessionSecret: 'ThisIsMyS3cr3t'
//        },
        database: {
            type: 'mongo',
            connection: {
                uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL
            }
        },
        server: {
            host: '0.0.0.0'
        }
    }

};