module.exports = {
    theme: {
        name: "casper"
    },
    view: {
        pretty: false,  // true for pretty HTML formatting
        debug:  false   // true for view engine console debug
    },
    app: {
        // Default URL contains year, month, day and slug
        urlFormat: "/:year/:month/:day/:slug.html",
        httpCompression: true,
        
        // Default Metadata
        defaultMetaTitle: "Panda",
        defaultMetaDesc: "Yet another blogging platform",

        title: "Panda",
        description: "Yet another blogging platform.",

        // # Pagination
        postsPerPage: 6,
        pageUrlFormat: "/page/:page",
        pageUrlRegExp: "/page/\\d+",
        copyright: "All content copyright <a href=\":url\">:title</a> &copy; :year &bull; All rights reserved."
    },
    url: "http://127.0.0.1:3000",
    server: { 
        host: "127.0.0.1", 
        port: 3000 
    },
    database: { 
        type: "memory" 
    }
}