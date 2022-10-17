const tpl = require('@tryghost/tpl');
const errors = require('@tryghost/errors');
const models = require('../../models');

const messages = {
    accountSuspended: 'Your account was suspended.'
};

async function getSetUser({email, name, password, role}) {
    // check if user exists  
    let user = await models.User.getByEmail(email);
    if (user) {
        if (user.isInactive()) {
            throw new errors.NoPermissionError({
                message: tpl(messages.accountSuspended)
            });
        }
    } else {
        // create a new user
        const options = {context: {internal: true}};
        await models.User.add({
            email,
            name,
            password,
            roles: [role]
        }, options);
        user = await models.User.getByEmail({email: email});
    }

    return user;
}

module.exports = {
    getSetUser
};
