// PostProvider using memory storage

var when    = require('when'),
    moment  = require('moment'),
    cfg     = require('nconf'),
    limit   = cfg.get('app:postsPerPage');

var PostProvider = module.exports = function () {
    this.type = 'memory';
}

PostProvider.prototype.dummyData = [
{
    title: 'Welcome to Ghost', 
    slug: 'welcome-to-ghost',
    scheduled: new Date('2012-12-20'), 
    created: new Date('2012-12-20'), 
    updated: new Date('2012-12-25'),
    excerpt: "You're live! Nice. We've put together a little post to introduce you to the Ghost editor and get you started. You can manage your content by signing in to the admin area at &lt;your blog URL&gt;/ghost/. When you arrive, you can select this post from a list",
    labels: ['angularjs', 'function'],
    content: '<p>You\'re live! Nice. We\'ve put together a little post to introduce you to the Ghost editor and get you started. You can manage your content by signing in to the admin area at <code>&lt;your blog URL&gt;/ghost/</code>. When you arrive, you can select this post from a list on the left and see a preview of it on the right. Click the little pencil icon at the top of the preview to edit this post and read the next section!</p><h2 id="gettingstarted">Getting Started</h2><p>Ghost uses something called Markdown for writing. Essentially, it\'s a shorthand way to manage your post formatting as you write!</p><p>Writing in Markdown is really easy. In the left hand panel of Ghost, you simply write as you normally would. Where appropriate, you can use <em>shortcuts</em> to <strong>style</strong> your content. For example, a list:</p><ul><li>Item number one</li><li>Item number two<ul><li>A nested item</li></ul></li><li>A final item</li></ul><p>or with numbers!</p><ol><li>Remember to buy some milk  </li><li>Drink the milk  </li><li>Tweet that I remembered to buy the milk, and drank it</li></ol><h3 id="links">Links</h3><p>Want to link to a source? No problem. If you paste in url, like <a href="http://ghost.org">http://ghost.org</a> - it\'ll automatically be linked up. But if you want to customise your anchor text, you can do that too! Here\'s a link to <a href="http://ghost.org">the Ghost website</a>. Neat.</p><h3 id="whataboutimages">What about Images?</h3><p>Images work too! Already know the URL of the image you want to include in your article? Simply paste it in like this to make it show up:</p><p><img src="https://ghost.org/images/ghost.png" alt="The Ghost Logo"></p><p>Not sure which image you want to use yet? That\'s ok too. Leave yourself a descriptive placeholder and keep writing. Come back later and drag and drop the image in to upload:</p><h3 id="quoting">Quoting</h3><p>Sometimes a link isn\'t enough, you want to quote someone on what they\'ve said. It was probably very wisdomous. Is wisdomous a word? Find out in a future release when we introduce spellcheck! For now - it\'s definitely a word.</p><blockquote><p>Wisdomous - it\'s definitely a word.</p></blockquote><h3 id="workingwithcode">Working with Code</h3><p>Got a streak of geek? We\'ve got you covered there, too. You can write inline <code>&lt;code&gt;</code> blocks really easily with back ticks. Want to show off something more comprehensive? 4 spaces of indentation gets you there.</p><pre><code>.awesome-thing { display: block; width: 100%; }</code></pre><h3 id="readyforabreak">Ready for a Break?</h3><p>Throw 3 or more dashes down on any new line and you\'ve got yourself a fancy new divider. Aw yeah.</p><hr><h3 id="advancedusage">Advanced Usage</h3><p>There\'s one fantastic secret about Markdown. If you want, you can  write plain old HTML and it\'ll still work! Very flexible.</p><p><input type="text" placeholder="I\'m an input field!"></p><p>That should be enough to get you started. Have fun - and let us know what you think :)</p>',
    author: {
        name: "First Last",
        bio: "",
        email: "first.last@email.com"
    }
},
{
    title: 'Node.js Tutorial Part 1', 
    slug: 'tutorial-part-1', 
    scheduled: new Date('2013-12-10'), 
    created: new Date('2013-12-10'), 
    updated: new Date('2014-01-25'),
    excerpt: "You're live! Nice. We've put together a little post to introduce you to the Ghost editor and get you started. You can manage your content by signing in to the admin area at &lt;your blog URL&gt;/ghost/. When you arrive, you can select this post from a list",
    labels: ['Getting Started'],
    author: {
        name: "First Last",
        bio: "",
        email: "first.last@email.com"
    }
},
{
    title: 'Node.js Tutorial Part 2', 
    slug: 'tutorial-part-2', 
    scheduled: new Date('2013-12-19'), 
    created: new Date('2013-12-19'), 
    updated: new Date('2014-01-20'),
    excerpt: "You're live! Nice. We've put together a little post to introduce you to the Ghost editor and get you started. You can manage your content by signing in to the admin area at &lt;your blog URL&gt;/ghost/. When you arrive, you can select this post from a list",
    labels: [],
    author: {
        name: "First Last",
        bio: "",
        email: "first.last@email.com"
    }
},
{
    title: 'How to create currency filter to remove decimal/cents in AngularJS',
    slug: 'currency-filter-remove-decimal-cents-angularjs',
    scheduled: new Date('2014-01-10'), 
    created: new Date('2014-01-10'), 
    updated: new Date('2014-01-10'),
    excerpt: "You're live! Nice. We've put together a little post to introduce you to the Ghost editor and get you started. You can manage your content by signing in to the admin area at &lt;your blog URL&gt;/ghost/. When you arrive, you can select this post from a list",
    labels: ['node.js', 'someother', 'foo bar', 'what is it', 'bhlasd, hasdf', 'sdflkdj', 'authentication', 'jquery', 'Windows Azure'],
    author: {
        name: "First Last",
        bio: "",
        email: "first.last@email.com"
    }
},
{
    title: 'Sails deployed to multiple nodes',
    slug: 'sails-deployed-multiple-nodes',
    scheduled: new Date('2014-02-02'), 
    created: new Date('2014-02-02'), 
    updated: new Date('2014-02-05'),
    excerpt: "You're live! Nice. We've put together a little post to introduce you to the Ghost editor and get you started. You can manage your content by signing in to the admin area at &lt;your blog URL&gt;/ghost/. When you arrive, you can select this post from a list",
    labels: ['node.js', 'javascript'],
    author: {
        name: "First Last",
        bio: "",
        email: "first.last@email.com"
    }
}];

PostProvider.prototype.init = function () {
    return when();
}

PostProvider.prototype.countAll = function () {
    return when(this.dummyData.length);
}

PostProvider.prototype.findAll = function (opts) {
    opts = opts || {};

    var start = opts.skip || 0, 
        end = (opts.limit) ? start + opts.limit : this.dummyData.length - 1;

    return when(this.sort(this.dummyData).slice(start, end));
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

PostProvider.prototype.findByDay = function (year, month, day) {
    // JavaScript Date uses 0-based month index
    month--;

    var items = this.dummyData.filter(function (item) {
        return item.scheduled.getFullYear() === year 
            && item.scheduled.getMonth() === month
            && item.scheduled.getDate() === day;
    });
    
    return when(this.sort(items));
}

PostProvider.prototype.sort = function (posts) {
    posts = posts.slice(0);
    posts.sort(this.sortByDate)

    return posts;
}

PostProvider.prototype.sortByDate = function (a, b) {
    if (a.scheduled > b.scheduled) return -1;
    if (a.scheduled < b.scheduled) return 1;
    return 0;
}