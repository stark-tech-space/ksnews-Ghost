const {URL} = require('url');
const cors = require('cors');
const errors = require('@tryghost/errors');
const config = require('../../../../shared/config');

/**
 * Dynamically configures the expressjs/cors middleware
 *
 * @param {import('express').Request} req
 * @param {Function} callback
 */
function corsOptionsDelegate(req, callback) {
    const origin = req.header('Origin');
    const corsOptions = {
        origin: false, // disallow cross-origin requests by default
        credentials: true, // required to allow admin-client to login to private sites
        maxAge: config.get('caching:cors:maxAge')
    };

    if (!origin || origin === 'null') {
        return callback(null, corsOptions);
    }

    let originUrl;
    try {
        originUrl = new URL(origin);
    } catch (err) {
        return callback(new errors.BadRequestError({err}));
    }

    // originUrl will definitely exist here because according to WHATWG URL spec
    // The class constructor will either throw a TypeError or return a URL object
    // https://url.spec.whatwg.org/#url-class

    // allow all localhost and 127.0.0.1 requests no matter the port
    if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
        corsOptions.origin = true;
    }

    // 增加允许微前端的跨域
    if (config.get('microFrontend:url')) {
        const microFrontendUrl = new URL(config.get('microFrontend:url'));
        if (originUrl.host === microFrontendUrl.host) {
            corsOptions.origin = true;
        }
    }

    callback(null, corsOptions);
}

module.exports = cors(corsOptionsDelegate);
