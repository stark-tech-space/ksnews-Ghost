const Promise = require('bluebird');
const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
const auth = require('../../services/auth');
const thirdparty = require('../../services/thirdparty');
const api = require('./index');

const messages = {
    accessDenied: 'Access Denied.'
};

const session = {
    read(frame) {
        /*
         * TODO
         * Don't query db for user, when new api http wrapper is in we can
         * have direct access to req.user, we can also get access to some session
         * inofrmation too and send it back
         */
        return models.User.findOne({id: frame.options.context.user});
    },
    add(frame) {
        const object = frame.data;

        if (!object || !object.username || !object.password) {
            return Promise.reject(new errors.UnauthorizedError({
                message: tpl(messages.accessDenied)
            }));
        }

        return models.User.check({
            email: object.username,
            password: object.password
        }).then((user) => {
            return Promise.resolve((req, res, next) => {
                req.brute.reset(function (err) {
                    if (err) {
                        return next(err);
                    }
                    req.user = user;
                    auth.session.createSession(req, res, next);
                });
            });
        }).catch(async (err) => {
            if (!errors.utils.isGhostError(err)) {
                throw new errors.UnauthorizedError({
                    message: tpl(messages.accessDenied),
                    err
                });
            }

            if (err.errorType === 'PasswordResetRequiredError') {
                await api.authentication.generateResetToken({
                    password_reset: [{
                        email: object.username
                    }]
                }, frame.options.context);
            }

            throw err;
        });
    },
    delete() {
        return Promise.resolve((req, res, next) => {
            auth.session.destroySession(req, res, next);
        });
    },
    thirdpartyToken(frame) {
        const {token} = frame.data;
        
        if (!token) {
            return Promise.reject(new errors.UnauthorizedError({
                message: tpl(messages.accessDenied)
            }));
        }

        const decoded = thirdparty.decodeToken(token);
        const {userId} = decoded;
        return models.User.findOne({
            id: userId
        }).then((user) => {
            return Promise.resolve((req, res, next) => {
                req.user = user;
                auth.session.createSession(req, res, next);
            });
        }).catch(async (err) => {
            throw err;
        });
    }
};

module.exports = session;
