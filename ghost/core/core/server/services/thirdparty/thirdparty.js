const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');
const settings = require('../../../shared/settings-cache');
const urlUtils = require('../../../shared/url-utils');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const jose = require('node-jose');
const SingleUseTokenProvider = require('../members/SingleUseTokenProvider');
const {URL} = require('url');

const issuer = urlUtils.urlFor('admin', true);

const TOKEN_VALIDITY = 5 * 60 * 1000;
const tokenProvider = new SingleUseTokenProvider(models.SingleUseToken, TOKEN_VALIDITY);

const dangerousPrivateKey = settings.get('ghost_private_key');
const keyStore = jose.JWK.createKeyStore();
const keyStoreReady = keyStore.add(dangerousPrivateKey, 'pem');

const getKeyID = async () => {
    const key = await keyStoreReady;
    return key.kid;
};

const messages = {
    accountSuspended: 'Your account was suspended.',
    roleNotMatch: 'The role of the user is invalid.'
};

const VALID_ROLES = ['Administrator', 'Editor', 'Author', 'Contributor'];

/**
 * create or get a thirdparty user
 *
 * @param {*} {email, name, role}
 * @returns
 */
async function getSetUser({email, name, role}) {
    if (!email || !name) {
        throw new errors.ValidationError();
    }

    // if no role is specified, use the default role
    if (!role){
        role = 'Contributor';
    } else if (!VALID_ROLES.includes(role)) {
        throw new errors.ValidationError({
            message: tpl(messages.roleNotMatch)
        });
    }

    // check if user exists  
    let user = await models.User.getByEmail(email, {withRelated: ['roles']});
    if (user) {
        if (user.isInactive()) {
            throw new errors.NoPermissionError({
                message: tpl(messages.accountSuspended)
            });
        }
        // if user exists, update the name and role
        await models.User.edit({
            name,
            roles: [role]
        }, {id: user.id});
    } else {
        // create a new user
        const options = {context: {internal: true}};
        await models.User.add({
            email,
            name,
            password: uuid.v1(),
            roles: [role]
        }, options);
        user = await models.User.getByEmail(email);
    }

    return user;
}

async function genToken({email, name, role}) {
    const user = await getSetUser({email, name, role});
    const kid = await getKeyID();
    const token = jwt.sign({
        userId: user.id
    }, dangerousPrivateKey,{
        issuer,
        expiresIn: '5m',
        algorithm: 'RS256',
        keyid: kid
    });
    return token;
}

function decodeToken(token) {
    return jwt.verify(token, dangerousPrivateKey, {
        algorithms: ['RS256'],
        issuer
    });
}

async function genMemberLoginUrl({email}) {
    const token = await tokenProvider.create({email});
    const type = 'signin';

    const siteUrl = urlUtils.urlFor({relativeUrl: '/members/'}, true);
    const signinURL = new URL(siteUrl);
    signinURL.searchParams.set('token', token);
    signinURL.searchParams.set('action', type);

    return signinURL.toString();
}

module.exports = {
    getSetUser,
    genToken,
    decodeToken,
    genMemberLoginUrl
};
