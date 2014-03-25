module.exports = {
    theme: {
        name: "casper",
        custom: {}
    },
    view: {
        pretty: false,  // true for pretty HTML formatting
        debug:  false   // true for view engine console debug
    },
    app: {
        httpCompression: true,
        
        // Default metadata does not have default values
        metaTitle: null,
        metaDescription: null,

        title: "Panda",
        description: "Yet another blogging platform.",

        /*
         * Post meta title format. Available tokens:
         * :blogtitle - substituted with the blog's title (app:title)
         * :posttitle - substituted with the post's title
         * :authorname - substituted with the post's author name
         */
        postMetaTitleFormat: ":blogtitle | :posttitle",

        // Number of posts per page
        postsPerPage: 6,

        /* 
         * Post URL format. Available tokens:
         * :year - substitued with the post's publication year (four digits e.g. 2012, 2013 etc.)
         * :month - substitued with the post's publication month (two digits 01 - January, 02 - February etc.)
         * :day - substitued with the post's publication month's day (two digits)
         * :slug' - substitued with the post's slug
         * :id - substitued with the post's id
         */
        //postPermalink
        postUrl: "/:year/:month/:day/:slug.html",

        /* 
         * Post URL format. Available tokens:
         * :year - substitued with the post's publication year (four digits e.g. 2012, 2013 etc.)
         * :month - substitued with the post's publication month (two digits 01 - January, 02 - February etc.)
         * :day - substitued with the post's publication month's day (two digits)
         * :slug' - substitued with the post's slug
         * :id - substitued with the post's id
         */
        // pagePermalink
        pageUrl: "/:slug",

        /* 
         * Search by label URL format. Available tokens:
         * :label - substitued with the current label
         */
        labelUrl: "/search/label/:label",
        
        /*
         * Pagination URL format. Available tokens:
         * - :page - substituted with pagination number
         */
        paginationUrl: "/page/:page",

        /*
         * Copyright content. Available tokens:
         * - :title - substituted with the blog title (app:title)
         * - :year - substituted with the current year
         * - :url - substituted with the blog URL (url)
         */
        copyright: "All content copyright :title &copy; :year &bull; All rights reserved.",

        /*
         * Static content cache in milliseconds
         */
        staticCacheAge: 0,

        // Feeds configuration
        feeds: {
            // RSS feed configuration
            rss: {
                // Number of posts per page
                postsPerPage: 25
            },
            // Atom feed configuration
            atom: {
                // Number of posts per page
                postsPerPage: 25
            }
        },

        robots: {
            disallow: ['/search', '/admin'],
            allow: ['/']
        }
    },
    admin: {
        theme: 'default',
        sessionCookieMaxAge: 60*60*1000
    },
    url: "http://127.0.0.1:3000",
    server: {
        host: "127.0.0.1",
        port: 3000
    },
    database: {
        type: "memory",
        postsFile: 'posts.json',
        redirectsFile: 'redirects.json',
        usersFile: 'users.json'
    }
};