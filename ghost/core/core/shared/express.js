
const debug = require('@tryghost/debug')('shared:express');
const express = require('express');
const { createLazyRouter } = require('express-lazy-router');
const sentry = require('./sentry');
const Client = require('@elastic/elasticsearch').Client;
const esClient = new Client({
    node: "http://localhost:9200",
    auth: {
        username: "elastic",
        password: "Ksnews123...",
    },
});

const lazyLoad = createLazyRouter();

const searchRouterInit = () => {
    let router = express.Router()

    router.get('/', function (req, res) {
        const { searchKey, limit } = req.query

        esClient.search({
            query: {
                multi_match: {
                    query: searchKey,
                    type: 'phrase',
                    fields: ['title', 'plaintext']
                },
            },
            size: Number(limit),
        }).then(searchResults => {
            const posts = searchResults.hits.hits.map(hit => ({
                id: hit._id,
                slug: hit._source.slug,
                title: hit._source.title,
                updated_at: hit._source.updated_at,
                visibility: 'public',
                plaintext: hit._source.plaintext,
            }))
            res.contentType('application/json');
            res.write(JSON.stringify({ posts }))
            res.end()
        })
    })

    return router;
}


module.exports = (name) => {
    debug('new app start', name);
    const app = express();
    app.set('name', name);

    // Make sure 'req.secure' is valid for proxied requests
    // (X-Forwarded-Proto header will be checked, if present)
    app.enable('trust proxy');

    // Sentry must be our first error handler. Mounting it here means all custom error handlers will come after
    app.use(sentry.errorHandler);

    app.lazyUse = function lazyUse(mountPath, requireFn) {
        app.use(mountPath, lazyLoad(() => {
            debug(`lazy-loading on ${mountPath}`);
            return Promise.resolve(requireFn());
        }));
    };








    app.use('/search', searchRouterInit())




    debug('new app end', name);
    return app;
};

// Wrap the main express router call
// This is mostly an experiment, and can likely be removed soon
module.exports.Router = (name, options) => {
    debug('new Router start', name);

    const router = express.Router(options);

    router.use(sentry.errorHandler);

    debug('new Router end', name);
    return router;
};

module.exports.static = express.static;

// Export the OG module for testing based on the internals
module.exports._express = express;
