const {URL} = require('url');
const cors = require('cors');
const errors = require('@tryghost/errors');
const config = require('../../../shared/config');

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

    // allow all requests if cors is disabled
    const enableCors = config.get('cors:enabled');
    if (!enableCors) {
        corsOptions.origin = true;
        return callback(null, corsOptions);
    }

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

    // allow the configured host through on any protocol
    const siteUrl = new URL(config.get('url'));
    if (originUrl.host === siteUrl.host) {
        corsOptions.origin = true;
    }

    // allow the configured admin:url host through on any protocol
    if (config.get('admin:url')) {
        const adminUrl = new URL(config.get('admin:url'));
        if (originUrl.host === adminUrl.host) {
            corsOptions.origin = true;
        }
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
