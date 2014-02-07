// PostProvider using memory storage

var when    = require('when'),
    moment  = require('moment');

var PostProvider = module.exports = function () {}

PostProvider.prototype.dummyData = [
    {
        title: 'Post 1 on 2012-12-20', 
        slug: 'post-1-on-2012-12-20',
        scheduled: new Date('2012-12-20'), 
        created: new Date('2012-12-20'), 
        updated: new Date('2012-12-25')
    },
    {
        title: 'Node.js Tutorial Part 1', 
        slug: 'tutorial-part-1', 
        scheduled: new Date('2013-12-10'), 
        created: new Date('2013-12-10'), 
        updated: new Date('2014-01-25')
    },
    {
        title: 'Node.js Tutorial Part 2', 
        slug: 'tutorial-part-2', 
        scheduled: new Date('2013-12-19'), 
        created: new Date('2013-12-19'), 
        updated: new Date('2014-01-20')
    },
    {
        title: 'How to create currency filter to remove decimal/cents in AngularJS',
        slug: 'currency-filter-remove-decimal-cents-angularjs',
        scheduled: new Date('2014-01-10'), 
        created: new Date('2014-01-10'), 
        updated: new Date('2014-01-10')
    },
    {
        title: 'Sails deployed to multiple nodes',
        slug: 'sails-deployed-multiple-nodes',
        scheduled: new Date('2014-02-02'), 
        created: new Date('2014-02-02'), 
        updated: new Date('2014-02-05')
    }
];

PostProvider.prototype.init = function () {
    console.info('initializing PostProvider memory')
    return when();
}

PostProvider.prototype.findAll = function () {
    return when(this.sort(this.dummyData));
};

PostProvider.prototype.findBySlug = function (slug) {
    var items = this.dummyData.filter(function (item) {
        return item.slug === slug;
    });

    return when(items[0]);
};

PostProvider.prototype.findByYear = function (year) {
    var items = this.dummyData.filter(function (item) {
        return item.scheduled.getFullYear() === year;
    });

    return when(this.sort(items));
}

PostProvider.prototype.findByMonth = function (year, month) {
    // JavaScript Date uses 0-based month index
    month--;

    var items = this.dummyData.filter(function (item) {
        return item.scheduled.getFullYear() === year 
            && item.scheduled.getMonth() === month;
    });
    
    return when(this.sort(items));
}

PostProvider.prototype.sort = function (posts) {
    posts = posts.slice(0);
    posts.sort(this.sortByCreatedAt)

    return posts;
}

PostProvider.prototype.sortByCreatedAt = function (a, b) {
    if (a.created > b.created) return 1;
    if (a.created < b.created) return -1;
    return 0;
}