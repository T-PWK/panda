module.exports = {
    theme: {
        name: "casper"
    },
    app: {
        // Default URL contains year, month, day and slug
        urlFormat: "/:year/:month/:day/:slug.html",
        httpCompression: true,
        
        // Default Metadata
        defaultMetaTitle: "",
        defaultMetaDesc: "",
        defaultKeywords: [],

        title: "Panda",
        description: "Simple blogging platform.",

        // # Pagination
        postsPerPage: 6,
        pageUrlFormat: "/page/:page"
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